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
        En Construcción
      </Text>
     
    </SafeAreaView>
  );
}
