import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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

  const saveTask = async () => {
    if (!task || !hasSelectedDate || !hasSelectedTime) {
      Alert.alert("Eror", "Lengkapi nama tugas, tanggal, dan jam!");
      return;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timeString = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newTask: Task = {
      id: Date.now().toString(),
      title: task,
      date: `${year}-${month}-${day}`,
      time: timeString,
      completed: false,
    };

    const existingTasks = await AsyncStorage.getItem('user_tasks');
    const tasksArray = existingTasks ? JSON.parse(existingTasks) : [];
    tasksArray.push(newTask);
    
    await AsyncStorage.setItem('user_tasks', JSON.stringify(tasksArray));
    setAllTasks(tasksArray);
    setTask('');
    setHasSelectedDate(false);
    setHasSelectedTime(false);
    Alert.alert("Sukses", "Tugas dengan waktu deadline disimpan.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Homework Reminder v2.0</Text>
      
      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder="Nama tugas kuliah..." 
          value={task}
          onChangeText={setTask}
        />
        
        <TouchableOpacity style={styles.selector} onPress={() => setShowDatePicker(true)}>
          <Text style={{ color: hasSelectedDate ? '#333' : '#999' }}>
            <Ionicons name="calendar-outline" size={16} /> {hasSelectedDate ? date.toLocaleDateString('id-ID') : "Pilih Tanggal"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.selector} onPress={() => setShowTimePicker(true)}>
          <Text style={{ color: hasSelectedTime ? '#333' : '#999' }}>
            <Ionicons name="time-outline" size={16} /> {hasSelectedTime ? time.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : "Pilih Jam"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={saveTask}>
          <Text style={styles.buttonText}>Simpan Tugas</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker value={date} mode="date" minimumDate={new Date()} onChange={onDateChange} />
      )}

      {showTimePicker && (
        <DateTimePicker value={time} mode="time" is24Hour={true} onChange={onTimeChange} />
      )}

      <FlatList
        data={allTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={{fontSize: 12, color: '#888'}}>{item.date} • {item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 },
  inputArea: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 25 },
  input: { borderBottomWidth: 1, borderColor: '#eee', marginBottom: 15, padding: 10 },
  selector: { padding: 12, backgroundColor: '#f8f9fa', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  taskCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  taskTitle: { fontSize: 16, fontWeight: 'bold' }
});