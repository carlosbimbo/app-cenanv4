import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Image,
  TextInput,
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

  // States
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([
    { label: "Nota Libre", value: 1 },
    { label: "Cita Medica", value: 2 },
    { label: "Toma de Medicamento", value: 3 },
  ]);

  // Focus states for controls
  const [focusedField, setFocusedField] = useState(null);

  // Modal states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  // Handle Save Event
  const handleSaveEvents = async () => {
    if (!selectedDate || !selectedTime || selectedType === null) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    try {
     
    console.log('guardadoBD Formu : ', `selectedDate: ${selectedDate} - selectedTime : ${selectedTime} - selectedType : ${selectedType} - isEnabled : ${isEnabled ? 1 : 0}`); 
    
     const resinsevent = await db.runAsync('INSERT INTO T_05_REGISTRO_EVENTOS (iduser,tipo,fecha,hora,alarma) VALUES (?,?,?,?,?)', [user.id, selectedType,selectedDate,selectedTime,isEnabled ? 1 : 0]);
         
      Alert.alert("Éxito", "Evento registrado correctamente!");
      //navigation.goBack();
      navigation.push('explore-tab');
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo registrar el evento");
    }
  };

  // Handlers for Date Picker
  const onChangeDate = (event, date) => {
    if (Platform.OS === "android") setShowDatePicker(false); // Close picker on Android
    if (date) {
      // Formatear la fecha sin cambiar la zona horaria
      const formattedDate = date.toLocaleDateString("en-CA"); // Formato: YYYY-MM-DD
      setSelectedDate(formattedDate);
    }
  };

  // Handlers for Time Picker
  const onChangeTime = (event, selectedTime) => {
    if (Platform.OS === "android") setShowTimePicker(false); // Close picker on Android
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`; // HH:MM
      setSelectedTime(formattedTime);
    }
  };
  const [isPressed, setIsPressed] = useState(false);
  return (
    <View className="flex-1 bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      {/* Título */}
      <Text className="font-extrabold text-center text-[15px] bg-gradient-to-r from-purple-100 to-violet-200 p-4 text-blue-800 m-2 border border-green-700 rounded-xl shadow-lg">
      <Text className="text-purple-700">Registro de Eventos</Text>
      </Text>  

      {/* Fecha */}
      <View className={`my-2 ${focusedField === "date" ? "bg-purple-100" : ""} p-2 rounded-lg`}
        onFocus={() => setFocusedField("date")}
        onBlur={() => setFocusedField(null)}>
        <Text className="text-base font-medium text-gray-800 mb-1">Fecha:</Text>
        <TouchableOpacity
          className="border border-gray-300 rounded-md p-3 bg-white shadow-sm"
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-gray-600">{selectedDate || "Selecciona una fecha"}</Text>
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

      {/* Hora */}
      <View className={`my-2 ${focusedField === "time" ? "bg-purple-100" : ""} p-2 rounded-lg`}
        onFocus={() => setFocusedField("time")}
        onBlur={() => setFocusedField(null)}>
        <Text className="text-base font-medium text-gray-800 mb-1">Hora:</Text>
        <TouchableOpacity
          className="border border-gray-300 rounded-md p-3 bg-white shadow-sm"
          onPress={() => setShowTimePicker(true)}
        >
          <Text className="text-gray-600">{selectedTime || "Selecciona una hora"}</Text>
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

      {/* Dropdown */}
      <View className={`my-2 ${focusedField === "type" ? "bg-purple-100" : ""} p-2 rounded-lg`}
        onFocus={() => setFocusedField("type")}
        onBlur={() => setFocusedField(null)}>
        <Text className="text-base font-medium text-gray-800 mb-1">Tipo:</Text>
        <DropDownPicker
          open={openDropdown}
          value={selectedType}
          items={dropdownItems}
          setOpen={setOpenDropdown}
          setValue={setSelectedType}
          setItems={setDropdownItems}
          placeholder="Selecciona un tipo"
          style={{
            borderColor: focusedField === "type" ? "#7c3aed" : "#ccc",
            borderRadius: 6,
          }}
          dropDownContainerStyle={{
            borderColor: "#ccc",
          }}
          labelStyle={{ color: "#4b5563" }}
          selectedItemLabelStyle={{ color: "#7c3aed", fontWeight: "bold" }}
        />
      </View>

      {/* Switch */}
      <View className="flex-row items-center justify-between my-4">
        <Text className="text-base font-medium text-gray-800">Estado:</Text>
        <Switch
            trackColor={{ false: "#d1d5db", true: "#34d399" }}
            thumbColor={isEnabled ? "#10b981" : "#f3f4f6"}
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
          />
      </View>

      {/* Botón Guardar */}
      <TouchableOpacity 
      onPress={handleSaveEvents}   
      onPressIn={() => setIsPressed(true)} // Activa el estado "presionado"
      onPressOut={() => setIsPressed(false)} // Desactiva el estado al soltar
      className={`flex-row items-center justify-center bg-gradient-to-r from-green-400 to-green-600 rounded-lg ${
        isPressed ? 'bg-blue-700' : 'bg-blue-500'
      }`}
      style={{
        width: "70%",
        alignSelf: "center",
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
      }}
      activeOpacity={0.8} // Reduce la opacidad al presionar
    >
      <Image
        source={iconsavebtn}
        className="w-8 h-8 mr-2" // Reduce el tamaño del ícono para que encaje con la altura del botón
        resizeMode="contain"
      />
      <Text className="text-white font-semibold text-base">Crear Evento</Text> 
    </TouchableOpacity>
    </View>
  );
}
