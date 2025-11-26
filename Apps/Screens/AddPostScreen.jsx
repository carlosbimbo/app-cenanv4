import React, { useState, useEffect, useRef } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE,Marker } from 'react-native-maps';
import eessmap from '../../images/eessgps.png';
import casagesta from '../../images/casitamap.png';
import FlotaButton from '../Components/Views/FlotaButton'

const GOOGLE_API_KEY = 'AIzaSyCSo_1eJlDb9mg_562DrKycx7whCrRopSM'; // Reemplaza con tu clave API de Google

export default function AddPostScreen({ route }) {
  const db = useSQLiteContext();
  const { user } = route.params;
  const [focusedInput, setFocusedInput] = useState(null); // Estado para rastrear qué TextInput está activo
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [markers, setMarkers] = useState([]); // Para almacenar los marcadores de SQLite
  const [region, setRegion] = useState({
    latitude: -12.0464,
    longitude: -77.0428,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const mapRef = useRef(null);

    // Cargar datos de la base de datos
    useEffect(() => {
      const fetchMarkers = async () => {
        try {

          const ressultuser = await db.getAllAsync('SELECT 700 AS id_eess,"MI CASA : ' + user.nombape + ' - ' + user.dni + '" as nombre_eess,COALESCE(lati_viv, lati) as gps_lat,COALESCE(longi_viv, longi) as gps_lon,"" as dir_eess FROM users WHERE id = ?', [user.id]);
          const results = await db.getAllAsync('SELECT id_eess,nombre_eess,gps_lat,gps_lon,dir_eess FROM T_LECT_EESS');
          const combinedResult = ressultuser.concat(results);
          //console.log(combinedResult);  
          setMarkers(combinedResult);
        } catch (error) {
          console.error('Error al obtener datos de la agenda:', error);
        }
      };
  
      fetchMarkers();
    }, [db, user.id]);

  const fetchPlaces = async (input) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${GOOGLE_API_KEY}&language=es`
      );
      const data = await response.json();
      setPlaces(data.predictions.slice(0, 5)); // Limitar resultados a los 5 primeros
    } catch (error) {
      console.error('Error al buscar lugares:', error);
    }
  };

  const handleSelectPlace = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}&language=es`
      );
      const data = await response.json();
      const location = data.result.geometry.location;

      const newRegion = {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setRegion(newRegion);
      setPlaces([]);
      setQuery('');
      mapRef.current.animateToRegion(newRegion, 1000);
    } catch (error) {
      console.error('Error al obtener detalles del lugar:', error);
    }
  };

  const handleLongPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    Alert.alert(
      'Guardar ubicación',
      `¿Deseas guardar esta ubicación como tu Vivienda?\nLat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: async() => {
            //const title = `Ubicación ${markers.length + 1}`;
            // saveLocation(latitude, longitude, title);
            console.log('Ubicación guardada pa Grabar:', { latitude, longitude });
            const resultudp =   await db.runAsync('UPDATE users SET lati_viv = ?,longi_viv = ? WHERE id = ?', [latitude,longitude,user.id]);  
            
          },
        },
      ]
    );
    
  };

  const renderPlaceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectPlace(item.place_id)}
    >
      <Text numberOfLines={1}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <>
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput          
          style={[
            styles.input,
            focusedInput === 'buscador' && styles.inputFocused,
          ]}     
          placeholder="Buscar...Realiza un Toque Prolongado sobre tu casa"
          value={query}
          onFocus={() => setFocusedInput('buscador')}
          onBlur={() => setFocusedInput(null)}
          onChangeText={(text) => {
            setQuery(text);
            if (text.length > 2) fetchPlaces(text);
          }}
        />
        {places.length > 0 && (
          <FlatList
            data={places}
            keyExtractor={(item) => item.place_id}
            renderItem={renderPlaceItem}
            style={styles.resultList}
          />
        )}
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onLongPress={handleLongPress}
        provider={PROVIDER_GOOGLE}
      >
        {markers.map((marker) => {
        // Asigna el icono según el tipo de marcador
        const markerIcon = marker.id_eess === 700 ? casagesta : eessmap;

        return (
          <Marker
            key={marker.id_eess}
            coordinate={{
              latitude: parseFloat(marker.gps_lat),
              longitude: parseFloat(marker.gps_lon),
            }}
            title={marker.nombre_eess}
            description={marker.dir_eess}
            image={markerIcon}  // Usa el icono según el tipo
          />
        );
      })}
      </MapView>
    </View>
    <FlotaButton />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  resultList: {
    maxHeight: 150,
  },
  resultItem: {
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  }, inputFocused: {
    backgroundColor: 'springgreen',
    fontWeight: 'bold',
  }
});
