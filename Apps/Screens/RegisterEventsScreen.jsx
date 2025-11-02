import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Image,
  TextInput,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import iconsavebtn from "../../images/btnsave.png";

export default function RegisterEventsScreen({ route }) {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const { user } = route.params;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [eventDetail, setEventDetail] = useState(""); // Estado para el detalle del evento

  const [dropdownItems, setDropdownItems] = useState([
    { label: "Nota Libre", value: 1 },
    { label: "Cita Medica", value: 2 },
    { label: "Toma de Medicamento", value: 3 },
  ]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const handleSaveEvents = async () => {
    if (!selectedDate || !selectedTime || selectedType === null || !eventDetail) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    try {
      const result = await db.getFirstAsync(
        "SELECT COALESCE(MAX(ideven), 0) + 1 AS nextId FROM T_05_REGISTRO_EVENTOS WHERE iduser = ?",
        [user.id]
      );
      const nextIdeven = result.nextId;

      await db.runAsync(
        "INSERT INTO T_05_REGISTRO_EVENTOS (ideven,iduser, tipo, fecha, hora, alarma, descrip) VALUES (?,?, ?, ?, ?, ?, ?)",
        [nextIdeven,user.id, selectedType, selectedDate, selectedTime, isEnabled ? 1 : 0, eventDetail]
      );

      console.log('guardadoBD Formu : ', `selectedDate: ${selectedDate} - selectedTime : ${selectedTime} - selectedType : ${selectedType} - isEnabled : ${isEnabled ? 1 : 0} - eventDetail : ${eventDetail}`); 

      Alert.alert("Éxito", "Evento registrado correctamente!");
      navigation.push("explore-tab");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo registrar el evento");
    }
  };

  const onChangeDate = (event, date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) {
      const formattedDate = date.toLocaleDateString("en-CA");
      setSelectedDate(formattedDate);
    }
  };

  const onChangeTime = (event, selectedTime) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      setSelectedTime(formattedTime);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text className="mb-4 font-extrabold text-center text-[16px] bg-gradient-to-r from-purple-100 to-violet-200 p-2 text-blue-800 border border-green-700 rounded-xl shadow-lg">
          <Text className="text-purple-700">Registro de Eventos</Text>
        </Text>

        <TextInput
          placeholder="Detalle del Evento"
          multiline
          style={styles.textArea}
          value={eventDetail} // Conecta el estado con el TextInput
          onChangeText={(text) => setEventDetail(text)} // Actualiza el estado al escribir
        />

        <View style={styles.controlContainer}>
          <Text style={styles.label}>Fecha:</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.inputText}>
              {selectedDate || "Selecciona una fecha"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}
        </View>

        <View style={styles.controlContainer}>
          <Text style={styles.label}>Hora:</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.inputText}>
              {selectedTime || "Selecciona una hora"}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="default"
              onChange={onChangeTime}
            />
          )}
        </View>

        <View style={styles.controlContainer}>
          <Text style={styles.label}>Tipo:</Text>
          <DropDownPicker
            open={openDropdown}
            value={selectedType}
            items={dropdownItems}
            setOpen={setOpenDropdown}
            setValue={setSelectedType}
            setItems={setDropdownItems}
            placeholder="Selecciona un tipo"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Estado:</Text>
          <Switch
            trackColor={{ false: "#d1d5db", true: "#85268d" }}
            thumbColor={isEnabled ? "#10b981" : "#85268d"}
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={styles.switch}
          />
        </View>

        <TouchableOpacity
          onPress={handleSaveEvents}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          style={[styles.button, isPressed && styles.buttonPressed]}
        >
          <Image source={iconsavebtn} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Crear Evento</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  controlContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  inputText: {
    fontSize: 16,
    color: "#4b5563",
  },
  dropdown: {
    borderColor: "#ccc",
    borderRadius: 8,
  },
  dropdownContainer: {
    borderColor: "#ccc",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switch: {
    transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }],
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#85268d",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonPressed: {
    backgroundColor: "#f789ec",
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
