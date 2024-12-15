import { StyleSheet, Text, View, TextInput, Pressable, Alert, Image,TouchableOpacity,KeyboardAvoidingView,ScrollView,FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import LatestItemList from '../Components/HomeScreen/LatestItemList'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { Agenda } from 'react-native-calendars';
import { calendarTheme } from 'react-native-calendars'; // Import the default calendar theme
import { useNavigation } from '@react-navigation/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import DropDownPicker from 'react-native-dropdown-picker';
import iconeventobtn from '../../images/eventobtn.png';

export default function ExploreScreen({ route }) {
  const db = useSQLiteContext();
  const { user } = route.params;
  const navigation=useNavigation();
  const [eventItems, seteventItems] = useState([]);
  console.log('Entree ExploreScreen Principal',user);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    console.log('ExploreScreen selected day', day);
  };

  // Cargar datos de la base de datos
  useEffect(() => {
    const fetchEventItems = async () => {
      try {
        const results = await db.getAllAsync('SELECT * FROM T_05_REGISTRO_EVENTOS WHERE iduser = ?', [user.id]);
        console.log('Eventos del Usuario guardados : ',results);
        seteventItems(results);
      } catch (error) {
        console.error('Error al obtener datos de los eventos:', error);
      }
    };

    fetchEventItems();
  }, [db, user.id]);

  LocaleConfig.locales['fr'] = {
    monthNames: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Setiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ],
    monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr', 'May', 'Jun', 'Jul.', 'Ago', 'Set.', 'Oct.', 'Nov.', 'Dic.'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
    dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mie.', 'Jue.', 'Vie.', 'Sab.'],
    today: "Hoy"
  };
  
  LocaleConfig.defaultLocale = 'fr';

/////////////////////////////////////

const handlelistingEvents = async() => {

  //Alert.alert('Presionaste!', 'Presionaste handlelistingEvents!!!');   
  
  navigation.push('register-events-gestante', {   
    user: user,
  })
  

}

const [selectedDate, setSelectedDate] = useState('');
const [isPressed, setIsPressed] = useState(false);
  return (
    <>
   <View className="flex items-center justify-center px-4">
  <Text
    className="text-center font-extrabold text-base sm:text-lg md:text-xl bg-gradient-to-r from-purple-100 to-violet-200 p-4 text-blue-800 m-2 border border-green-700 rounded-xl shadow-lg w-full max-w-md"
  >
    <Text className="text-purple-700">Registro de Agenda de Eventos</Text>
  </Text>
</View>  
    <View style={styles.containerCalendar}>
    <TouchableOpacity 
      onPress={handlelistingEvents}   
      onPressIn={() => setIsPressed(true)} // Activa el estado "presionado"
      onPressOut={() => setIsPressed(false)} // Desactiva el estado al soltar
      className={`flex-row items-center justify-center rounded-lg ${
        isPressed ? 'bg-blue-700' : 'bg-blue-500'
      }`}
      style={{
        width: '70%', // Ajusta el ancho según la pantalla (un 80% del ancho disponible)
        height: 50, // Altura más estrecha para un diseño estilizado
        paddingVertical: 10, // Ajusta el relleno vertical
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      activeOpacity={0.8} // Reduce la opacidad al presionar
    >
      <Image
        source={iconeventobtn}
        className="w-8 h-8 mr-2" // Reduce el tamaño del ícono para que encaje con la altura del botón
        resizeMode="contain"
      />
      <Text className="text-white font-semibold text-base">Crear Evento</Text> 
    </TouchableOpacity> 
    <Calendar
    style={styles.calendar} 
    // Fecha seleccionada y resaltada en forma circular
    markedDates={{
      [selectedDate]: {
        selected: true,
        selectedColor: '#FF6347', // Color del círculo
        textColor: '#FFFFFF', // Color del texto
      },
    }}
    onDayPress={handleDayPress}
    theme={{     
      backgroundColor: '#ffffff',
      calendarBackground: '#ffffff',
      textSectionTitleColor: '#b6c1cd',
      selectedDayBackgroundColor: '#FF6347',
      selectedDayTextColor: '#ffffff',
      todayTextColor: '#00adf5',
      dayTextColor: '#2d4150',
      textDisabledColor: '#d9e1e8',
      arrowColor: 'orange',
      monthTextColor: 'blue',
      indicatorColor: 'blue',
      textDayFontWeight: '300',
      textMonthFontWeight: 'bold',
      textDayHeaderFontWeight: '300',
      textDayFontSize: 16,
      textMonthFontSize: 18,
      textDayHeaderFontSize: 16,
    }}
  />
</View>
</>
  )
}

const styles = StyleSheet.create({
  containerAdjusted: {
      flex: 1.7,
      justifyContent: 'flex-start', // Alinea los elementos al inicio
      alignItems: 'center',
      paddingTop: 20, // Espacio superior ajustable
      backgroundColor: '#fff',
      paddingHorizontal: 20,
  },
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingHorizontal: 20,
    }, containercalendario: {
      alignItems: 'center',
      marginBottom: 0,
      paddingTop: 20,
    },
    logo: {
      height: 150, // Reducido para ajustar el diseño
      width: 150,
      resizeMode: 'contain',
      marginBottom: 10, // Menos margen inferior
  }, icon: {
  marginRight: 10,
},
title: {
  fontSize: 22, // Más pequeño para ahorrar espacio
  fontWeight: 'bold',
  marginBottom: 10, // Menos margen inferior
},
input: {
  width: '80%',
  padding: 10,
  borderWidth: 1,
  borderColor: '#ccc',
  marginVertical: 5,
},
inputFocused: {
  backgroundColor: 'yellow',
  fontWeight: 'bold',
},
button: {
  backgroundColor: 'blue',
  padding: 10,
  marginVertical: 10,
  width: '80%',
  borderRadius: 5,
},
buttonText: {
  color: 'white',
  textAlign: 'center',
  fontSize: 16,
},
link: {
  marginTop: 5, // Reducido para ahorrar espacio
},
linkText: {
  color: 'blue',
  fontWeight: 'bold',
  fontSize: 16,
},
userText: {
  fontSize: 18,
  marginBottom: 30,
},
inputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  height: 50,
  backgroundColor: '#f1f1f1',
  borderRadius: 8,
  paddingHorizontal: 10,
  marginBottom: 15, // Espaciado más compacto entre inputs
},
containerCalendar: {
  flex: 1,
  justifyContent: 'flex-start', // Alinea los elementos al inicio
  alignItems: 'center',
  backgroundColor: '#fff',
  paddingHorizontal: 10,
  paddingTop: 20, // Ajusta la separación desde el borde superior
},
calendar: {
  width: '100%', // Asegura que el calendario ocupe todo el ancho disponible
  borderRadius: 10, // Opcional: redondea los bordes del calendario
  marginTop: 10, // Espacio mínimo entre el botón y el calendario
},containerCombate: {
  width: '70%', 
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#fff',
  paddingHorizontal: 10,
  marginBottom: 10,
},containerCombateButton: {
  width: '100%',     
  justifyContent: 'center',
  alignItems: 'center',    
  paddingHorizontal: 10,
  marginBottom: 100,
},

});

