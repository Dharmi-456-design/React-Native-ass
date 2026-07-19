import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Clipboard from 'expo-clipboard';
import { useSurvey } from '../context/SurveyContext';
import { useRouter } from 'expo-router';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { updateDraft } = useSurvey();
  const router = useRouter();

  const fetchContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers]
      });
      if (data.length > 0) {
        setContacts(data);
      }
    } else {
      Alert.alert('Permission Denied', 'Cannot access contacts');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  }, []);

  const copyToClipboard = async (number) => {
    await Clipboard.setStringAsync(number);
    Alert.alert('Copied', 'Phone number copied to clipboard');
  };

  const handleSaveToSurvey = (contact, number) => {
    updateDraft({
      contact: { name: contact.name || 'Unknown', number }
    });
    Alert.alert('Saved', 'Contact attached to survey draft.');
    router.back();
  };

  const filteredContacts = contacts.filter((c) =>
  c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const number = item.phoneNumbers && item.phoneNumbers.length > 0 ? item.phoneNumbers[0].number : null;

    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name ? item.name.charAt(0).toUpperCase() : '?'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.number}>{number || 'No Number'}</Text>
        </View>
        <View style={styles.actions}>
          {number &&
          <>
              <TouchableOpacity style={styles.actionBtn} onPress={() => copyToClipboard(number)}>
                <Text style={styles.actionText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={() => handleSaveToSurvey(item, number)}>
                <Text style={[styles.actionText, { color: 'white' }]}>Select</Text>
              </TouchableOpacity>
            </>
          }
        </View>
      </View>);

  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery} />
        
        <Text style={styles.counter}>Total: {filteredContacts.length}</Text>
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No contacts found.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }} />
      
    </View>);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 16, backgroundColor: 'white', elevation: 2 },
  searchInput: { backgroundColor: '#f1f3f5', padding: 12, borderRadius: 8, fontSize: 16 },
  counter: { textAlign: 'right', marginTop: 8, color: '#666' },
  card: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  number: { fontSize: 14, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row' },
  actionBtn: { padding: 8, backgroundColor: '#e9ecef', borderRadius: 6, marginLeft: 8 },
  saveBtn: { backgroundColor: '#28a745' },
  actionText: { fontSize: 12, fontWeight: '600', color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' }
});