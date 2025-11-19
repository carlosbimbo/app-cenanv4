import React, { useContext, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { NetworkContext } from "../../Context/NetworkContext";
import { WifiOff, Wifi } from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";

export const NetworkBanner = () => {
  const { isConnected, isInternetReachable } = useContext(NetworkContext);
  const [showConnectedBanner, setShowConnectedBanner] = useState(false);

  const offline = !isConnected || !isInternetReachable;

  useEffect(() => {
    if (!offline) {
      // ✅ Mostrar el banner verde solo por 3 segundos
      setShowConnectedBanner(true);
      const timer = setTimeout(() => setShowConnectedBanner(false), 3000);
      return () => clearTimeout(timer);
    } else {
      // 🔴 Si se pierde conexión, ocultamos el verde inmediatamente
      setShowConnectedBanner(false);
    }
  }, [offline]);

  return (
    <AnimatePresence>
      {offline ? (
        <MotiView
          from={{ translateY: -50, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          exit={{ translateY: -50, opacity: 0 }}
          transition={{ type: "timing", duration: 400 }}
          className="absolute top-0 left-0 right-0 z-50"
        >
          <View className="bg-red-600/95 flex-row items-center justify-center py-3 shadow-md rounded-b-2xl mx-auto w-11/12 mt-2">
            <WifiOff size={20} color="white" />
            <Text className="text-white font-semibold ml-2 text-base">
              Sin conexión a internet
            </Text>
          </View>
        </MotiView>
      ) : (
        showConnectedBanner && (
          <MotiView
            from={{ translateY: -50, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            exit={{ translateY: -50, opacity: 0 }}
            transition={{ type: "timing", duration: 400 }}
            className="absolute top-0 left-0 right-0 z-50"
          >
            <View className="bg-green-600/90 flex-row items-center justify-center py-3 shadow-md rounded-b-2xl mx-auto w-11/12 mt-2">
              <Wifi size={20} color="white" />
              <Text className="text-white font-semibold ml-2 text-base">
                Conectado nuevamente
              </Text>
            </View>
          </MotiView>
        )
      )}
    </AnimatePresence>
  );
};
