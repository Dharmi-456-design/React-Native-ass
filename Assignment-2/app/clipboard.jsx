import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSurvey } from '../context/SurveyContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ClipboardScreen() {
  const [clipboardContent, setClipboardContent] = useState('');
  const [pastedNotes, setPastedNotes] = useState('');
  const { draftSurvey, updateDraft } = useSurvey();
  const { theme } = useTheme();
  const router = useRouter();
  const s = makeStyles(theme);

  const fetchClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      setClipboardContent(text);
    } catch (error) {
      console.warn('Clipboard permission denied or unavailable:', error);
      setClipboardContent('Clipboard access blocked/unavailable');
    }
  };

  useEffect(() => {
    fetchClipboard();
  }, []);

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      setPastedNotes((prev) => prev ? `${prev}\n${text}` : text);
      Alert.alert('Pasted ✅', 'Notes pasted from clipboard.');
    } catch (error) {
      Alert.alert(
        'Permission Denied',
        'Could not access the system clipboard. Please check your browser/app permissions or paste manually.'
      );
    }
  };

  const handleClearClipboard = async () => {
    try {
      await Clipboard.setStringAsync('');
      setClipboardContent('');
      Alert.alert('Cleared ✅', 'Clipboard data cleared.');
    } catch (error) {
      Alert.alert('Error', 'Failed to modify clipboard.');
    }
  };

  const copyToClipboard = async (text, label) => {
    if (!text) {
      Alert.alert('Error', `${label} is not available`);
      return;
    }
    await Clipboard.setStringAsync(text);
    fetchClipboard();
    Alert.alert('Copied ✅', `${label} copied to clipboard.`);
  };

  const saveNotes = () => {
    updateDraft({ notes: pastedNotes });
    if (Platform.OS === 'web') {
      alert('Notes saved successfully!');
      router.push('/preview');
    } else {
      Alert.alert('Saved ✅', 'Notes saved successfully!', [
        { text: 'Go to Preview', onPress: () => router.push('/preview') },
        { text: 'Stay Here', style: 'cancel' }
      ]);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>Clipboard Manager</Text>
      <Text style={s.subtitle}>Quickly copy and paste survey data</Text>

      {/* Copy Data Section */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Copy Data from Draft</Text>
        
        <TouchableOpacity style={s.actionRow} onPress={() => copyToClipboard('SURVEY-' + Math.floor(Math.random() * 10000), 'Survey ID')}>
          <Ionicons name="pricetag-outline" size={20} color={theme.primary} />
          <Text style={s.actionText}>Copy Survey ID</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={s.actionRow} onPress={() => copyToClipboard(draftSurvey.contact?.number || '', 'Contact Number')}>
          <Ionicons name="call-outline" size={20} color={theme.primary} />
          <Text style={s.actionText}>Copy Contact Number</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.actionRow, { borderBottomWidth: 0 }]} onPress={() => {
          const locStr = draftSurvey.location ? `${draftSurvey.location.lat}, ${draftSurvey.location.lng}` : '';
          copyToClipboard(locStr, 'Current Location');
        }}>
          <Ionicons name="location-outline" size={20} color={theme.primary} />
          <Text style={s.actionText}>Copy Current Location</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.textLight} />
        </TouchableOpacity>
      </View>

      {/* Clipboard Status Section */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Current Clipboard Data</Text>
        <Text style={s.clipboardText}>{clipboardContent || 'Empty'}</Text>
        <TouchableOpacity style={[s.button, { backgroundColor: theme.danger }]} onPress={handleClearClipboard}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={s.buttonText}>Clear Clipboard</Text>
        </TouchableOpacity>
      </View>

      {/* Paste & Edit Notes Section */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Paste Notes</Text>
        <TextInput
          style={s.textArea}
          multiline
          numberOfLines={4}
          value={pastedNotes}
          onChangeText={setPastedNotes}
          placeholder="Paste or type notes here..."
          placeholderTextColor={theme.textLight}
        />
        
        <View style={s.btnRow}>
          <TouchableOpacity style={[s.button, { backgroundColor: '#65676B', flex: 1 }]} onPress={handlePaste}>
            <Ionicons name="clipboard-outline" size={18} color="#fff" />
            <Text style={s.buttonText}>Paste</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.button, { backgroundColor: theme.success, flex: 1.2 }]} onPress={saveNotes}>
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={s.buttonText}>Save Notes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: theme.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: theme.textMuted, marginTop: 4, marginBottom: 24, fontWeight: '500' },
  card: { backgroundColor: theme.card, padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: theme.border },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border, gap: 12 },
  actionText: { fontSize: 15, color: theme.primary, fontWeight: '600', flex: 1 },
  clipboardText: { fontSize: 14, color: theme.textMuted, fontStyle: 'italic', marginBottom: 16, padding: 14, backgroundColor: theme.bg, borderRadius: 12, borderWidth: 1, borderColor: theme.border, lineHeight: 20 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8 },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 15 },
  textArea: { borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 12, padding: 14, height: 120, textAlignVertical: 'top', marginBottom: 16, fontSize: 15, backgroundColor: theme.inputBg, color: theme.text },
  btnRow: { flexDirection: 'row', gap: 12 }
});