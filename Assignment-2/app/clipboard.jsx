import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSurvey } from '../context/SurveyContext';
import { Ionicons } from '@expo/vector-icons';

export default function ClipboardScreen() {
  const [clipboardContent, setClipboardContent] = useState('');
  const [pastedNotes, setPastedNotes] = useState('');
  const { draftSurvey, updateDraft } = useSurvey();

  const fetchClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    setClipboardContent(text);
  };

  useEffect(() => {
    fetchClipboard();
  }, []);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    setPastedNotes((prev) => prev ? `${prev}\n${text}` : text);
    Alert.alert('Success', 'Notes pasted from clipboard');
  };

  const handleClearClipboard = async () => {
    await Clipboard.setStringAsync('');
    setClipboardContent('');
    Alert.alert('Cleared', 'Clipboard data cleared');
  };

  const copyToClipboard = async (text, label) => {
    if (!text) {
      Alert.alert('Error', `${label} is not available`);
      return;
    }
    await Clipboard.setStringAsync(text);
    fetchClipboard();
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const saveNotes = () => {
    updateDraft({ notes: pastedNotes });
    Alert.alert('Saved', 'Notes saved to survey draft');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Clipboard Manager</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Copy Data from Draft</Text>
        
        <TouchableOpacity style={styles.actionRow} onPress={() => copyToClipboard('SURVEY-' + Math.floor(Math.random() * 10000), 'Survey ID')}>
          <Ionicons name="pricetag" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Copy Survey ID</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={() => copyToClipboard(draftSurvey.contact?.number || '', 'Contact Number')}>
          <Ionicons name="call" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Copy Contact Number</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={() => {
          const locStr = draftSurvey.location ? `${draftSurvey.location.lat}, ${draftSurvey.location.lng}` : '';
          copyToClipboard(locStr, 'Current Location');
        }}>
          <Ionicons name="location" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Copy Current Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Clipboard Data</Text>
        <Text style={styles.clipboardText}>{clipboardContent || 'Empty'}</Text>
        <TouchableOpacity style={[styles.button, styles.clearBtn]} onPress={handleClearClipboard}>
          <Text style={styles.buttonText}>Clear Clipboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Paste Notes</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          value={pastedNotes}
          onChangeText={setPastedNotes}
          placeholder="Paste or type notes here..." />
        
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.button, styles.pasteBtn, { flex: 1, marginRight: 5 }]} onPress={handlePaste}>
            <Text style={styles.buttonText}>Paste</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.saveBtn, { flex: 1, marginLeft: 5 }]} onPress={saveNotes}>
            <Text style={styles.buttonText}>Save Notes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  actionText: { fontSize: 16, marginLeft: 12, color: '#007AFF' },
  clipboardText: { fontSize: 14, color: '#555', fontStyle: 'italic', marginBottom: 12, padding: 10, backgroundColor: '#f1f3f5', borderRadius: 8 },
  button: { padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  clearBtn: { backgroundColor: '#dc3545' },
  pasteBtn: { backgroundColor: '#6c757d' },
  saveBtn: { backgroundColor: '#28a745' },
  textArea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', marginBottom: 12 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between' }
});