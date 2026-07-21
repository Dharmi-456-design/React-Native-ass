import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useSurvey } from '../context/SurveyContext';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PreviewScreen() {
  const { draftSurvey, addSurvey, clearDraft } = useSurvey();
  const { theme } = useTheme();
  const router = useRouter();
  const s = makeStyles(theme);

  const handleSubmit = () => {
    if (!draftSurvey.siteName || !draftSurvey.clientName || !draftSurvey.description) {
      if (Platform.OS === 'web') {
        alert('Required Details Missing: Please fill in the Site Name, Client Name, and Description before submitting.');
        router.push('/(tabs)/new-survey');
      } else {
        Alert.alert(
          'Required Details Missing',
          'Please fill in the Site Name, Client Name, and Description before submitting.',
          [
            { text: 'Go Fill Details', onPress: () => router.push('/(tabs)/new-survey') },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
      return;
    }
    const newSurvey = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      siteName: draftSurvey.siteName,
      clientName: draftSurvey.clientName,
      description: draftSurvey.description || '',
      priority: draftSurvey.priority || 'Medium',
      date: draftSurvey.date || new Date().toISOString(),
      photoUri: draftSurvey.photoUri,
      location: draftSurvey.location,
      contact: draftSurvey.contact,
      notes: draftSurvey.notes,
    };
    addSurvey(newSurvey);
    clearDraft();
    if (Platform.OS === 'web') {
      alert('Survey submitted successfully!');
      router.replace('/(tabs)/history');
    } else {
      Alert.alert('Survey Submitted! ✅', 'Your survey has been saved successfully.', [
        { text: 'View History', onPress: () => router.replace('/(tabs)/history') }
      ]);
    }
  };

  const InfoRow = ({ label, value }) => (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value || 'N/A'}</Text>
    </View>
  );

  const priorityColor =
    draftSurvey.priority === 'High' ? theme.danger :
    draftSurvey.priority === 'Low' ? theme.success : theme.warning;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>Survey Preview</Text>
      <Text style={s.subtitle}>Review all details before submitting</Text>

      {/* ── General Info ── */}
      <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={() => router.push('/(tabs)/new-survey')}>
        <View style={s.cardTitleRow}>
          <View style={s.cardTitleLeft}>
            <View style={[s.cardIconBox, { backgroundColor: theme.primaryMuted }]}>
              <Ionicons name="document-text-outline" size={16} color={theme.primary} />
            </View>
            <Text style={s.cardTitle}>General Info</Text>
          </View>
          <View style={s.editChip}>
            <Ionicons name="pencil-outline" size={12} color={theme.primary} />
            <Text style={s.editChipText}>Edit</Text>
          </View>
        </View>
        <InfoRow label="Site Name" value={draftSurvey.siteName} />
        <InfoRow label="Client Name" value={draftSurvey.clientName} />
        <InfoRow label="Description" value={draftSurvey.description} />
        <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={s.infoLabel}>Priority</Text>
          <View style={[s.priorityBadge, { backgroundColor: priorityColor + '22' }]}>
            <View style={[s.priorityDot, { backgroundColor: priorityColor }]} />
            <Text style={[s.priorityText, { color: priorityColor }]}>
              {draftSurvey.priority || 'Medium'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Location Card (tappable → opens Location screen) ── */}
      <TouchableOpacity
        style={[s.card, !draftSurvey.location && s.cardEmpty]}
        activeOpacity={0.82}
        onPress={() => router.push('/location')}
      >
        <View style={s.cardTitleRow}>
          <View style={s.cardTitleLeft}>
            <View style={[s.cardIconBox, { backgroundColor: draftSurvey.location ? '#d1fae5' : theme.bg }]}>
              <Ionicons name="location-outline" size={16} color={draftSurvey.location ? theme.success : theme.textLight} />
            </View>
            <Text style={s.cardTitle}>Location</Text>
          </View>
          {draftSurvey.location ? (
            <View style={[s.editChip, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="checkmark" size={12} color={theme.success} />
              <Text style={[s.editChipText, { color: theme.success }]}>Attached</Text>
            </View>
          ) : (
            <View style={[s.editChip, { backgroundColor: theme.danger + '18', borderColor: theme.danger + '44' }]}>
              <Ionicons name="add" size={13} color={theme.danger} />
              <Text style={[s.editChipText, { color: theme.danger }]}>Add GPS</Text>
            </View>
          )}
        </View>

        {draftSurvey.location ? (
          <>
            <InfoRow label="Latitude" value={draftSurvey.location.lat?.toFixed(6)} />
            <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={s.infoLabel}>Longitude</Text>
              <Text style={s.infoValue}>{draftSurvey.location.lng?.toFixed(6)}</Text>
            </View>
          </>
        ) : (
          <View style={s.emptyHint}>
            <Ionicons name="navigate-circle-outline" size={28} color={theme.textLight} />
            <Text style={s.emptyHintText}>Tap to open Location screen and attach GPS coordinates</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── Contact Card (tappable → opens Contacts screen) ── */}
      <TouchableOpacity
        style={[s.card, !draftSurvey.contact && s.cardEmpty]}
        activeOpacity={0.82}
        onPress={() => router.push('/contacts')}
      >
        <View style={s.cardTitleRow}>
          <View style={s.cardTitleLeft}>
            <View style={[s.cardIconBox, { backgroundColor: draftSurvey.contact ? '#fef3c7' : theme.bg }]}>
              <Ionicons name="person-outline" size={16} color={draftSurvey.contact ? theme.warning : theme.textLight} />
            </View>
            <Text style={s.cardTitle}>Contact Person</Text>
          </View>
          {draftSurvey.contact ? (
            <View style={[s.editChip, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="checkmark" size={12} color={theme.warning} />
              <Text style={[s.editChipText, { color: theme.warning }]}>Attached</Text>
            </View>
          ) : (
            <View style={[s.editChip, { backgroundColor: theme.danger + '18', borderColor: theme.danger + '44' }]}>
              <Ionicons name="add" size={13} color={theme.danger} />
              <Text style={[s.editChipText, { color: theme.danger }]}>Add Contact</Text>
            </View>
          )}
        </View>

        {draftSurvey.contact ? (
          <>
            <InfoRow label="Name" value={draftSurvey.contact.name} />
            <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={s.infoLabel}>Phone</Text>
              <Text style={s.infoValue}>{draftSurvey.contact.number}</Text>
            </View>
          </>
        ) : (
          <View style={s.emptyHint}>
            <Ionicons name="people-outline" size={28} color={theme.textLight} />
            <Text style={s.emptyHintText}>Tap to open Contacts and attach a contact person</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── Notes Card ── */}
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.82}
        onPress={() => router.push('/clipboard')}
      >
        <View style={s.cardTitleRow}>
          <View style={s.cardTitleLeft}>
            <View style={[s.cardIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="clipboard-outline" size={16} color={theme.purple} />
            </View>
            <Text style={s.cardTitle}>Notes</Text>
          </View>
          <View style={[s.editChip, { backgroundColor: '#F5F3FF', borderColor: theme.purple + '44' }]}>
            <Ionicons name="pencil-outline" size={12} color={theme.purple} />
            <Text style={[s.editChipText, { color: theme.purple }]}>Edit</Text>
          </View>
        </View>
        <Text style={s.notesText}>{draftSurvey.notes || 'No notes added. Tap to add.'}</Text>
      </TouchableOpacity>

      {/* ── Photo Card (tappable → opens Camera screen) ── */}
      <TouchableOpacity
        style={[s.card, !draftSurvey.photoUri && s.cardEmpty]}
        activeOpacity={0.82}
        onPress={() => router.push('/camera')}
      >
        <View style={s.cardTitleRow}>
          <View style={s.cardTitleLeft}>
            <View style={[s.cardIconBox, { backgroundColor: draftSurvey.photoUri ? '#ECFDF5' : theme.bg }]}>
              <Ionicons name="camera-outline" size={16} color={draftSurvey.photoUri ? theme.success : theme.textLight} />
            </View>
            <Text style={s.cardTitle}>Photo</Text>
          </View>
          {draftSurvey.photoUri ? (
            <View style={[s.editChip, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="checkmark" size={12} color={theme.success} />
              <Text style={[s.editChipText, { color: theme.success }]}>Captured</Text>
            </View>
          ) : (
            <View style={[s.editChip, { backgroundColor: theme.danger + '18', borderColor: theme.danger + '44' }]}>
              <Ionicons name="add" size={13} color={theme.danger} />
              <Text style={[s.editChipText, { color: theme.danger }]}>Add Photo</Text>
            </View>
          )}
        </View>
        {draftSurvey.photoUri ? (
          <Image source={{ uri: draftSurvey.photoUri }} style={s.photo} />
        ) : (
          <View style={s.emptyHint}>
            <Ionicons name="image-outline" size={28} color={theme.textLight} />
            <Text style={s.emptyHintText}>Tap to open Camera and take a site photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── Action Buttons ── */}
      <View style={s.btnColumn}>
        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={s.btnText}>Submit Survey</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.editBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color={theme.primary} />
          <Text style={s.editBtnText}>Back to Form</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 16 },
  title: { fontSize: 26, fontWeight: '800', color: theme.text, letterSpacing: -0.5, marginBottom: 4, textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 13, color: theme.textMuted, fontWeight: '500', textAlign: 'center', marginBottom: 20 },

  card: {
    backgroundColor: theme.card, borderRadius: 18, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: theme.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  cardEmpty: { borderStyle: 'dashed', borderColor: theme.danger + '55', borderWidth: 1.5 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIconBox: { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: theme.text, textTransform: 'uppercase', letterSpacing: 0.6 },
  editChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: theme.primaryMuted, borderWidth: 1, borderColor: theme.primary + '33' },
  editChipText: { fontSize: 11, fontWeight: '700', color: theme.primary },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: theme.border },
  infoLabel: { fontSize: 13, color: theme.textMuted, fontWeight: '600', flex: 1 },
  infoValue: { fontSize: 14, color: theme.text, fontWeight: '600', flex: 2, textAlign: 'right' },

  priorityBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  priorityDot: { width: 7, height: 7, borderRadius: 4 },
  priorityText: { fontSize: 13, fontWeight: '700' },

  emptyHint: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  emptyHintText: { fontSize: 13, color: theme.textLight, textAlign: 'center', fontWeight: '500', lineHeight: 18 },

  notesText: { fontSize: 14, color: theme.textMuted, lineHeight: 20, fontStyle: 'italic' },
  photo: { width: '100%', height: 200, borderRadius: 12, marginTop: 4, resizeMode: 'cover' },

  btnColumn: { gap: 12, marginTop: 8, marginBottom: 30 },
  submitBtn: { flexDirection: 'row', backgroundColor: theme.success, padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 2 },
  editBtn: { flexDirection: 'row', backgroundColor: theme.primaryMuted, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: theme.primary + '44' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  editBtnText: { color: theme.primary, fontSize: 16, fontWeight: '700' },
});