import React, { useRef, useState } from "react";
import {
  View,
  Button,
  Text,
  Image,
  StyleSheet,
  Alert,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";

import { VideoView, useVideoPlayer } from "expo-video";
import * as MediaLibrary from "expo-media-library";

export default function CameraScreen() {
  const cameraRef = useRef(null);

  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  const [micPermission, requestMicPermission] =
    useMicrophonePermissions();

  const [cameraFacing, setCameraFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const [torch, setTorch] = useState(false);

  const [mode, setMode] = useState("picture");

  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);

  const [isRecording, setIsRecording] = useState(false);

  const player = useVideoPlayer(video);

  // Camera Permission
  if (!cameraPermission) {
    return <View />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.title}>Camera Permission Required</Text>

        <Button
          title="Allow Camera"
          onPress={requestCameraPermission}
        />
      </View>
    );
  }

  // Switch Camera
  const handleSwitchCamera = () => {
    setCameraFacing((previous) =>
      previous === "back" ? "front" : "back"
    );
  };

  // Flash
  const handleFlash = () => {
    setFlash((previous) =>
      previous === "off" ? "on" : "off"
    );
  };

  // Torch
  const handleTorch = () => {
    setTorch((previous) => !previous);
  };

  // Take Photo
  const handleTakePhoto = async () => {
    const result = await cameraRef.current?.takePictureAsync();

    if (result) {
      setPhoto(result.uri);
      setVideo(null);

      await MediaLibrary.saveToLibraryAsync(result.uri);

      Alert.alert("Success", "Photo saved");
    }
  };

  // Start Video
  const handleStartRecording = async () => {
    if (!micPermission?.granted) {
      await requestMicPermission();
      return;
    }

    setIsRecording(true);

    try {
      const result = await cameraRef.current?.recordAsync();

      if (result) {
        setVideo(result.uri);
        setPhoto(null);

        await MediaLibrary.saveToLibraryAsync(result.uri);

        Alert.alert("Success", "Video saved");
      }
    } catch (error) {
      console.log(error);
    }

    setIsRecording(false);
  };

  // Stop Video
  const handleStopRecording = () => {
    cameraRef.current?.stopRecording();
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Travel Guardian Camera</Text>

      // camera
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraFacing}
          flash={flash}
          enableTorch={torch}
          mode={mode}
        />
      </View>

      //modes
      <View style={styles.row}>
        <Button
          title="Photo"
          onPress={() => setMode("picture")}
        />

        <Button
          title="Video"
          onPress={() => setMode("video")}
        />
      </View>

      // control
      <View style={styles.row}>
        <Button
          title="Switch Camera"
          onPress={handleSwitchCamera}
        />

        <Button
          title={`Flash: ${flash}`}
          onPress={handleFlash}
        />

        <Button
          title={`Torch: ${torch ? "ON" : "OFF"}`}
          onPress={handleTorch}
        />
      </View>

      //use for take a photo
      {mode === "picture" && (
        <Button
          title="Take Photo"
          onPress={handleTakePhoto}
        />
      )}

      {mode === "video" && (
        <>
          <Button
            title="Start Recording"
            onPress={handleStartRecording}
            disabled={isRecording}
          />

          <Button
            title="Stop Recording"
            onPress={handleStopRecording}
            disabled={!isRecording}
          />
        </>
      )}

      // use for photo
      {photo && (
        <View>
          <Text style={styles.resultText}>Captured Photo</Text>

          <Image
            source={{ uri: photo }}
            style={styles.image}
          />

          <Text>URI: {photo}</Text>
        </View>
      )}

      // use for video
      {video && (
        <View>
          <Text style={styles.resultText}>Recorded Video</Text>

          <VideoView
            player={player}
            style={styles.video}
          />

          <Text>URI: {video}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  cameraContainer: {
    width: "100%",
    height: 350,
  },

  camera: {
    flex: 1,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 8,
  },

  image: {
    width: "100%",
    height: 200,
    marginTop: 10,
  },

  video: {
    width: "100%",
    height: 200,
    marginTop: 10,
  },

  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
});