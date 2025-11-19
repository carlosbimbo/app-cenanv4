// Apps/Context/NetworkContext.js
import React, { createContext, useEffect, useState } from 'react';
import * as Network from 'expo-network';

// --- Estado global fuera del componente ---
let currentNetworkState = {
  isConnected: true,
  isInternetReachable: true,
};

// ✅ Función para consultar desde otros módulos
export const getCurrentNetworkState = () => currentNetworkState;

// Crear el contexto global
export const NetworkContext = createContext(currentNetworkState);

export const NetworkProvider = ({ children }) => {
  const [networkState, setNetworkState] = useState(currentNetworkState);

  useEffect(() => {
    const updateState = (state) => {
      currentNetworkState = {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      };
      setNetworkState(currentNetworkState);
      console.log('🌐 Estado de red:', currentNetworkState);
    };

    const subscription = Network.addNetworkStateListener(updateState);

    (async () => {
      const state = await Network.getNetworkStateAsync();
      updateState(state);
    })();

    return () => subscription.remove();
  }, []);

  return (
    <NetworkContext.Provider value={networkState}>
      {children}
    </NetworkContext.Provider>
  );
};
