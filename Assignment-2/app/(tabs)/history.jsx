import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Alert, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSurvey } from '../../context/SurveyContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const { surveys, deleteSurvey } = useSurvey();
  const { theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState(null);

  const s = makeStyles(theme);

  const handleDelete = (item) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete "${item.siteName}"?\nThis action cannot be undone.`);
      if (confirmed) {
        if (item.id) {
          deleteSurvey(item.id);
        } else {
          deleteSurvey(null, item);
        }
        alert('Survey deleted successfully!');
      }
    } else {
      Alert.alert(
        'Delete Survey',
        `Delete "${item.siteName}"?\nThis action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              if (item.id) {
                deleteSurvey(item.id);
              } else {
                deleteSurvey(null, item);
              }
              Alert.alert('Success', 'Survey deleted successfully!');
            },
          },
        ]
      );
    }
  };

  const filteredSurveys = surveys.filter((sv) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (sv.siteName || '').toLowerCase().includes(q) ||
      (sv.clientName || '').toLowerCase().includes(q);
    const matchesPriority = filterPriority ? sv.priority === filterPriority : true;
    return matchesSearch && matchesPriority;
  });

  const priorityColor = (p) => {
    if (p === 'High') return theme.danger;
    if (p === 'Low') return theme.success;
    return theme.warning;
  };

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={[s.priorityBadge, { backgroundColor: priorityColor(item.priority) + '22' }]}>
          <View style={[s.priorityDot, { backgroundColor: priorityColor(item.priority) }]} />
          <Text style={[s.priorityText, { color: priorityColor(item.priority) }]}>{item.priority}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={s.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>

      <Text style={s.siteName}>{item.siteName}</Text>
      <Text style={s.clientName}>{item.clientName}</Text>

      <View style={s.cardFooter}>
        <View style={s.footerItem}>
          <Ionicons name="calendar-outline" size={13} color={theme.textLight} />
          <Text style={s.footerText}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        {item.location && (
          <View style={s.footerItem}>
            <Ionicons name="location-outline" size={13} color={theme.textLight} />
            <Text style={s.footerText}>GPS attached</Text>
          </View>
        )}
        {item.contact && (
          <View style={s.footerItem}>
            <Ionicons name="person-outline" size={13} color={theme.textLight} />
            <Text style={s.footerText}>{item.contact.name}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={s.detailsBtn}
        onPress={() => router.push({ pathname: '/survey-detail', params: { id: item.id } })}>
        <Text style={s.detailsBtnText}>View Full Details</Text>
        <Ionicons name="chevron-forward" size={14} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      {/* Search */}
      <View style={s.searchBox}>
        <Ionicons name="search-outline" size={18} color={theme.textMuted} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by site or client…"
          placeholderTextColor={theme.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Priority Filters */}
      <View style={s.filterRow}>
        {[null, 'Low', 'Medium', 'High'].map((level) => (
          <TouchableOpacity
            key={level ?? 'All'}
            style={[
              s.filterChip,
              filterPriority === level && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => setFilterPriority(level)}>
            <Text style={[s.filterText, filterPriority === level && { color: '#fff' }]}>
              {level ?? 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Survey count */}
      <Text style={s.countText}>
        {filteredSurveys.length} survey{filteredSurveys.length !== 1 ? 's' : ''} found
      </Text>

      <FlatList
        data={[...filteredSurveys].reverse()}
        keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Ionicons name="document-text-outline" size={48} color={theme.textLight} />
            <Text style={s.emptyTitle}>No surveys found</Text>
            <Text style={s.emptySubText}>Try adjusting the search or filter</Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBg, borderRadius: 12, borderWidth: 1, borderColor: theme.inputBorder, paddingHorizontal: 14, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, color: theme.text, paddingVertical: 12 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card },
  filterText: { fontSize: 13, fontWeight: '600', color: theme.textMuted },
  countText: { fontSize: 13, color: theme.textLight, fontWeight: '500', marginBottom: 12 },
  card: { backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  priorityDot: { width: 7, height: 7, borderRadius: 4 },
  priorityText: { fontSize: 12, fontWeight: '700' },
  deleteBtn: { padding: 4 },
  siteName: { fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 3 },
  clientName: { fontSize: 14, color: theme.textMuted, fontWeight: '500', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: theme.textLight, fontWeight: '500' },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primaryMuted, borderRadius: 10, padding: 10, gap: 4 },
  detailsBtnText: { fontSize: 14, color: theme.primary, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: theme.textMuted },
  emptySubText: { fontSize: 13, color: theme.textLight },
});