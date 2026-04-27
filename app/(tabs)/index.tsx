import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  completed: boolean;
}

export default function Index() {
  const [task, setTask] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [hasSelectedDate, setHasSelectedDate] = useState<boolean>(false);
  
  const [time, setTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [hasSelectedTime, setHasSelectedTime] = useState<boolean>(false);

  const [allTasks, setAllTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await AsyncStorage.getItem('user_tasks');
      if (data) setAllTasks(JSON.parse(data));
    } catch (e) {
      console.error("Gagal memuat data", e);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      setHasSelectedDate(true);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date): void => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
      setHasSelectedTime(true);
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const updatedTasks = allTasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      setAllTasks(updatedTasks);
      await AsyncStorage.setItem('user_tasks', JSON.stringify(updatedTasks));
    } catch (e) {
      console.error("Gagal update status", e);
    }
  };

  // ==========================================
  // ALGORITMA PELACAK KALENDER (BULLETPROOF)
  // ==========================================
  const getBulletproofCalendarId = async () => {
    if (Platform.OS === 'ios') {
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();
      return defaultCalendar.id;
    }
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const modifiable = calendars.filter(c => c.allowsModifications);
    if (modifiable.length === 0) throw new Error("Akses kalender terkunci.");
    const google = modifiable.find(c => c.source.type === 'com.google');
    if (google) return google.id;
    const primary = modifiable.find(c => c.isPrimary);
    if (primary) return primary.id;
    return modifiable[0].id;
  };

  const scheduleReminder = async (): Promise<void> => {
    if (!task || !hasSelectedDate || !hasSelectedTime) {
      Alert.alert("Data Tidak Lengkap", "Isi nama tugas, tanggal, dan jam deadline.");
      return;
    }

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Akses Ditolak', 'Butuh izin kalender.');
        return;
      }

      const finalDeadline = new Date(date);
      finalDeadline.setHours(time.getHours(), time.getMinutes(), 0);

      const now = new Date();
      if (finalDeadline <= now) {
        Alert.alert("Waktu Tidak Valid", "Jangan pilih masa lalu.");
        return;
      }

      const calendarId = await getBulletproofCalendarId();
      const startTime = new Date(finalDeadline);
      startTime.setHours(startTime.getHours() - 1);

      await Calendar.createEventAsync(calendarId, {
        title: `🔴 DEADLINE: ${task}`,
        startDate: startTime,
        endDate: finalDeadline,
        timeZone: 'Asia/Jakarta',
        notes: "Dibuat otomatis oleh Homework Reminder v4.0",
        // IMPLEMENTASI USULAN TEMAN (STRATEGI PENGINGAT BERLAPIS)
        alarms: [
          { relativeOffset: -2880 }, // H-2
          { relativeOffset: -1440 }, // H-1
          { relativeOffset: -120 },  // 2 Jam
          { relativeOffset: -60 },   // 1 Jam
          { relativeOffset: 0 }      // Jam H
        ]
      });

      const year = finalDeadline.getFullYear();
      const month = String(finalDeadline.getMonth() + 1).padStart(2, '0');
      const day = String(finalDeadline.getDate()).padStart(2, '0');
      
      const newTask: Task = {
        id: Date.now().toString(),
        title: task,
        date: `${year}-${month}-${day}`,
        time: time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        completed: false,
      };

      const existingTasks = await AsyncStorage.getItem('user_tasks');
      const tasksArray: Task[] = existingTasks ? JSON.parse(existingTasks) : [];
      tasksArray.push(newTask);
      await AsyncStorage.setItem('user_tasks', JSON.stringify(tasksArray));
      setAllTasks(tasksArray);

      Alert.alert("Sukses", "Tugas disimpan dengan pertahanan berlapis!");
      setTask('');
      setHasSelectedDate(false);
      setHasSelectedTime(false);
    } catch (error) {
      Alert.alert("Eror Sistem", "Gagal sinkron.");
    }
  };

  const activeTasks = allTasks.filter(task => !task.completed);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Homework Reminder</Text>
      <View style={styles.inputArea}>
        <TextInput style={styles.input} placeholder="Nama tugas kuliah..." value={task} onChangeText={setTask} />
        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
          <Text style={{ color: hasSelectedDate ? '#333' : '#999' }}>
            <Ionicons name="calendar-outline" size={18} color="#007AFF" /> 
            {" "}{hasSelectedDate ? date.toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : "Pilih Tanggal"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowTimePicker(true)}>
          <Text style={{ color: hasSelectedTime ? '#333' : '#999' }}>
            <Ionicons name="time-outline" size={18} color="#007AFF" /> 
            {" "}{hasSelectedTime ? time.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}) : "Pilih Jam"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={scheduleReminder}>
          <Text style={styles.buttonText}>Pasang Alarm Presisi</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && <DateTimePicker value={date} mode="date" minimumDate={new Date()} onChange={onDateChange} />}
      {showTimePicker && <DateTimePicker value={time} mode="time" is24Hour={true} onChange={onTimeChange} />}

      <View style={styles.listArea}>
        <Text style={styles.subtitle}>Tugas Aktif ({activeTasks.length})</Text>
        <FlatList
          data={activeTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)} style={{ marginRight: 15 }}>
                <Ionicons name="ellipse-outline" size={28} color="#007AFF" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskDate}>{item.date} • {item.time}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>Tugas selesai semua!</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginBottom: 25 },
  inputArea: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 4, marginBottom: 25 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  input: { borderBottomWidth: 1, borderColor: '#eee', marginBottom: 20, padding: 10, fontSize: 16 },
  dateSelector: { padding: 12, backgroundColor: '#f8f9fa', borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  listArea: { flex: 1 },
  taskCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  taskDate: { fontSize: 13, color: '#888', marginTop: 4 }
});