import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSurvey } from '../../context/SurveyContext';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const { surveys, deleteSurvey } = useSurvey();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState(null);

  const handleDelete = (id) => {
    Alert.alert('Delete Survey', 'Are you sure you want to delete this survey?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => deleteSurvey(id) }]
    );
  };

  const filteredSurveys = surveys.filter((s) => {
    const matchesSearch = s.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority ? s.priority === filterPriority : true;
    return matchesSearch && matchesPriority;
  });

  const renderItem = ({ item }) => (
  <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.siteName}>{item.siteName}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>
      <Text style={styles.clientName}>{item.clientName}</Text>
      <Text style={styles.details}>Priority: {item.priority} | Date: {new Date(item.date).toLocaleDateString()}</Text>
      
      <TouchableOpacity
      style={styles.viewDetailsButton}
      onPress={() => {
        const desc = item.description || 'N/A';
        const loc = (item.location && typeof item.location.lat === 'number') 
          ? `${item.location.lat.toFixed(4)}, ${item.location.lng.toFixed(4)}` 
          : (item.location && typeof item.location.latitude === 'number')
          ? `${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}`
          : 'N/A';
        const contact = (item.contact && item.contact.name) ? item.contact.name : 'N/A';
        Alert.alert('Survey Details', `Description: ${desc}\nLocation: ${loc}\nContact: ${contact}`);
      }}>
      
        <Text style={styles.viewDetailsText}>View Full Details</Text>
      </TouchableOpacity>
    </View>
  );


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by Site or Client Name"
        value={searchQuery}
        onChangeText={setSearchQuery} />
      
      
      <View style={styles.filterContainer}>
        {['Low', 'Medium', 'High'].map((level) =>
        <TouchableOpacity
          key={level}
          style={[styles.filterButton, filterPriority === level && styles.filterSelected]}
          onPress={() => setFilterPriority(filterPriority === level ? null : level)}>
          
            <Text style={[styles.filterText, filterPriority === level && styles.filterTextSelected]}>{level}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredSurveys}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No surveys found.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }} />
      
    </View>);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  searchInput: { backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 12 },
  filterContainer: { flexDirection: 'row', marginBottom: 16 },
  filterButton: { flex: 1, padding: 8, borderWidth: 1, borderColor: '#007AFF', borderRadius: 20, marginHorizontal: 4, alignItems: 'center' },
  filterSelected: { backgroundColor: '#007AFF' },
  filterText: { color: '#007AFF', fontSize: 12 },
  filterTextSelected: { color: 'white' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  siteName: { fontSize: 18, fontWeight: 'bold' },
  clientName: { fontSize: 14, color: '#555', marginTop: 4 },
  details: { fontSize: 12, color: '#888', marginTop: 8 },
  viewDetailsButton: { marginTop: 12, padding: 8, backgroundColor: '#e9ecef', borderRadius: 8, alignItems: 'center' },
  viewDetailsText: { color: '#007AFF', fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' }
});