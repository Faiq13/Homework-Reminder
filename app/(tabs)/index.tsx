import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export default function Index() {
  const [task, setTask] = useState<string>('');
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

  const saveTask = async () => {
    if (!task) {
      Alert.alert("Eror", "Isi nama tugas!");
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: task,
      completed: false,
    };

    const existingTasks = await AsyncStorage.getItem('user_tasks');
    const tasksArray = existingTasks ? JSON.parse(existingTasks) : [];
    tasksArray.push(newTask);
    
    await AsyncStorage.setItem('user_tasks', JSON.stringify(tasksArray));
    setAllTasks(tasksArray);
    setTask('');
    Alert.alert("Sukses", "Tugas disimpan di lokal.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Homework Reminder v1.0</Text>
      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder="Nama tugas kuliah..." 
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.button} onPress={saveTask}>
          <Text style={styles.buttonText}>Simpan Tugas</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={allTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.title}</Text>
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
  input: { borderBottomWidth: 1, borderColor: '#eee', marginBottom: 20, padding: 10 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  taskCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  taskTitle: { fontSize: 16, fontWeight: 'bold' }
});