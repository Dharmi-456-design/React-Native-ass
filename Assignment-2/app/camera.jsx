import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSurvey } from '../context/SurveyContext';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const { updateDraft, draftSurvey } = useSurvey();
  const { theme } = useTheme();
  const router = useRouter();

  const [photoUri, setPhotoUri] = useState(draftSurvey.photoUri || null);
  const [captureTime, setCaptureTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Ionicons name="camera-outline" size={60} color={theme.textLight} />
        <Text style={[styles.permText, { color: theme.text }]}>Camera permission required</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setPhotoUri(photo.uri);
        setCaptureTime(new Date().toLocaleTimeString());
      }
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
    setCaptureTime(null);
  };

  const handleDelete = () => {
    Alert.alert('Delete Photo', 'Remove this photo from the survey?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          setPhotoUri(null);
          setCaptureTime(null);
          updateDraft({ photoUri: null });
        }
      },
    ]);
  };

  const handleSave = () => {
    if (photoUri) {
      updateDraft({ photoUri });
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

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.permText, { color: theme.textMuted }]}>Opening Camera…</Text>
      </View>
    );
  }

  if (photoUri) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        {captureTime && (
          <Text style={styles.timeText}>📸 Captured at {captureTime}</Text>
        )}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4B5563' }]} onPress={handleRetake}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10b981' }]} onPress={handleSave}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={handleDelete}>
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView style={{ flex: 1, justifyContent: 'flex-end' }} facing="back" ref={cameraRef}>
        <View style={styles.cameraControls}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <View style={{ width: 44 }} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 },
  permText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  btn: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  preview: { flex: 1, resizeMode: 'contain' },
  timeText: { color: '#fff', textAlign: 'center', padding: 10, fontSize: 14, backgroundColor: 'rgba(0,0,0,0.6)' },
  actionRow: { flexDirection: 'row', padding: 20, backgroundColor: '#111', paddingBottom: 36, gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 6 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cameraControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingBottom: 40, backgroundColor: 'rgba(0,0,0,0.4)' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
});