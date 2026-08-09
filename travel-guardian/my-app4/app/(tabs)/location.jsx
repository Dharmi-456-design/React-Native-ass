import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  Share,
  Linking,
} from "react-native";

import * as Location from "expo-location";

import MapView, { Marker } from "react-native-maps";

export default function LocationScreen() {

  const [location, setLocation] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);

  const [address, setAddress] = useState(null);

  const [search, setSearch] = useState("");

  const [heading, setHeading] = useState(null);

  const [tracking, setTracking] = useState(false);

  const [region, setRegion] = useState({
    latitude: 23.0225,
    longitude: 72.5714,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [watcher, setWatcher] = useState(null);


  // Get Current Location
  const handleGetLocation = async () => {

    const permission =
      await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Denied");
      return;
    }

    Alert.alert("Permission Granted");

    const currentLocation =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    if (currentLocation) {

      setLocation(currentLocation);

      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      // Reverse Geocoding
      const reverseGeoCoding =
        await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

      if (reverseGeoCoding.length > 0) {
        setAddress(reverseGeoCoding[0]);
      }
    }
  };


  // Last Known Location
  const handleLastLocation = async () => {

    const result =
      await Location.getLastKnownPositionAsync();

    if (result) {
      setLastLocation(result);
    } else {
      Alert.alert("No Last Known Location Found");
    }
  };


  // Search Location
  const handleSearch = async () => {

    if (search.trim() === "") {
      Alert.alert("Enter Place Name");
      return;
    }

    const result =
      await Location.geocodeAsync(search);

    if (result.length > 0) {

      setRegion({
        latitude: result[0].latitude,
        longitude: result[0].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

    } else {
      Alert.alert("Place Not Found");
    }
  };


  // Start Live Tracking
  const handleStartTracking = async () => {

    const permission =
      await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Denied");
      return;
    }

    const subscription =
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },

        (newLocation) => {

          setLocation(newLocation);

          setRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      );

    setWatcher(subscription);
    setTracking(true);
  };


  // Stop Tracking
  const handleStopTracking = () => {

    if (watcher) {
      watcher.remove();
      setWatcher(null);
    }

    setTracking(false);
  };


  // Heading
  const handleHeading = async () => {

    const result =
      await Location.getHeadingAsync();

    setHeading(result.magHeading);
  };


  // Share Coordinates
  const handleShare = async () => {

    if (!location) {
      Alert.alert("Get Location First");
      return;
    }

    const latitude =
      location.coords.latitude;

    const longitude =
      location.coords.longitude;

    await Share.share({
      message:
        `My Location:\nLatitude: ${latitude}\nLongitude: ${longitude}`,
    });
  };


  // Open Google Maps
  const handleOpenMaps = () => {

    if (!location) {
      Alert.alert("Get Location First");
      return;
    }

    const latitude =
      location.coords.latitude;

    const longitude =
      location.coords.longitude;

    const url =
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Linking.openURL(url);
  };


  // Cleanup Tracking
  useEffect(() => {

    return () => {

      if (watcher) {
        watcher.remove();
      }

    };

  }, [watcher]);


  return (

    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        My Location Dashboard
      </Text>


      {/* Search */}

      <TextInput
        style={styles.input}
        placeholder="Search Place..."
        value={search}
        onChangeText={setSearch}
      />

      <Button
        title="Search Place"
        onPress={handleSearch}
      />


      {/* Map */}

      <MapView
        style={styles.map}
        region={region}
      >

        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title={search || "Location"}
        />

      </MapView>


      {/* Current Location */}

      <Button
        title="Get Current Location"
        onPress={handleGetLocation}
      />


      {/* Last Location */}

      <Button
        title="Get Last Known Location"
        onPress={handleLastLocation}
      />


      {/* Tracking */}

      {!tracking ? (

        <Button
          title="Start Live Tracking"
          onPress={handleStartTracking}
        />

      ) : (

        <Button
          title="Stop Live Tracking"
          onPress={handleStopTracking}
        />

      )}


      {/* Heading */}

      <Button
        title="Get Compass Heading"
        onPress={handleHeading}
      />


      {/* Share */}

      <Button
        title="Share Coordinates"
        onPress={handleShare}
      />


      {/* Google Maps */}

      <Button
        title="Open Google Maps"
        onPress={handleOpenMaps}
      />


      {/* Current Location Details */}

      {location && (

        <View style={styles.details}>

          <Text style={styles.heading}>
            Current Location
          </Text>

          <Text>
            Latitude : {location.coords.latitude}
          </Text>

          <Text>
            Longitude : {location.coords.longitude}
          </Text>

          <Text>
            Accuracy : {location.coords.accuracy}
          </Text>

          <Text>
            Altitude : {location.coords.altitude}
          </Text>

          <Text>
            Speed : {location.coords.speed}
          </Text>

          <Text>
            Heading : {location.coords.heading}
          </Text>

        </View>

      )}


      {/* Last Known Location */}

      {lastLocation && (

        <View style={styles.details}>

          <Text style={styles.heading}>
            Last Known Location
          </Text>

          <Text>
            Latitude : {lastLocation.coords.latitude}
          </Text>

          <Text>
            Longitude : {lastLocation.coords.longitude}
          </Text>

          <Text>
            Accuracy : {lastLocation.coords.accuracy}
          </Text>

        </View>

      )}


      {/* Address */}

      {address && (

        <View style={styles.details}>

          <Text style={styles.heading}>
            Address
          </Text>

          <Text>
            City : {address.city}
          </Text>

          <Text>
            Region : {address.region}
          </Text>

          <Text>
            Country : {address.country}
          </Text>

          <Text>
            Postal Code : {address.postalCode}
          </Text>

          <Text>
            Street : {address.street}
          </Text>

          <Text>
            District : {address.district}
          </Text>

        </View>

      )}


      {/* Compass */}

      {heading !== null && (

        <View style={styles.details}>

          <Text style={styles.heading}>
            Compass
          </Text>

          <Text>
            Heading : {heading}°
          </Text>

        </View>

      )}

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  map: {
    width: "100%",
    height: 300,
    marginVertical: 15,
  },

  details: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
  },

  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

});