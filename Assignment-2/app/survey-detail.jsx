import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSurvey } from '../context/SurveyContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function SurveyDetailScreen() {
  const { id } = useLocalSearchParams();
  const { surveys, deleteSurvey } = useSurvey();
  const { theme } = useTheme();
  const router = useRouter();
  const s = makeStyles(theme);

  const survey = surveys.find((sv) => String(sv.id) === String(id));

  if (!survey) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={54} color={theme.textLight} />
        <Text style={s.notFoundText}>Survey not found</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const priorityColor =
    survey.priority === 'High' ? theme.danger :
    survey.priority === 'Low' ? theme.success : theme.warning;

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete "${survey.siteName}"?\nThis action cannot be undone.`);
      if (confirmed) {
        deleteSurvey(survey.id);
        alert('Survey deleted successfully!');
        router.replace('/(tabs)/history');
      }
    } else {
      Alert.alert(
        'Delete Survey',
        `Are you sure you want to delete "${survey.siteName}"?\nThis cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteSurvey(survey.id);
              Alert.alert('Deleted ✅', 'Survey deleted successfully!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/history') }
              ]);
            },
          },
        ]
      );
    }
  };

  const Section = ({ icon, iconBg, iconColor, title, children }) => (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <View style={[s.sectionIconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const Row = ({ label, value, last }) => (
    <View style={[s.row, last && { borderBottomWidth: 0 }]}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value || '—'}</Text>
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

      {/* ── Hero Header ── */}
      <View style={[s.heroCard, { borderLeftColor: priorityColor }]}>
        <View style={s.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.heroSite}>{survey.siteName}</Text>
            <Text style={s.heroClient}>{survey.clientName}</Text>
          </View>
          <View style={[s.priorityBadge, { backgroundColor: priorityColor + '22' }]}>
            <View style={[s.priorityDot, { backgroundColor: priorityColor }]} />
            <Text style={[s.priorityText, { color: priorityColor }]}>{survey.priority}</Text>
          </View>
        </View>
        <View style={s.heroMeta}>
          <View style={s.metaChip}>
            <Ionicons name="calendar-outline" size={13} color={theme.textMuted} />
            <Text style={s.metaText}>{new Date(survey.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
          <View style={s.metaChip}>
            <Ionicons name="time-outline" size={13} color={theme.textMuted} />
            <Text style={s.metaText}>{new Date(survey.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>
      </View>

      {/* ── Site Details ── */}
      <Section icon="document-text-outline" iconBg={theme.primaryMuted} iconColor={theme.primary} title="Site Details">
        <Row label="Site Name" value={survey.siteName} />
        <Row label="Client Name" value={survey.clientName} />
        <Row label="Description" value={survey.description} last />
      </Section>

      {/* ── Location ── */}
      <Section icon="location-outline" iconBg="#d1fae5" iconColor={theme.success} title="GPS Location">
        {survey.location ? (
          <>
            <Row label="Latitude" value={survey.location.lat?.toFixed(6)} />
            <Row label="Longitude" value={survey.location.lng?.toFixed(6)} last />
          </>
        ) : (
          <View style={s.emptyRow}>
            <Ionicons name="location-outline" size={22} color={theme.textLight} />
            <Text style={s.emptyText}>No GPS location attached</Text>
          </View>
        )}
      </Section>

      {/* ── Contact ── */}
      <Section icon="person-outline" iconBg="#fef3c7" iconColor={theme.warning} title="Contact Person">
        {survey.contact ? (
          <>
            <Row label="Name" value={survey.contact.name} />
            <Row label="Phone" value={survey.contact.number} last />
          </>
        ) : (
          <View style={s.emptyRow}>
            <Ionicons name="people-outline" size={22} color={theme.textLight} />
            <Text style={s.emptyText}>No contact attached</Text>
          </View>
        )}
      </Section>

      {/* ── Notes ── */}
      <Section icon="clipboard-outline" iconBg="#F5F3FF" iconColor={theme.purple} title="Notes">
        <Text style={s.notesText}>{survey.notes || 'No notes added for this survey.'}</Text>
      </Section>

      {/* ── Photo ── */}
      <Section icon="camera-outline" iconBg="#ECFDF5" iconColor={theme.success} title="Site Photo">
        {survey.photoUri ? (
          <Image source={{ uri: survey.photoUri }} style={s.photo} />
        ) : (
          <View style={s.emptyRow}>
            <Ionicons name="image-outline" size={22} color={theme.textLight} />
            <Text style={s.emptyText}>No photo captured</Text>
          </View>
        )}
      </Section>

      {/* ── Actions ── */}
      <View style={s.actions}>
        <TouchableOpacity style={s.backActionBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={theme.primary} />
          <Text style={s.backActionText}>Back to History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.deleteActionBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={s.deleteActionText}>Delete Survey</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 16 },

  notFoundText: { fontSize: 16, color: theme.textMuted, marginTop: 12, fontWeight: '600' },
  backBtn: { marginTop: 16, backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: '#fff', fontWeight: '700' },

  // Hero
  heroCard: {
    backgroundColor: theme.card, borderRadius: 18, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border, borderLeftWidth: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  heroSite: { fontSize: 22, fontWeight: '900', color: theme.text, letterSpacing: -0.5 },
  heroClient: { fontSize: 14, color: theme.textMuted, fontWeight: '500', marginTop: 3 },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginLeft: 10 },
  priorityDot: { width: 7, height: 7, borderRadius: 4 },
  priorityText: { fontSize: 13, fontWeight: '700' },
  heroMeta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: theme.bg, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.border },
  metaText: { fontSize: 12, color: theme.textMuted, fontWeight: '600' },

  // Section
  section: { backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionIconBox: { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.text, textTransform: 'uppercase', letterSpacing: 0.7 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  rowLabel: { fontSize: 13, color: theme.textMuted, fontWeight: '600', flex: 1 },
  rowValue: { fontSize: 14, color: theme.text, fontWeight: '600', flex: 2, textAlign: 'right' },

  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  emptyText: { fontSize: 14, color: theme.textLight, fontStyle: 'italic' },
  notesText: { fontSize: 14, color: theme.text, lineHeight: 22, fontStyle: 'italic' },
  photo: { width: '100%', height: 220, borderRadius: 12, marginTop: 4, resizeMode: 'cover' },

  // Action Buttons
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  backActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.primaryMuted, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: theme.primary + '44' },
  backActionText: { color: theme.primary, fontWeight: '700', fontSize: 15 },
  deleteActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.danger, padding: 16, borderRadius: 14 },
  deleteActionText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
