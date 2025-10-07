import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  SafeAreaView,Platform
} from "react-native";
import { AntDesign, MaterialIcons, Feather,FontAwesome5 } from "@expo/vector-icons"; // Íconos para los botones flotantes
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from '@react-navigation/native'
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

export default function FlotaButton() {
  const navigation=useNavigation();
  const db = useSQLiteContext();
  // Estado para manejar la visibilidad de los botones secundarios
  const [isFabOpen, setFabOpen] = useState(false);
  const rotation = useSharedValue(0);

  // Animación para los botones flotantes
  const offset1 = useSharedValue(0);
  const offset2 = useSharedValue(0);
  
  const handleFabPress = () => {
    setFabOpen(!isFabOpen);
    rotation.value = withTiming(isFabOpen ? 0 : 45, { duration: 300 });
    offset1.value = withTiming(isFabOpen ? 0 : -80, { duration: 300 });    
    offset2.value = withTiming(isFabOpen ? 0 : -150, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const buttonStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: offset1.value }],
  }));

  const buttonStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: offset2.value }],
  }));

  const exportDb = async () => {
    try {
      // Fuerza a escribir todos los cambios de WAL → archivo principal
      await db.execAsync("PRAGMA wal_checkpoint(FULL);");
      await db.execAsync("VACUUM;");

      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
          const now = new Date();
          const dd = String(now.getDate()).padStart(2, "0");
          const mm = String(now.getMonth() + 1).padStart(2, "0");
          const yyyy = now.getFullYear();
          const fileName = `auth_${dd}_${mm}_${yyyy}.db`;

          // Lee el archivo real actualizado
          const base64 = await FileSystem.readAsStringAsync(
            FileSystem.documentDirectory + "SQLite/auth.db",
            { encoding: FileSystem.EncodingType.Base64 }
          );

          const uri =
            await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              fileName,
              "application/octet-stream"
            );

          await FileSystem.writeAsStringAsync(uri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          console.log("Backup exportado con éxito:", uri);
        } else {
          console.log("Permiso no concedido");
        }
      } else {
        await Sharing.shareAsync(FileSystem.documentDirectory + "SQLite/auth.db");
      }
    } catch (e) {
      console.error("Error al exportar backup:", e);
    }
  };

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

     {/* Botón secundario 2 */}
     <Animated.View
        style={[
          buttonStyle2,
          { position: "absolute", bottom: 20, right: 20 },
        ]}
      >
        <TouchableOpacity
          className="bg-blue-500 w-14 h-14 rounded-full justify-center items-center shadow-lg"
          onPress={exportDb}
        >
          <Feather name="database" size={24} color="white" />
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
