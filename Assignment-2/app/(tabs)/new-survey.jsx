import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSurvey } from '../../context/SurveyContext';

export default function NewSurveyScreen() {
  const router = useRouter();
  const { updateDraft, draftSurvey } = useSurvey();

  const [siteName, setSiteName] = useState(draftSurvey.siteName || '');
  const [clientName, setClientName] = useState(draftSurvey.clientName || '');
  const [description, setDescription] = useState(draftSurvey.description || '');
  const [priority, setPriority] = useState(draftSurvey.priority || 'Medium');

  const handleNext = () => {
    if (!siteName.trim() || !clientName.trim() || !description.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    updateDraft({
      siteName,
      clientName,
      description,
      priority,
      date: draftSurvey.date || new Date().toISOString()
    });

    router.push('/preview');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Survey</Text>
      
      <Text style={styles.label}>Site Name *</Text>
      <TextInput style={styles.input} value={siteName} onChangeText={setSiteName} placeholder="Enter site name" />

      <Text style={styles.label}>Client Name *</Text>
      <TextInput style={styles.input} value={clientName} onChangeText={setClientName} placeholder="Enter client name" />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
        numberOfLines={4} />
      

      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityContainer}>
        {['Low', 'Medium', 'High'].map((level) =>
        <TouchableOpacity
          key={level}
          style={[styles.priorityButton, priority === level && styles.prioritySelected]}
          onPress={() => setPriority(level)}>
          
            <Text style={[styles.priorityText, priority === level && styles.priorityTextSelected]}>
              {level}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next (Preview & Submit)</Text>
      </TouchableOpacity>
    </ScrollView>);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  priorityContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  priorityButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#007AFF', borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  prioritySelected: { backgroundColor: '#007AFF' },
  priorityText: { color: '#007AFF', fontWeight: '600' },
  priorityTextSelected: { color: '#fff' },
  nextButton: { backgroundColor: '#28a745', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});