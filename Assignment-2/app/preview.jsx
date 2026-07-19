import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useSurvey } from '../context/SurveyContext';
import { useRouter } from 'expo-router';

export default function PreviewScreen() {
  const { draftSurvey, addSurvey, clearDraft } = useSurvey();
  const router = useRouter();

  const handleSubmit = () => {
    if (!draftSurvey.siteName || !draftSurvey.clientName) {
      Alert.alert('Error', 'Missing required fields. Please edit the survey.');
      return;
    }

    const newSurvey = {
      id: Math.random().toString(36).substring(2, 9),
      siteName: draftSurvey.siteName,
      clientName: draftSurvey.clientName,
      description: draftSurvey.description || '',
      priority: draftSurvey.priority || 'Medium',
      date: draftSurvey.date || new Date().toISOString(),
      photoUri: draftSurvey.photoUri,
      location: draftSurvey.location,
      contact: draftSurvey.contact,
      notes: draftSurvey.notes
    };

    addSurvey(newSurvey);
    clearDraft();
    Alert.alert('Success', 'Survey submitted successfully!');
    router.replace('/(tabs)/history');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Survey Preview</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>General Info</Text>
        <Text style={styles.text}><Text style={styles.label}>Site Name:</Text> {draftSurvey.siteName || 'N/A'}</Text>
        <Text style={styles.text}><Text style={styles.label}>Client Name:</Text> {draftSurvey.clientName || 'N/A'}</Text>
        <Text style={styles.text}><Text style={styles.label}>Description:</Text> {draftSurvey.description || 'N/A'}</Text>
        <Text style={styles.text}><Text style={styles.label}>Priority:</Text> {draftSurvey.priority || 'Medium'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Location Data</Text>
        <Text style={styles.text}>
          {draftSurvey.location ? `Lat: ${draftSurvey.location.lat.toFixed(6)}, Lng: ${draftSurvey.location.lng.toFixed(6)}` : 'No location attached'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contact Person</Text>
        <Text style={styles.text}>
          {draftSurvey.contact ? `${draftSurvey.contact.name} (${draftSurvey.contact.number})` : 'No contact attached'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.text}>{draftSurvey.notes || 'No notes added'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Photo</Text>
        {draftSurvey.photoUri ?
        <Image source={{ uri: draftSurvey.photoUri }} style={styles.image} /> :

        <Text style={styles.text}>No photo attached</Text>
        }
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={[styles.button, styles.editBtn]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Edit Survey</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.submitBtn]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Survey</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 12 },
  text: { fontSize: 16, marginBottom: 6, color: '#333' },
  label: { fontWeight: 'bold' },
  image: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  button: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  editBtn: { backgroundColor: '#6c757d' },
  submitBtn: { backgroundColor: '#28a745' }
});