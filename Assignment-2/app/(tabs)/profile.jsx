import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Switch, FlatList, Modal, Platform, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useSurvey } from '../../context/SurveyContext';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { surveys, deleteSurvey } = useSurvey();
  const defaultPhotoUri = 'https://avatars.githubusercontent.com/u/226024353?v=4';
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showSurveys, setShowSurveys] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [profileName, setProfileName] = useState('Dharmi Patel');
  const [profileRole, setProfileRole] = useState('Student');
  const [profileCollege, setProfileCollege] = useState('Swaminarayan University');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editCollege, setEditCollege] = useState('');

  const s = makeStyles(theme);

  // Load photo and profile info on mount
  React.useEffect(() => {
    AsyncStorage.multiGet(['@smartfield_profile_photo', '@smartfield_name', '@smartfield_role', '@smartfield_college']).then((vals) => {
      const [photo, name, role, college] = vals.map(v => v[1]);
      setProfilePhoto(photo || defaultPhotoUri);
      if (name) setProfileName(name);
      if (role) setProfileRole(role);
      if (college) setProfileCollege(college);
    });
  }, []);

  const savePhoto = async (uri) => {
    setProfilePhoto(uri);
    try {
      await AsyncStorage.setItem('@smartfield_profile_photo', uri);
    } catch (e) {
      console.error('Failed to save profile photo', e);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      savePhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take a profile photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      savePhoto(result.assets[0].uri);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert('Profile Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openEditModal = () => {
    setEditName(profileName);
    setEditRole(profileRole);
    setEditCollege(profileCollege);
    setEditModalVisible(true);
  };

  const saveProfile = async () => {
    const trimName = editName.trim();
    const trimRole = editRole.trim();
    const trimCollege = editCollege.trim();
    if (!trimName) {
      Alert.alert('Validation', 'Name cannot be empty.');
      return;
    }
    setProfileName(trimName);
    setProfileRole(trimRole || profileRole);
    setProfileCollege(trimCollege || profileCollege);
    try {
      await AsyncStorage.multiSet([
        ['@smartfield_name', trimName],
        ['@smartfield_role', trimRole || profileRole],
        ['@smartfield_college', trimCollege || profileCollege],
      ]);
    } catch (e) {
      console.error('Failed to save profile info', e);
    }
    setEditModalVisible(false);
  };

  const handleDeleteSurvey = (survey) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete "${survey.siteName}"?\nThis cannot be undone.`);
      if (confirmed) {
        if (survey.id) {
          deleteSurvey(survey.id);
        } else {
          deleteSurvey(null, survey);
        }
        alert('Survey deleted successfully!');
      }
    } else {
      Alert.alert(
        'Delete Survey',
        `Delete "${survey.siteName}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              if (survey.id) {
                deleteSurvey(survey.id);
              } else {
                deleteSurvey(null, survey);
              }
              Alert.alert('Success', 'Survey deleted successfully!');
            }
          },
        ]
      );
    }
  };

  const priorityColor = (p) => {
    if (p === 'High') return theme.danger;
    if (p === 'Low') return theme.success;
    return theme.warning;
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.contentContainer} showsVerticalScrollIndicator={false}>

      {/* ── Profile Header ── */}
      <View style={s.headerCard}>
        <TouchableOpacity onPress={handleChangePhoto} style={s.avatarWrapper}>
          <Image source={{ uri: profilePhoto || defaultPhotoUri }} style={s.avatarImage} />
          <View style={s.cameraOverlay}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={s.userName}>{profileName}</Text>
        <Text style={s.userRole}>{profileRole}</Text>
        <Text style={s.collegeName}>{profileCollege}</Text>
        <TouchableOpacity style={s.editProfileBtn} onPress={openEditModal}>
          <Ionicons name="pencil" size={14} color="#fff" />
          <Text style={s.editProfileBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats Row ── */}
      <View style={s.statsRow}>
        <TouchableOpacity style={[s.statBox, { backgroundColor: theme.primary }]} onPress={() => setShowSurveys(true)}>
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={s.statNum}>{surveys.length}</Text>
          <Text style={s.statLabel}>Surveys</Text>
        </TouchableOpacity>
        <View style={[s.statBox, { backgroundColor: theme.success }]}>
          <Ionicons name="checkmark-done" size={20} color="#fff" />
          <Text style={s.statNum}>{surveys.filter(s => s.priority === 'High').length}</Text>
          <Text style={s.statLabel}>High Priority</Text>
        </View>
        <View style={[s.statBox, { backgroundColor: theme.warning }]}>
          <Ionicons name="today" size={20} color="#fff" />
          <Text style={s.statNum}>{surveys.filter(sv => sv.date?.startsWith(new Date().toISOString().split('T')[0])).length}</Text>
          <Text style={s.statLabel}>Today</Text>
        </View>
      </View>

      {/* ── Account Details ── */}
      <Text style={s.sectionTitle}>Account Details</Text>
      <View style={s.card}>
        {[
          { icon: 'id-card-outline', label: 'Student ID', value: '2026-REACT-001' },
          { icon: 'mail-outline', label: 'Email', value: 'dharmip362@gmail.com' },
          { icon: 'call-outline', label: 'Phone', value: '9104187840' },
          { icon: 'school-outline', label: 'University', value: 'Swaminarayan University' },
        ].map((item, idx, arr) => (
          <View key={item.label}>
            <View style={s.row}>
              <View style={s.rowIcon}>
                <Ionicons name={item.icon} size={18} color={theme.primary} />
              </View>
              <View style={s.rowText}>
                <Text style={s.rowLabel}>{item.label}</Text>
                <Text style={s.rowValue}>{item.value}</Text>
              </View>
            </View>
            {idx < arr.length - 1 && <View style={s.divider} />}
          </View>
        ))}
      </View>

      {/* ── Saved Surveys ── */}
      <Text style={s.sectionTitle}>Saved Surveys</Text>
      <View style={s.card}>
        {surveys.length === 0 ? (
          <View style={s.emptyRow}>
            <Ionicons name="document-text-outline" size={32} color={theme.textLight} />
            <Text style={s.emptyText}>No surveys saved yet</Text>
          </View>
        ) : (
          surveys.slice().reverse().map((sv, idx) => (
            <View key={sv.id || idx}>
              <TouchableOpacity style={s.surveyRow} onPress={() => setSelectedSurvey(sv)}>
                <View style={[s.priorityDot, { backgroundColor: priorityColor(sv.priority) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.surveyName}>{sv.siteName}</Text>
                  <Text style={s.surveyClient}>{sv.clientName} • {new Date(sv.date).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteSurvey(sv)} style={s.trashBtn}>
                  <Ionicons name="trash-outline" size={18} color={theme.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
              {idx < surveys.length - 1 && <View style={s.divider} />}
            </View>
          ))
        )}
      </View>

      {/* ── Settings ── */}
      <Text style={s.sectionTitle}>Settings</Text>
      <View style={s.card}>
        {/* Theme Toggle */}
        <View style={s.settingRow}>
          <View style={s.rowIcon}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={theme.primary} />
          </View>
          <View style={s.rowText}>
            <Text style={s.rowValue}>Dark Mode</Text>
            <Text style={s.rowLabel}>{isDark ? 'Currently dark' : 'Currently light'}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={isDark ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={s.divider} />

        {/* Notifications */}
        <TouchableOpacity style={s.settingRow} onPress={() => Alert.alert('Notifications', 'Notification settings coming soon.')}>
          <View style={s.rowIcon}>
            <Ionicons name="notifications-outline" size={18} color={theme.textMuted} />
          </View>
          <Text style={[s.rowValue, { flex: 1 }]}>Notifications</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textLight} />
        </TouchableOpacity>

        <View style={s.divider} />

        {/* Privacy */}
        <TouchableOpacity style={s.settingRow} onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon.')}>
          <View style={s.rowIcon}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} />
          </View>
          <Text style={[s.rowValue, { flex: 1 }]}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textLight} />
        </TouchableOpacity>

        <View style={s.divider} />

        {/* Help */}
        <TouchableOpacity style={s.settingRow} onPress={() => Alert.alert('Help', 'Email: support@smartfield.edu')}>
          <View style={s.rowIcon}>
            <Ionicons name="help-circle-outline" size={18} color={theme.textMuted} />
          </View>
          <Text style={[s.rowValue, { flex: 1 }]}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textLight} />
        </TouchableOpacity>
      </View>

      <Text style={s.version}>Smart Field Survey App v1.0.0</Text>

      {/* ── Edit Profile Modal ── */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={s.inputLabel}>Full Name</Text>
            <TextInput
              style={[s.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor={theme.textLight}
            />
            <Text style={s.inputLabel}>Role</Text>
            <TextInput
              style={[s.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
              value={editRole}
              onChangeText={setEditRole}
              placeholder="e.g. Student, Developer"
              placeholderTextColor={theme.textLight}
            />
            <Text style={s.inputLabel}>University / College</Text>
            <TextInput
              style={[s.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
              value={editCollege}
              onChangeText={setEditCollege}
              placeholder="Enter your university"
              placeholderTextColor={theme.textLight}
            />
            <TouchableOpacity style={[s.saveBtn, { backgroundColor: theme.primary }]} onPress={saveProfile}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={s.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Survey Detail Modal ── */}
      <Modal visible={!!selectedSurvey} animationType="slide" transparent onRequestClose={() => setSelectedSurvey(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Survey Details</Text>
              <TouchableOpacity onPress={() => setSelectedSurvey(null)}>
                <Ionicons name="close-circle" size={26} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            {selectedSurvey && (
              <ScrollView>
                {[
                  { label: 'Site Name', value: selectedSurvey.siteName },
                  { label: 'Client Name', value: selectedSurvey.clientName },
                  { label: 'Priority', value: selectedSurvey.priority },
                  { label: 'Date', value: new Date(selectedSurvey.date).toLocaleString() },
                  { label: 'Description', value: selectedSurvey.description || 'N/A' },
                  { label: 'Notes', value: selectedSurvey.notes || 'N/A' },
                  { label: 'Location', value: selectedSurvey.location ? `Lat: ${selectedSurvey.location.lat?.toFixed(4)}, Lng: ${selectedSurvey.location.lng?.toFixed(4)}` : 'N/A' },
                  { label: 'Contact', value: selectedSurvey.contact ? `${selectedSurvey.contact.name} (${selectedSurvey.contact.number})` : 'N/A' },
                ].map(row => (
                  <View key={row.label} style={s.modalRow}>
                    <Text style={s.modalLabel}>{row.label}</Text>
                    <Text style={s.modalValue}>{row.value}</Text>
                  </View>
                ))}
                {selectedSurvey.photoUri && (
                  <Image source={{ uri: selectedSurvey.photoUri }} style={s.modalPhoto} />
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  contentContainer: { padding: 16, paddingBottom: 40 },
  headerCard: { backgroundColor: theme.card, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarImage: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: theme.primary },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, backgroundColor: theme.primaryMuted, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.primary },
  cameraOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.primary, borderRadius: 12, padding: 4 },
  userName: { fontSize: 22, fontWeight: '800', color: theme.text, letterSpacing: -0.5 },
  userRole: { fontSize: 14, color: theme.textMuted, fontWeight: '500', marginTop: 2 },
  collegeName: { fontSize: 13, color: theme.primary, fontWeight: '600', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: '600', textAlign: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: theme.card, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: theme.primaryMuted, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '500' },
  rowValue: { fontSize: 15, color: theme.text, fontWeight: '600', marginTop: 1 },
  divider: { height: 1, backgroundColor: theme.border, marginHorizontal: 14 },
  emptyRow: { padding: 24, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, color: theme.textLight, fontWeight: '500' },
  surveyRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  surveyName: { fontSize: 15, fontWeight: '700', color: theme.text },
  surveyClient: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  trashBtn: { padding: 6 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  version: { textAlign: 'center', fontSize: 12, color: theme.textLight, fontWeight: '500', marginTop: 4 },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: theme.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  editProfileBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 14, marginBottom: 4 },
  textInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, fontWeight: '500' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, borderRadius: 14, paddingVertical: 14 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  modalRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  modalLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  modalValue: { fontSize: 15, color: theme.text, fontWeight: '500', marginTop: 2 },
  modalPhoto: { width: '100%', height: 200, borderRadius: 12, marginTop: 12, resizeMode: 'cover' },
});