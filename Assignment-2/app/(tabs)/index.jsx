import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSurvey } from '../../context/SurveyContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const router = useRouter();
  const { surveys } = useSurvey();
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [profilePhoto, setProfilePhoto] = React.useState(null);
  const defaultPhotoUri = 'https://avatars.githubusercontent.com/u/226024353?v=4';

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('@smartfield_profile_photo').then((val) => {
        setProfilePhoto(val || defaultPhotoUri);
      });
    }, [])
  );

  const todaysSurveys = surveys.filter((sv) => {
    const today = new Date().toISOString().split('T')[0];
    return sv.date && sv.date.startsWith(today);
  });

  const highPrioritySurveys = surveys.filter(s => s.priority === 'High');

  const actions = [
    { label: 'New Survey', icon: 'add-circle', color: theme.primary, bg: theme.isDark ? '#1E293B' : '#EFF6FF', route: '/new-survey' },
    { label: 'Camera', icon: 'camera', color: theme.success, bg: theme.isDark ? '#064E3B' : '#ECFDF5', route: '/camera' },
    { label: 'Location', icon: 'location', color: theme.danger, bg: theme.isDark ? '#7F1D1D' : '#FEF2F2', route: '/location' },
    { label: 'Contacts', icon: 'people', color: theme.warning, bg: theme.isDark ? '#78350F' : '#FFFBEB', route: '/contacts' },
    { label: 'Clipboard', icon: 'clipboard', color: theme.purple, bg: theme.isDark ? '#4C1D95' : '#F5F3FF', route: '/clipboard' },
    { label: 'Preview', icon: 'eye', color: '#0ea5e9', bg: theme.isDark ? '#0C4A6E' : '#F0F9FF', route: '/preview' },
  ];

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* ── Dynamic Top Banner Card ── */}
      <View style={s.bannerCard}>
        <View style={s.bannerTop}>
          <View>
            <Text style={s.bannerGreeting}>Welcome back 👋</Text>
            <Text style={s.bannerName}>Dharmi Patel</Text>
            <Text style={s.bannerSchool}>Swaminarayan University</Text>
          </View>
          <TouchableOpacity style={s.profileFrame} onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.85}>
            <Image source={{ uri: profilePhoto || defaultPhotoUri }} style={s.profileImg} />
          </TouchableOpacity>
        </View>
        <View style={s.bannerDivider} />
        <View style={s.bannerBottom}>
          <Ionicons name="sparkles" size={16} color="#FFE600" />
          <Text style={s.bannerTip}>Tip: Always attach coordinates to ensure accurate data validation.</Text>
        </View>
      </View>

      {/* ── Stats Display Grid ── */}
      <Text style={s.sectionHeader}>Survey Statistics</Text>
      <View style={s.statsGrid}>
        <View style={[s.statCard, { borderLeftColor: theme.primary }]}>
          <View style={s.statHeader}>
            <Text style={s.statLabel}>Today</Text>
            <Ionicons name="today-outline" size={18} color={theme.primary} />
          </View>
          <Text style={s.statNumber}>{todaysSurveys.length}</Text>
          <Text style={s.statSub}>surveys collected</Text>
        </View>

        <View style={[s.statCard, { borderLeftColor: theme.success }]}>
          <View style={s.statHeader}>
            <Text style={s.statLabel}>Total</Text>
            <Ionicons name="checkmark-done-outline" size={18} color={theme.success} />
          </View>
          <Text style={s.statNumber}>{surveys.length}</Text>
          <Text style={s.statSub}>surveys saved</Text>
        </View>

        <View style={[s.statCard, { borderLeftColor: theme.danger }]}>
          <View style={s.statHeader}>
            <Text style={s.statLabel}>High Priority</Text>
            <Ionicons name="alert-circle-outline" size={18} color={theme.danger} />
          </View>
          <Text style={s.statNumber}>{highPrioritySurveys.length}</Text>
          <Text style={s.statSub}>need attention</Text>
        </View>
      </View>

      {/* ── Quick Actions ── */}
      <Text style={s.sectionHeader}>Quick Actions</Text>
      <View style={s.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={s.actionCard}
            onPress={() => router.push(action.route)}
            activeOpacity={0.8}>
            <View style={[s.actionIconContainer, { backgroundColor: action.bg }]}>
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={s.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Recent Surveys Section ── */}
      <View style={s.recentHeaderRow}>
        <Text style={s.sectionHeader}>Recent Surveys</Text>
        {surveys.length > 0 && (
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={s.viewAllLink}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {surveys.length === 0 ? (
        <View style={s.emptyCard}>
          <Ionicons name="folder-open-outline" size={40} color={theme.textLight} />
          <Text style={s.emptyText}>Your survey library is empty</Text>
          <Text style={s.emptySubText}>Get started by creating a new survey entry</Text>
          <TouchableOpacity style={s.createSurveyBtn} onPress={() => router.push('/new-survey')}>
            <Text style={s.createSurveyBtnText}>Start New Survey</Text>
          </TouchableOpacity>
        </View>
      ) : (
        [...surveys].reverse().slice(0, 3).map((sv) => {
          const isHigh = sv.priority === 'High';
          const isLow = sv.priority === 'Low';
          const indicatorColor = isHigh ? theme.danger : isLow ? theme.success : theme.warning;

          return (
            <TouchableOpacity
              key={sv.id}
              style={s.recentCard}
              onPress={() => router.push('/(tabs)/history')}
              activeOpacity={0.85}>
              <View style={[s.recentIndicator, { backgroundColor: indicatorColor }]} />
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <Text style={s.recentTitle}>{sv.siteName}</Text>
                <Text style={s.recentClient}>{sv.clientName} • {sv.priority} Priority</Text>
              </View>
              <View style={s.recentRight}>
                <Text style={s.recentDate}>{new Date(sv.date).toLocaleDateString()}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textLight} />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: 16 },
  
  // Header Banner Card
  bannerCard: { backgroundColor: theme.card, borderRadius: 24, padding: 20, marginTop: 16, marginBottom: 24, borderWidth: 1, borderColor: theme.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerGreeting: { fontSize: 13, color: theme.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  bannerName: { fontSize: 24, fontWeight: '900', color: theme.text, letterSpacing: -0.5, marginTop: 2 },
  bannerSchool: { fontSize: 13, color: theme.primary, fontWeight: '700', marginTop: 2 },
  profileFrame: { width: 54, height: 54, borderRadius: 27, overflow: 'hidden', borderWidth: 2, borderColor: theme.primary },
  profileImg: { width: '100%', height: '100%' },
  bannerDivider: { height: 1, backgroundColor: theme.border, marginVertical: 14 },
  bannerBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerTip: { fontSize: 11, color: theme.textMuted, fontWeight: '500', flex: 1 },

  // Sections
  sectionHeader: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  recentHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 12 },
  viewAllLink: { fontSize: 13, color: theme.primary, fontWeight: '700' },

  // Stats display
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 4 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  statNumber: { fontSize: 24, fontWeight: '900', color: theme.text, marginVertical: 6 },
  statSub: { fontSize: 10, color: theme.textLight, fontWeight: '600' },

  // Quick Action Grid
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24, gap: 8 },
  actionCard: { width: '31%', backgroundColor: theme.card, paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  actionIconContainer: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: theme.textMuted, textAlign: 'center' },

  // Empty State
  emptyCard: { backgroundColor: theme.card, borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: theme.border, gap: 8 },
  emptyText: { color: theme.text, fontSize: 16, fontWeight: '800', marginTop: 4 },
  emptySubText: { color: theme.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 8 },
  createSurveyBtn: { backgroundColor: theme.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  createSurveyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Recent list
  recentCard: { backgroundColor: theme.card, borderRadius: 16, paddingVertical: 14, paddingRight: 16, marginBottom: 8, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  recentIndicator: { width: 4, height: 36, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  recentTitle: { fontSize: 15, fontWeight: '800', color: theme.text },
  recentClient: { fontSize: 12, color: theme.textMuted, fontWeight: '500', marginTop: 2 },
  recentRight: { alignItems: 'flex-end', flexDirection: 'row', gap: 6, alignItems: 'center' },
  recentDate: { fontSize: 12, color: theme.textLight, fontWeight: '600' },
});