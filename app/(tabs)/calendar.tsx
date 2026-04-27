import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Melokalkan kalender ke Bahasa Indonesia agar relevan
LocaleConfig.locales['id'] = {
  monthNames: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
  monthNamesShort: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'],
  dayNames: ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],
  dayNamesShort: ['Min','Sen','Sel','Rab','Kam','Jum','Sab'],
  today: 'Hari ini'
};
LocaleConfig.defaultLocale = 'id';

export default function CalendarScreen() {
  const [allTasks, setAllTasks] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);

  // Memicu ulang data setiap kali Anda mengklik tab Kalender
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    try {
      const data = await AsyncStorage.getItem('user_tasks');
      if (data) {
        const tasks = JSON.parse(data);
        setAllTasks(tasks);
        generateMarkings(tasks, selectedDate);
      }
    } catch (e) {
      console.error("Gagal memuat data", e);
    }
  };

  // Algoritma Transformasi Data (Dari Array ke Object MarkedDates)
  const generateMarkings = (tasks, currentSelected) => {
    let marks = {};

    tasks.forEach(task => {
      // Jika belum ada tanggal ini di object, inisialisasi array dots
      if (!marks[task.date]) {
        marks[task.date] = { dots: [] };
      }
      
      // Tambahkan titik: Biru untuk aktif, Hijau untuk selesai
      marks[task.date].dots.push({ 
        key: task.id, 
        color: task.completed ? '#34C759' : '#007AFF' 
      });
    });

    // Beri efek highlight (blok warna) pada tanggal yang sedang diklik pengguna
    if (currentSelected) {
      marks[currentSelected] = { 
        ...marks[currentSelected], 
        selected: true, 
        selectedColor: '#E5F1FF', 
        selectedTextColor: '#007AFF' 
      };
    }

    setMarkedDates(marks);
  };

  // Aksi saat pengguna menekan tanggal di kalender
  const onDayPress = (day) => {
    const clickedDate = day.dateString;
    setSelectedDate(clickedDate);
    
    // Refresh marking agar highlight berpindah ke tanggal baru
    generateMarkings(allTasks, clickedDate); 
    
    // Filter array utama untuk menampilkan tugas HANYA pada tanggal tersebut
    const tasksForDay = allTasks.filter(t => t.date === clickedDate);
    setFilteredTasks(tasksForDay);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Peta Deadline</Text>
      
      {/* Komponen Inti Kalender */}
      <Calendar
        markingType={'multi-dot'}
        markedDates={markedDates}
        onDayPress={onDayPress}
        theme={{
          todayTextColor: '#007AFF',
          arrowColor: '#007AFF',
          dotStyle: { width: 5, height: 5, borderRadius: 2.5 }
        }}
      />

      <View style={styles.listContainer}>
        <Text style={styles.subtitle}>
          {selectedDate ? `Rincian: ${selectedDate}` : 'Pilih tanggal di kalender'}
        </Text>
        
        {/* Render daftar tugas yang sudah difilter */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
              <Ionicons 
                name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={item.completed ? "#34C759" : "#007AFF"} 
                style={{marginRight: 10}}
              />
              <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
                {item.title}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {selectedDate ? 'Tidak ada beban tugas di tanggal ini.' : 'Pilih tanggal untuk melihat jadwal.'}
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9', paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  listContainer: { flex: 1, padding: 20 },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#666', marginBottom: 15 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#007AFF', elevation: 2 },
  taskCardCompleted: { borderLeftColor: '#34C759', opacity: 0.6 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, color: '#333' },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: '#999' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' }
});