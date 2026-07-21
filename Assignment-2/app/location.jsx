import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import { useSurvey } from '../context/SurveyContext';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LocationScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateDraft } = useSurvey();
  const { theme } = useTheme();
  const router = useRouter();
  const s = makeStyles(theme);

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);
    } catch {
      Alert.alert('Error', 'Failed to fetch location. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocation(); }, []);

  const copyToClipboard = async () => {
    if (location) {
      await Clipboard.setStringAsync(
        `Lat: ${location.coords.latitude.toFixed(6)}, Lng: ${location.coords.longitude.toFixed(6)}`
      );
      Alert.alert('Copied ✅', 'Location coordinates copied to clipboard.');
    }
  };

  const handleSaveToSurvey = () => {
    if (location) {
      updateDraft({
        location: { lat: location.coords.latitude, lng: location.coords.longitude }
      });
      if (Platform.OS === 'web') {
        alert('Survey saved successfully!');
        router.back();
      } else {
        Alert.alert('Success', 'Survey saved successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.title}>Current Location</Text>
      <Text style={s.subtitle}>Capture your GPS coordinates for the survey</Text>

      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={s.loadingText}>Fetching location…</Text>
        </View>
      ) : location ? (
        <View style={s.card}>
          <View style={s.cardIconRow}>
            <View style={[s.iconCircle, { backgroundColor: theme.primaryMuted }]}>
              <Ionicons name="location" size={32} color={theme.primary} />
            </View>
            <View style={[s.accuracyBadge, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              <Text style={s.accuracyText}>±{location.coords.accuracy?.toFixed(0)}m accuracy</Text>
            </View>
          </View>
          <View style={s.coordRow}>
            <Ionicons name="navigate-outline" size={16} color={theme.textMuted} />
            <Text style={s.coordLabel}>Latitude</Text>
            <Text style={s.coordValue}>{location.coords.latitude.toFixed(6)}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.coordRow}>
            <Ionicons name="navigate-circle-outline" size={16} color={theme.textMuted} />
            <Text style={s.coordLabel}>Longitude</Text>
            <Text style={s.coordValue}>{location.coords.longitude.toFixed(6)}</Text>
          </View>
        </View>
      ) : (
        <View style={s.errorBox}>
          <Ionicons name="location-outline" size={40} color={theme.textLight} />
          <Text style={s.errorText}>Location not available</Text>
        </View>
      )}

      <TouchableOpacity style={[s.btn, { backgroundColor: theme.primary }]} onPress={fetchLocation} disabled={loading}>
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text style={s.btnText}>Refresh Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.btn, { backgroundColor: '#4B5563', opacity: location ? 1 : 0.4 }]} onPress={copyToClipboard} disabled={!location}>
        <Ionicons name="copy-outline" size={18} color="#fff" />
        <Text style={s.btnText}>Copy to Clipboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.btn, { backgroundColor: theme.success, opacity: location ? 1 : 0.4 }]} onPress={handleSaveToSurvey} disabled={!location}>
        <Ionicons name="checkmark-circle" size={18} color="#fff" />
        <Text style={s.btnText}>Save to Survey</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: theme.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: theme.textMuted, marginTop: 4, marginBottom: 24, fontWeight: '500' },
  loadingBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 15, color: theme.textMuted, fontWeight: '500' },
  card: { backgroundColor: theme.card, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: theme.border },
  cardIconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  accuracyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  accuracyText: { fontSize: 12, color: '#10b981', fontWeight: '600' },
  coordRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 8 },
  coordLabel: { flex: 1, fontSize: 14, color: theme.textMuted, fontWeight: '600' },
  coordValue: { fontSize: 16, color: theme.text, fontWeight: '700', fontFamily: 'monospace' },
  divider: { height: 1, backgroundColor: theme.border },
  errorBox: { alignItems: 'center', paddingVertical: 30, gap: 8, marginBottom: 20 },
  errorText: { fontSize: 15, color: theme.textMuted, fontWeight: '600' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, marginBottom: 12, gap: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});