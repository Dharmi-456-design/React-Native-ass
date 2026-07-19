import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSurvey } from '../context/SurveyContext';
import { useRouter } from 'expo-router';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const { updateDraft, draftSurvey } = useSurvey();
  const router = useRouter();

  const [photoUri, setPhotoUri] = useState(draftSurvey.photoUri || null);
  const [captureTime, setCaptureTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading indicator for opening camera per requirements
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>);

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
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => {
        setPhotoUri(null);
        setCaptureTime(null);
        updateDraft({ photoUri: undefined });
      } }]
    );
  };

  const handleSave = () => {
    if (photoUri) {
      updateDraft({ photoUri });
      Alert.alert('Saved', 'Photo attached to survey draft.');
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Opening Camera...</Text>
      </View>);

  }

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        {captureTime && <Text style={styles.timeText}>Captured at: {captureTime}</Text>}
        
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.retakeBtn]} onPress={handleRetake}>
            <Text style={styles.btnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={handleSave}>
            <Text style={styles.btnText}>Save to Survey</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
            <Text style={styles.btnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>);

  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <View style={styles.cameraUI}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  camera: { flex: 1, justifyContent: 'flex-end' },
  cameraUI: { padding: 30, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  captureButton: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  preview: { flex: 1, resizeMode: 'contain' },
  timeText: { color: 'white', textAlign: 'center', padding: 10, fontSize: 16 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: '#222' },
  actionBtn: { padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  retakeBtn: { backgroundColor: '#ffc107' },
  saveBtn: { backgroundColor: '#28a745' },
  deleteBtn: { backgroundColor: '#dc3545' },
  btnText: { color: 'white', fontWeight: 'bold' }
});
