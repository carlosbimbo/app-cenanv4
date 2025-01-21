import React, { useState } from "react";
import {
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
import { useNavigation } from '@react-navigation/native'

export default function FlotaButton() {
  const navigation=useNavigation();
  // Estado para manejar la visibilidad de los botones secundarios
  const [isFabOpen, setFabOpen] = useState(false);
  const rotation = useSharedValue(0);

  // Animación para los botones flotantes
  const offset1 = useSharedValue(0);
  
  const handleFabPress = () => {
    setFabOpen(!isFabOpen);
    rotation.value = withTiming(isFabOpen ? 0 : 45, { duration: 300 });
    offset1.value = withTiming(isFabOpen ? 0 : -80, { duration: 300 });    
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const buttonStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: offset1.value }],
  }));


  return (
    <SafeAreaView >    

    {/* Botones flotantes secundarios */}
    <Animated.View
      style={[
        buttonStyle1,
        {
          position: "absolute",
          bottom: 20,
          right: 20,
        },
      ]}
    >
      <TouchableOpacity
        className="bg-red-500 w-14 h-14 rounded-full justify-center items-center shadow-lg"
        onPress={() => navigation.navigate('Login')}
      >
        <FontAwesome5 name="user-lock" size={24} color="white" />         
      </TouchableOpacity>
    </Animated.View>

    {/* Floating Action Button principal */}
    <View
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
      }}
    >
      <TouchableOpacity
        onPress={handleFabPress}
        className="bg-fuchsia-800 w-16 h-16 rounded-full flex justify-center items-center shadow-lg"
      >
        <Animated.View style={animatedStyle}>            
          <AntDesign name="plus" size={28} color="white" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
  );
}
