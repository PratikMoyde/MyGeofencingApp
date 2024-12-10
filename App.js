import {
  Button,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native'
import React, { useState, useEffect } from 'react'
import MapView, { Marker, Circle } from 'react-native-maps'
import Geolocation from '@react-native-community/geolocation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { getDistance } from 'geolib'

const deviceHeight = Dimensions.get('window').height
const deviceWidth = Dimensions.get('window').width

const App = () => {
  
  const [location, setLocation] = useState({
    latitude: 37.4219984,
    longitude: -122.084,
    radius: 500,
  })
  
  const [radius, setRadius] = useState('')
  const [watchId, setWatchId] = useState(null)

  // Get current location and update state with latitude and longitude
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log('Current Location:', latitude, longitude)
        setLocation((prevLocation) => ({
          ...prevLocation,
          latitude,
          longitude,
        }))
      },
      (error) => {
        console.error('Error fetching location:', error)
        Alert.alert('Failed to fetch current location. Please try again.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )
  }

  // Start tracking the user's location and check if they exit the geofence
  const startTracking = () => {
    console.log('User Location:', latitude, longitude)
    const id = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log('User Location:', latitude, longitude)

        const distance = getDistance(
          { latitude, longitude },
          { latitude: location.latitude, longitude: location.longitude }
        )

        console.log(`Distance from geofence: ${distance} meters`)

        if (distance > location.radius) {
          Alert.alert(
            'Geofence Alert',
            'You have exited the geofence!',
            [{ text: 'OK' }]
          )
        }
      },
      (error) => console.error('Error watching location:', error),
      { enableHighAccuracy: true, distanceFilter: 10, interval: 5000 }
    )
    console.log("🚀 ~ startTracking ~ id:", id)
    setWatchId(id)
  }

  // Stop tracking the user's location and clear the watcher
  const stopTracking = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId)
      setWatchId(null)
      console.log('Stopped tracking location.')
    }
  }

  // Clean up watcher when the component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      stopTracking()
    }
  }, [])
                                                                                                                                                                                                                 
  // Header component displaying the app title and location fetch button
  const Header = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>Geolocation</Text>
        <TouchableOpacity onPress={getCurrentLocation}>
          <Image
            style={{ width: 20, height: 20, resizeMode: 'contain' }}
            source={require('./src/constants/Images/target.png')}
          />
        </TouchableOpacity>
      </View>
    )
  }

  // Render the app layout with map, radius input, and tracking buttons
  return (
    <View style={styles.mainContainer}>
      <Header />
      <KeyboardAwareScrollView>
        <View style={{ flex: 1 }}>
          <View style={styles.mapView}>
            <MapView
              style={styles.map}
              region={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Geofence Center"
              />
              <Circle
                center={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                radius={location.radius}
                strokeColor="rgba(0, 150, 255, 0.5)"
                fillColor="rgba(0, 150, 255, 0.2)"
              />
            </MapView>
          </View>
          <View style={styles.textInputBox}>
            <Text style={styles.textInputLabel}>Radius (meters):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Please Select Range"
              value={radius}
              keyboardType="numeric"
              onChangeText={(text) => {
                setRadius(text)
              }}
            />
          </View>
          <Button
            title="Set Range"
            onPress={() => {
              if (radius !== '') {
                setLocation({ ...location, radius: parseInt(radius) })
              }
            }}
          />
          <Button
            title={watchId ? 'Stop Tracking' : 'Start Tracking'}
            onPress={watchId ? stopTracking : startTracking}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}

export default App

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 50,
    marginTop: Platform.OS === 'ios' ? 48 : StatusBar?.currentHeight + 5,
    flexDirection: 'row',
    paddingHorizontal: 15,
    alignItems: 'center',
    borderBottomWidth: 1.2,
    borderColor: '#ccc',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  mapView: {
    height: 350,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  map: {
    flex: 1,
  },
  textInputBox: {
    height: 60,
    width: deviceWidth,
    paddingHorizontal: 15,
    justifyContent: 'space-evenly',
  },
  textInputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  textInput: {
    width: '100%',
    height: 35,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
})
