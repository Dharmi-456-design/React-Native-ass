import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, RefreshControl, Platform } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Clipboard from 'expo-clipboard';
import { useSurvey } from '../context/SurveyContext';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { updateDraft } = useSurvey();
  const { theme } = useTheme();
  const router = useRouter();
  const s = makeStyles(theme);

  const fetchContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
      if (data.length > 0) setContacts(data);
    } else {
      Alert.alert('Permission Denied', 'Cannot access contacts. Please allow in settings.');
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  }, []);

  const copyToClipboard = async (number) => {
    await Clipboard.setStringAsync(number);
    Alert.alert('Copied ✅', 'Phone number copied to clipboard.');
  };

  const handleSaveToSurvey = (contact, number) => {
    updateDraft({ contact: { name: contact.name || 'Unknown', number } });
    if (Platform.OS === 'web') {
      alert('Survey saved successfully!');
      router.back();
    } else {
      Alert.alert('Success', 'Survey saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const number = item.phoneNumbers?.[0]?.number || null;
    const initials = item.name ? item.name.charAt(0).toUpperCase() : '?';
    return (
      <View style={s.card}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <View style={s.info}>
          <Text style={s.name}>{item.name}</Text>
          <Text style={s.number}>{number || 'No number'}</Text>
        </View>
        {number && (
          <View style={s.actions}>
            <TouchableOpacity style={s.copyBtn} onPress={() => copyToClipboard(number)}>
              <Ionicons name="copy-outline" size={16} color={theme.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={s.selectBtn} onPress={() => handleSaveToSurvey(item, number)}>
              <Text style={s.selectBtnText}>Select</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.searchBox}>
        <Ionicons name="search-outline" size={18} color={theme.textMuted} />
        <TextInput
          style={s.searchInput}
          placeholder="Search contacts…"
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
      <Text style={s.counter}>{filteredContacts.length} contacts</Text>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Ionicons name="people-outline" size={48} color={theme.textLight} />
            <Text style={s.emptyText}>No contacts found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, margin: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 14, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, color: theme.text, paddingVertical: 12 },
  counter: { fontSize: 12, color: theme.textLight, fontWeight: '600', marginHorizontal: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { flexDirection: 'row', padding: 14, marginHorizontal: 16, marginBottom: 10, backgroundColor: theme.card, borderRadius: 14, borderWidth: 1, borderColor: theme.border, alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: theme.primaryMuted, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: theme.primary, fontSize: 20, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: theme.text },
  number: { fontSize: 13, color: theme.textMuted, marginTop: 2, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  copyBtn: { padding: 8, backgroundColor: theme.bg, borderRadius: 8 },
  selectBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: theme.success, borderRadius: 8 },
  selectBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: theme.textMuted, fontWeight: '600' },
});