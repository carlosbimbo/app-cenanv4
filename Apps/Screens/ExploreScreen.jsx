import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { ScrollView, TouchableOpacity, Text, View, Image, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'; // Importar LinearGradient
import iconeventobtn from "../../images/eventobtn.png"; // Icono del botón

export default function ExploreScreen({ route }) {
  const db = useSQLiteContext();
  const { user } = route.params;
  const navigation = useNavigation();

  const [eventItems, setEventItems] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);

  // Configuración de localización para el calendario
  LocaleConfig.locales["es"] = {
    monthNames: [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ],
    monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    today: "Hoy",
  };
  LocaleConfig.defaultLocale = "es";

  const transformEventsToMarkedDates = (events) => {
    const marked = {};
    events.forEach((event) => {
      marked[event.fecha] = {
        marked: true,
        dotColor: "blue",
        customStyles: {
          container: { backgroundColor: "#FFD700" },
          text: { color: "black", fontWeight: "bold" },
        },
      };
    });
    return marked;
  };

  useEffect(() => {
    const fetchEventItems = async () => {
      try {
        const results = await db.getAllAsync(
          "SELECT fecha FROM T_05_REGISTRO_EVENTOS WHERE iduser = ?",
          [user.id]
        );
        setEventItems(results);
        setMarkedDates(transformEventsToMarkedDates(results));
      } catch (error) {
        console.error("Error al obtener datos de los eventos:", error);
      }
    };

    fetchEventItems();
  }, [db, user.id]);

  useEffect(() => {
    const fetchEventsByDate = async () => {
      try {
        const results = await db.getAllAsync(
          "SELECT hora, tipo, estado FROM T_05_REGISTRO_EVENTOS WHERE fecha = ? AND iduser = ?",
          [selectedDate, user.id]
        );
        setEventsForSelectedDate(results);
      } catch (error) {
        console.error("Error al obtener eventos para la fecha seleccionada:", error);
      }
    };

    if (selectedDate) {
      fetchEventsByDate();
    }
  }, [selectedDate, db, user.id]);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleListingEvents = () => {
    navigation.push("register-events-gestante", { user });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <Text style={styles.title}>Registro de Agenda de Eventos</Text>

      <TouchableOpacity
        onPress={handleListingEvents}
        style={styles.createButton}
        activeOpacity={0.8}
      >
        <Image source={iconeventobtn} style={styles.buttonIcon} resizeMode="contain" />
        <Text style={styles.buttonText}>Crear Evento</Text>
      </TouchableOpacity>

      <View style={styles.calendarContainer}>
        <Calendar
          style={styles.calendar}
          markedDates={markedDates}
          markingType={"custom"}
          onDayPress={handleDayPress}
          theme={{
            todayTextColor: "#00adf5",
            selectedDayBackgroundColor: "#FF6347",
            selectedDayTextColor: "#ffffff",
            arrowColor: "orange",
            textDayFontWeight: "300",
            textMonthFontWeight: "bold",
            textDayFontSize: 16,
            textMonthFontSize: 18,
          }}
        />
      </View>

      <View style={styles.eventsContainer}>        
      <Text className="font-extrabold text-center text-[15px] bg-gradient-to-r from-purple-100 to-violet-200 p-2 text-blue-800 m-4 border border-green-700 rounded-xl shadow-lg">
      <Text className="text-purple-700">Eventos para {selectedDate || "ninguna fecha seleccionada"}</Text>
      </Text>  
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.eventsScroll}
        >
          {eventsForSelectedDate.length > 0 ? (
            eventsForSelectedDate.map((event, index) => (
              <LinearGradient
                key={index}
                colors={['#4c669f', '#3b5998', '#192f5d']} // Degradado
                style={styles.eventCard} // Estilo de la tarjeta
                start={{ x: 0, y: 0 }} // Dirección del degradado
                end={{ x: 1, y: 1 }} // Dirección del degradado
              >
                <Text style={styles.eventText}>Hora: {event.hora}</Text>
                <Text style={styles.eventText}>
                  Tipo: {event.tipo === 1 ? "Nota Libre" : event.tipo === 2 ? "Cita Medica" : "Toma de Medicamento"}
                </Text>
                <Text style={styles.eventText}>
                  Estado: {event.estado ? "Activo" : "Inactivo"}
                </Text>
              </LinearGradient>
            ))
          ) : (
            <Text style={styles.noEventsText}>No hay eventos para esta fecha.</Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: "#f0f4f8",
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#4a4a4a",
    marginBottom: 20,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 5,
  },
  buttonIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 10,
    elevation: 2,
  },
  eventsContainer: {
    marginTop: -20,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  eventsScroll: {
    flexDirection: "row",
  },
  eventCard: {
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    elevation: 3,
    width: 180,
  },
  eventText: {
    fontSize: 14,
    color: "#fff", // Blanco para resaltar sobre el fondo oscuro
    fontWeight: "bold", // Resaltar el texto
    marginBottom: 8,
    textShadowColor: "#000", // Sombra en el texto
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  noEventsText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginLeft: 10,
  },
});
