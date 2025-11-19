// hooks/userLocation.jsx
import * as Location from 'expo-location';

const getUserLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { errorMsg: 'Los permisos para la ubicación no fueron otorgados.' };
    }

    let { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    if (coords) {
      const { latitude, longitude, altitude } = coords;
      return { latitude, longitude, altitude, errorMsg: null };
    }
  } catch (error) {
    console.error('Error obteniendo ubicación:', error);
    return { errorMsg: 'Error al obtener la ubicación' };
  }
};

export default getUserLocation;

/*export const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Los permisos para la ubicación no fueron otorgados.');
        return { errorMsg: 'Permiso denegado' };
      }

      let { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (coords) {
        const { latitude, longitude, altitude } = coords;
        return { latitude, longitude, altitude, errorMsg: null };
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      return { errorMsg: 'Error al obtener la ubicación' };
    }
  };
  */