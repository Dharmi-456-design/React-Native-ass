import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import { useSurvey } from '../context/SurveyContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LocationScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateDraft } = useSurvey();
  const router = useRouter();

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch location');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const copyToClipboard = async () => {
    if (location) {
      const text = `Lat: ${location.coords.latitude}, Lng: ${location.coords.longitude}`;
      await Clipboard.setStringAsync(text);
      Alert.alert('Success', 'Location copied to clipboard!');
    }
  };

  const handleSaveToSurvey = () => {
    if (location) {
      updateDraft({
        location: { lat: location.coords.latitude, lng: location.coords.longitude }
      });
      Alert.alert('Saved', 'Location attached to survey draft.');
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Location</Text>

      {loading ?
      <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} /> :
      location ?
      <View style={styles.card}>
          <Ionicons name="location" size={48} color="#dc3545" style={{ alignSelf: 'center', marginBottom: 10 }} />
          <Text style={styles.text}>Latitude: {location.coords.latitude.toFixed(6)}</Text>
          <Text style={styles.text}>Longitude: {location.coords.longitude.toFixed(6)}</Text>
          <Text style={styles.accuracyText}>Accuracy: {location.coords.accuracy?.toFixed(2)} meters</Text>
        </View> :

      <Text style={styles.errorText}>Location not available</Text>
      }

      <TouchableOpacity style={[styles.button, styles.refreshButton]} onPress={fetchLocation} disabled={loading}>
        <Ionicons name="refresh" size={20} color="white" />
        <Text style={styles.buttonText}>Refresh Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.copyButton]} onPress={copyToClipboard} disabled={!location}>
        <Ionicons name="copy" size={20} color="white" />
        <Text style={styles.buttonText}>Copy to Clipboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveToSurvey} disabled={!location}>
        <Ionicons name="checkmark-circle" size={20} color="white" />
        <Text style={styles.buttonText}>Save to Survey</Text>
      </TouchableOpacity>
    </View>);

}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 12, elevation: 2, marginBottom: 20 },
  text: { fontSize: 18, marginBottom: 8, color: '#333' },
  accuracyText: { fontSize: 14, color: '#888', marginTop: 10 },
  errorText: { textAlign: 'center', color: '#dc3545', marginVertical: 20 },
  button: { flexDirection: 'row', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  refreshButton: { backgroundColor: '#007AFF' },
  copyButton: { backgroundColor: '#6c757d' },
  saveButton: { backgroundColor: '#28a745' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});