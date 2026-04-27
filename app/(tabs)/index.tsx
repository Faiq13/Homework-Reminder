import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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
      console.error("Gagal load data", e);
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

  const getCalendarId = async () => {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const modifiable = calendars.filter(c => c.allowsModifications);
    return modifiable.length > 0 ? modifiable[0].id : null;
  };

  const scheduleReminder = async () => {
    if (!task || !hasSelectedDate || !hasSelectedTime) {
      Alert.alert("Eror", "Lengkapi data tugas!");
      return;
    }

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Eror', 'Butuh izin kalender!');
        return;
      }

      const finalDeadline = new Date(date);
      finalDeadline.setHours(time.getHours());
      finalDeadline.setMinutes(time.getMinutes());

      const calendarId = await getCalendarId();
      if (calendarId) {
        const startTime = new Date(finalDeadline);
        startTime.setHours(startTime.getHours() - 1);

        await Calendar.createEventAsync(calendarId, {
          title: `🔴 DEADLINE: ${task}`,
          startDate: startTime,
          endDate: finalDeadline,
          timeZone: 'Asia/Jakarta',
          // KRITIK TEMAN: Alarm hanya 1 jam sebelum (Terlalu mepet)
          alarms: [{ relativeOffset: -60 }] 
        });
      }

      const newTask: Task = {
        id: Date.now().toString(),
        title: task,
        date: date.toISOString().split('T')[0],
        time: time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        completed: false,
      };

      const existingTasks = await AsyncStorage.getItem('user_tasks');
      const tasksArray = existingTasks ? JSON.parse(existingTasks) : [];
      tasksArray.push(newTask);
      await AsyncStorage.setItem('user_tasks', JSON.stringify(tasksArray));
      setAllTasks(tasksArray);
      Alert.alert("Sukses", "Tugas sinkron ke kalender (Reminder 1 jam).");
    } catch (e) {
      Alert.alert("Eror", "Gagal sinkron.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Homework Reminder v3.0</Text>
      <View style={styles.inputArea}>
        <TextInput style={styles.input} placeholder="Nama tugas..." value={task} onChangeText={setTask} />
        <TouchableOpacity style={styles.selector} onPress={() => setShowDatePicker(true)}>
          <Text>{hasSelectedDate ? date.toLocaleDateString() : "Pilih Tanggal"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.selector} onPress={() => setShowTimePicker(true)}>
          <Text>{hasSelectedTime ? time.toLocaleTimeString() : "Pilih Jam"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={scheduleReminder}>
          <Text style={styles.buttonText}>Sinkron Kalender</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={allTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text>{item.date} • {item.time}</Text>
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
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  taskCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  taskTitle: { fontSize: 16, fontWeight: 'bold' }
});