import React, { useEffect, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  Image,
  Modal,
  Alert,
  StyleSheet,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

export default function SuplementosDetail({ route }) {
  const db = useSQLiteContext();
  const { user } = route.params;
  const navigation = useNavigation();

  const [eventItems, setEventItems] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  //const [infogestant, setInfoGestant] = useState([]);

       //add 06012024
       /*useEffect(() => {
        const fetchInfoGestant = async () => {
          try {                  
            //const results = await db.getAllAsync('SELECT hemoglo FROM T_05_AGENDA_GESTACIONAL WHERE id = ?', [user.id]);    
            const results = await db.getAllAsync(`SELECT a.calcu_nrosema,a.calcu_nrodias,c.fecha,a.hemoglo,ifnull(c.totalpic,0) as totalpic FROM T_05_ETAPA_GESTACIONAL a left join (select iduser,fecha,COUNT(*) as totalpic from T_05_REGISTRO_SUPLEMENTOS where iduser = 1 and fecha = DATE('now', '-5 hours') group by iduser,fecha limit 1) c on c.iduser = a.id WHERE a.id = ?`, [user.id]);    
            //console.log(results);  
            setInfoGestant(results);
          } catch (error) {
            console.error('Error al obtener datos de la Gestante:', error);
          }
        };
    
        fetchInfoGestant();
      }, [db, user.id]);
      */
      //fin add 06012024

  //Add 06012024
  useEffect(() => {
    // Listener para capturar el evento de navegación hacia atrás
    const unsubscribe = navigation.addListener('beforeRemove', async(e) => {
      
      e.preventDefault(); // Evita que navegue automáticamente hacia atrás

      //add 16012025
      navigation.push('home', {          
        user: user,
      })   
      //Fin add 16012025    
     
      //console.log('mira infogestant : ',infogestant); 
      //infogestant.map((infgest) => {  
        
       // console.log('totalpic map ir SupleScreen infogestan : ',infgest.totalpic);       
       // console.log('hemoglo map ir SupleScreen infogestan : ',parseFloat(infgest.hemoglo)); 

       //Comment 16012025 debe tomar la foto en cualquier otro momento del dia y no obligarle a tomar en ese momento
       /*
       const results = await db.getFirstAsync(`SELECT a.calcu_nrosema,a.calcu_nrodias,c.fecha,a.hemoglo,ifnull(c.totalpic,0) as totalpic FROM T_05_ETAPA_GESTACIONAL a left join (select iduser,fecha,COUNT(*) as totalpic from T_05_REGISTRO_SUPLEMENTOS where iduser = 1 and fecha = DATE('now', '-5 hours') group by iduser,fecha limit 1) c on c.iduser = a.id WHERE a.id = ?`, [user.id]);    
       
          const levelhemo = parseFloat(results.hemoglo);
          const nrosem = parseInt(results.calcu_nrosema);
          const nrodays = parseInt(results.calcu_nrodias);
          const totalpictu = parseInt(results.totalpic);

          console.log('levelhemo supleme-calendar : ',levelhemo);
          console.log('nrosem supleme-calendar : ',nrosem);
          console.log('nrodays supleme-calendar : ',nrodays);          
          console.log('totalpictu supleme-calendar : ',totalpictu);

          if(levelhemo>=11){
            if(nrosem>13 || (nrosem==13 && nrodays > 0)){
              if(totalpictu==1){
                navigation.push('home', {          
                  user: user,
                })              
            }else{
              navigation.push('supleme-detail', {          
                user: user,
              })  
            }
            }
          }

          if(levelhemo<11){
            if(nrosem>7 || (nrosem==7 && nrodays > 0)){
              if(totalpictu<2){
                navigation.push('supleme-detail', {          
                  user: user,
                })            
              }else{
                navigation.push('home', {          
                  user: user,
                })  
              }          
            }
          }
       */
       
       /*console.log('results.totalpic calendar zz : ',results.totalpic);
        const totalpictu = parseInt(results.totalpic);
        if(totalpictu>0){
          navigation.push('home', {          
            user: user,
          })            
        }else{
          navigation.push('supleme-detail', {          
            user: user,
          })  
        }
        */

        //})
        
      // Personaliza el comportamiento: Navega hacia una pantalla específica
      /*Alert.alert(
        'Regresar',
        '¿Deseas ir a la pantalla principal xxx?',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => {} },
          {
            text: 'Sí',
            onPress: () =>navigation.push('supleme-detail', {          
              user: user,
            }),
          },
        ]
      );
      */

    });

    // Limpieza del listener
    return unsubscribe;
  }, [navigation]);
  //Fin add 06012024

  // Configuración de localización para el calendario
  LocaleConfig.locales["es"] = {
    monthNames: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    monthNamesShort: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    dayNames: [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ],
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
          "SELECT fecha FROM T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ?",
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
          "SELECT fecha, foto,destinationUri FROM T_05_REGISTRO_SUPLEMENTOS WHERE fecha = ? AND iduser = ?",
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

  const openModalWithImage = (imageUri) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <Text style={styles.title}>Toma de Suplementos</Text>

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
      <Text className="text-purple-700">Suplementos para {selectedDate || "ninguna fecha seleccionada"}</Text>
      </Text>  
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.eventsScroll}
        >
          {eventsForSelectedDate.length > 0 ? (
            eventsForSelectedDate.map((event, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => openModalWithImage(event.destinationUri)}
              >
                <LinearGradient
                  colors={["#4c669f", "#3b5998", "#192f5d"]}
                  style={styles.eventCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.eventText}>Fecha: {event.fecha}</Text>
                  <Image
                    source={{ uri: `file://${event.destinationUri}` }}
                    style={styles.eventImage}
                  />
                </LinearGradient>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEventsText}>No hay eventos para esta fecha.</Text>
          )}
        </ScrollView>
      </View>

      {/* Modal para mostrar la imagen ampliada */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <Image
            source={{ uri: `file://${selectedImage}` }}
            style={styles.modalImage}
          />
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    color: "#fff",
  },
  eventImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginTop: 10,
  },
  noEventsText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginLeft: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalImage: {
    width: "80%",
    height: "60%",
    resizeMode: "contain",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: "black",
  },
});
