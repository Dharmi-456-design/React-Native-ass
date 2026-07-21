import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSurvey } from '../../context/SurveyContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const PRIORITIES = ['Low', 'Medium', 'High'];
const PRIORITY_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

export default function NewSurveyScreen() {
  const router = useRouter();
  const { updateDraft, clearDraft } = useSurvey();
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  const [siteNameError, setSiteNameError] = useState(false);
  const [clientNameError, setClientNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

  // Every time this screen comes into focus, wipe the draft and reset all fields
  // so a second new survey always starts completely empty.
  useFocusEffect(
    useCallback(() => {
      clearDraft();
      setSiteName('');
      setClientName('');
      setDescription('');
      setPriority('Medium');
      setSiteNameError(false);
      setClientNameError(false);
      setDescriptionError(false);
    }, [])
  );

  const handleNext = () => {
    let hasError = false;

    if (!siteName.trim()) {
      setSiteNameError(true);
      hasError = true;
    } else {
      setSiteNameError(false);
    }

    if (!clientName.trim()) {
      setClientNameError(true);
      hasError = true;
    } else {
      setClientNameError(false);
    }

    if (!description.trim()) {
      setDescriptionError(true);
      hasError = true;
    } else {
      setDescriptionError(false);
    }

    if (hasError) {
      Alert.alert('Required Fields Missing', 'Please fill in all the required fields first.');
      return;
    }

    updateDraft({
      siteName: siteName.trim(),
      clientName: clientName.trim(),
      description: description.trim(),
      priority,
      date: draftSurvey.date || new Date().toISOString(),
    });
    router.push('/preview');
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>New Survey</Text>
      <Text style={s.subtitle}>Fill in all the required fields to proceed</Text>

      {/* Site Name */}
      <Text style={s.label}>Site Name <Text style={{ color: theme.danger }}>*</Text></Text>
      <View style={[s.inputWrapper, siteNameError && { borderColor: theme.danger }]}>
        <Ionicons name="business-outline" size={18} color={siteNameError ? theme.danger : theme.textMuted} style={{ marginRight: 10 }} />
        <TextInput
          style={s.input}
          value={siteName}
          onChangeText={(val) => {
            setSiteName(val);
            updateDraft({ siteName: val });
            if (val.trim()) setSiteNameError(false);
          }}
          placeholder="Enter site name"
          placeholderTextColor={theme.textLight}
        />
      </View>
      {siteNameError && <Text style={s.errorHelper}>Please fill in the Site Name</Text>}

      {/* Client Name */}
      <Text style={s.label}>Client Name <Text style={{ color: theme.danger }}>*</Text></Text>
      <View style={[s.inputWrapper, clientNameError && { borderColor: theme.danger }]}>
        <Ionicons name="person-outline" size={18} color={clientNameError ? theme.danger : theme.textMuted} style={{ marginRight: 10 }} />
        <TextInput
          style={s.input}
          value={clientName}
          onChangeText={(val) => {
            setClientName(val);
            updateDraft({ clientName: val });
            if (val.trim()) setClientNameError(false);
          }}
          placeholder="Enter client name"
          placeholderTextColor={theme.textLight}
        />
      </View>
      {clientNameError && <Text style={s.errorHelper}>Please fill in the Client Name</Text>}

      {/* Description */}
      <Text style={s.label}>Description <Text style={{ color: theme.danger }}>*</Text></Text>
      <TextInput
        style={[s.textArea, descriptionError && { borderColor: theme.danger }]}
        value={description}
        onChangeText={(val) => {
          setDescription(val);
          updateDraft({ description: val });
          if (val.trim()) setDescriptionError(false);
        }}
        placeholder="Describe the survey location and purpose…"
        placeholderTextColor={theme.textLight}
        multiline
        numberOfLines={4}
      />
      {descriptionError && <Text style={s.errorHelper}>Please fill in the Description</Text>}

      {/* Priority */}
      <Text style={s.label}>Priority Level</Text>
      <View style={s.priorityRow}>
        {PRIORITIES.map((level) => {
          const isSelected = priority === level;
          const color = PRIORITY_COLORS[level];
          return (
            <TouchableOpacity
              key={level}
              style={[s.priorityBtn, isSelected && { backgroundColor: color, borderColor: color }]}
              onPress={() => {
                setPriority(level);
                updateDraft({ priority: level });
              }}>
              <View style={[s.priorityDot, { backgroundColor: isSelected ? '#fff' : color }]} />
              <Text style={[s.priorityBtnText, isSelected && { color: '#fff' }]}>{level}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Next Button */}
      <TouchableOpacity style={s.nextBtn} onPress={handleNext} activeOpacity={0.85}>
        <Text style={s.nextBtnText}>Preview & Submit</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: theme.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: theme.textMuted, marginTop: 4, marginBottom: 24, fontWeight: '500' },
  label: { fontSize: 14, fontWeight: '700', color: theme.textMuted, marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15, color: theme.text, paddingVertical: 14 },
  textArea: { backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 12, padding: 14, fontSize: 15, color: theme.text, height: 120, textAlignVertical: 'top' },
  priorityRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  priorityBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderWidth: 1.5, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.card },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityBtnText: { fontSize: 14, fontWeight: '700', color: theme.textMuted },
  nextBtn: { flexDirection: 'row', backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 32 },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  errorHelper: { color: theme.danger, fontSize: 12, fontWeight: '600', marginTop: 4, marginLeft: 4 },
});