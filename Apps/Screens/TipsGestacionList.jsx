import React, { useState } from "react";
import {  
  Button,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  SafeAreaView,
} from "react-native";
import { AntDesign, MaterialIcons, Feather,FontAwesome5 } from "@expo/vector-icons"; // Íconos para los botones flotantes
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import ProgressBar from "react-native-progress/Bar";

export default function TipsGestacionList({ route }) {
  const { user } = route.params;

  const [points, setPoints] = useState(0);
  const maxPoints = 100;

  const progress = points / maxPoints; // Calcular el progreso (valor entre 0 y 1)
  

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f3f4f6",
      }}
    >
      <Text style={{ fontSize: 18, marginBottom: 10, fontWeight: "bold" }}>
        Puntos: {points}/{maxPoints}
      </Text>

      {/* Barra de progreso */}
      <ProgressBar
        progress={progress}
        width={null} // Se ajusta automáticamente al ancho del contenedor
        height={10} // Altura de la barra
        color={progress < 0.5 ? "#f87171" : "#4ade80"} // Cambia el color según el progreso
        borderRadius={5}
        borderColor="#d1d5db"
        unfilledColor="#e5e7eb"
        style={{ width: "100%" }}
      />

      {/* Botones para modificar el progreso */}
      <View style={{ marginTop: 20, width: "100%" }}>
        <View style={{ marginBottom: 10 }}>
          <Button
            title="Añadir Puntos"
            onPress={() => setPoints((prev) => Math.min(prev + 10, maxPoints))}
          />
        </View>
        <Button
          title="Restar Puntos"
          onPress={() => setPoints((prev) => Math.max(prev - 10, 0))}
        />
      </View>
    </SafeAreaView>
  );
}
