import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSurvey } from '../../context/SurveyContext';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const router = useRouter();
  const { surveys } = useSurvey();

  const todaysSurveys = surveys.filter((s) => {
    const today = new Date().toISOString().split('T')[0];
    return s.date.startsWith(today);
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, John Doe!</Text>
        <Text style={styles.studentDetails}>Student ID: 2026-REACT-001</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Today&apos;s Surveys</Text>
        <Text style={styles.statsCount}>{todaysSurveys.length}</Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/new-survey')}>
          <Ionicons name="add-circle" size={32} color="#007AFF" />
          <Text style={styles.actionText}>New Survey</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/camera')}>
          <Ionicons name="camera" size={32} color="#28a745" />
          <Text style={styles.actionText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/location')}>
          <Ionicons name="location" size={32} color="#dc3545" />
          <Text style={styles.actionText}>Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/contacts')}>
          <Ionicons name="people" size={32} color="#ffc107" />
          <Text style={styles.actionText}>Contacts</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Surveys</Text>
      {surveys.length === 0 ?
      <Text style={styles.emptyText}>No recent surveys found.</Text> :

      surveys.slice(-3).reverse().map((s) => (
      <View key={s.id} style={styles.recentCard}>
            <Text style={styles.recentTitle}>{s.siteName}</Text>
            <Text style={styles.recentClient}>{s.clientName}</Text>
            <Text style={styles.recentDate}>{new Date(s.date).toLocaleDateString()}</Text>
          </View>
      ))
      }
    </ScrollView>);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  header: { marginBottom: 20 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  studentDetails: { fontSize: 16, color: '#666', marginTop: 4 },
  statsCard: { backgroundColor: '#007AFF', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  statsTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  statsCount: { color: 'white', fontSize: 36, fontWeight: 'bold', marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  actionCard: { width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  actionText: { marginTop: 8, fontSize: 14, fontWeight: '600', color: '#333' },
  recentCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 1 },
  recentTitle: { fontSize: 16, fontWeight: 'bold' },
  recentClient: { fontSize: 14, color: '#555', marginTop: 4 },
  recentDate: { fontSize: 12, color: '#888', marginTop: 8 },
  emptyText: { color: '#888', fontStyle: 'italic' }
});