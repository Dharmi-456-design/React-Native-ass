import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

export default function ScannerScreen() {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null);

  // Permission loading
  if (!permission) {
    return <View />;
  }

  // Permission
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.title}>
          Camera Permission Required
        </Text>

        <Button
          title="Allow Camera"
          onPress={requestPermission}
        />
      </View>
    );
  }

  // Scan
  const handleScan = ({ type, data }) => {
    if (scanned) {
      return;
    }

    setScanned(true);

    setResult({
      type: type,
      data: data,
    });
  };

  // Reset
  const handleReset = () => {
    setScanned(false);
    setResult(null);
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Travel Guardian Scanner
      </Text>

      <Text style={styles.status}>
        Camera Status: Ready
      </Text>

      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: [
            "qr",
            "code128",
            "code39",
            "code93",
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
          ],
        }}
        onBarcodeScanned={
          scanned ? undefined : handleScan
        }
      />

      {result && (
        <View style={styles.resultContainer}>

          <Text style={styles.resultTitle}>
            Scan Result
          </Text>

          <Text>
            Type: {result.type}
          </Text>

          <Text>
            Data: {result.data}
          </Text>

        </View>
      )}

      <Button
        title="Reset Scanner"
        onPress={handleReset}
      />

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

  status: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 16,
  },

  camera: {
    flex: 1,
    marginBottom: 10,
  },

  resultContainer: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
});