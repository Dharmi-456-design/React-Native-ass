import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(true);

  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const cameraRef = useRef(null);

  const [employeeName, setEmployeeName] = useState('');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        setLoadingLoc(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        setAddress(reverseGeocode[0]);
      }
      setLoadingLoc(false);
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setPhotoUri(photo.uri);
        setShowCamera(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!employeeName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!photoUri) {
      Alert.alert('Error', 'Please take a selfie');
      return;
    }
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    const currentDateTime = new Date().toLocaleString();

    const attendanceRecord = {
      id: Date.now().toString(),
      name: employeeName,
      dateTime: currentDateTime,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address ? `${address.city || ''}, ${address.region || ''}` : ''
      },
      photoUri: photoUri,
    };

    try {
      const existingRecords = await AsyncStorage.getItem('attendanceRecords');
      let records = [];
      if (existingRecords) {
        records = JSON.parse(existingRecords);
      }
      records.push(attendanceRecord);
      await AsyncStorage.setItem('attendanceRecords', JSON.stringify(records));

      Alert.alert('Success', `Attendance saved successfully for ${employeeName}!`);

      // Reset the form
      setEmployeeName('');
      setPhotoUri(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to save attendance record.');
      console.error(e);
    }
  };

  if (showCamera) {
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
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing="front" ref={cameraRef}>
          <View style={styles.cameraButtons}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <Text style={styles.buttonText}>Take Selfie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCamera(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.label}>Employee Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={employeeName}
        onChangeText={setEmployeeName}
      />

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Location</Text>
        {loadingLoc ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : location ? (
          <>
            <Text style={styles.text}>Latitude: {location.coords.latitude.toFixed(6)}</Text>
            <Text style={styles.text}>Longitude: {location.coords.longitude.toFixed(6)}</Text>
            {address && (
              <Text style={styles.text}>
                Address: {address.name ? address.name + ', ' : ''}{address.street ? address.street + ', ' : ''}{address.city}, {address.region}, {address.country}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.text}>Location not available</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Selfie</Text>
        {photoUri ? (
          <View>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowCamera(true)}>
              <Text style={styles.secondaryButtonText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={() => setShowCamera(true)}>
            <Text style={styles.primaryButtonText}>Open Camera</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Attendance</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  text: {
    fontSize: 15,
    color: '#444',
    marginBottom: 5,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e5f1ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cameraButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  captureButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
  },
});
