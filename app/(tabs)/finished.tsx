import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router'; // Penting agar data refresh saat tab dibuka
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Task { id: string; title: string; date: string; completed: boolean; }

export default function FinishedScreen() {
  const [finishedTasks, setFinishedTasks] = useState<Task[]>([]);

  // useFocusEffect akan memicu loadTasks setiap kali Anda membuka tab ini
  useFocusEffect(
    useCallback(() => {
      loadFinishedTasks();
    }, [])
  );

  const loadFinishedTasks = async () => {
    const data = await AsyncStorage.getItem('user_tasks');
    if (data) {
      const all: Task[] = JSON.parse(data);
      setFinishedTasks(all.filter(t => t.completed === true));
    }
  };

  const uncheckTask = async (taskId: string) => {
    const data = await AsyncStorage.getItem('user_tasks');
    if (data) {
      let all: Task[] = JSON.parse(data);
      all = all.map(t => t.id === taskId ? { ...t, completed: false } : t);
      await AsyncStorage.setItem('user_tasks', JSON.stringify(all));
      loadFinishedTasks(); // Refresh layar
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tugas Selesai</Text>
      <FlatList
        data={finishedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <TouchableOpacity onPress={() => uncheckTask(item.id)} style={{ marginRight: 15 }}>
              <Ionicons name="checkmark-circle" size={28} color="#34C759" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.taskTitle, { textDecorationLine: 'line-through', color: '#999' }]}>{item.title}</Text>
              <Text style={styles.taskDate}>Diselesaikan dengan baik.</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{textAlign: 'center', color: '#999'}}>Belum ada tugas yang diselesaikan.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9', paddingTop: 50, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, opacity: 0.7 },
  taskTitle: { fontSize: 16, fontWeight: 'bold' },
  taskDate: { fontSize: 14, color: '#666' }
});