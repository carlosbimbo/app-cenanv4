// Apps/Services/api.js
import * as SecureStore from 'expo-secure-store';
import { getCurrentNetworkState } from '../Context/NetworkContext';

export const API_BASE_URL = 'https://www.macrocorpsystem.com/cenan2025';

export const apiFetch = async (endpoint, options = {}, requireAuth = false) => {
  // ✅ Chequeo de conexión
  const { isConnected, isInternetReachable } = getCurrentNetworkState();
  if (!isConnected || !isInternetReachable) {
    console.warn('🚫 Sin conexión a internet. Sincronización bloqueada.');
    throw new Error('No hay conexión a internet');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = { 'Content-Type': 'application/json' };

  let authHeaders = {};
  if (requireAuth) {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) authHeaders['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('❌ Error leyendo token:', error);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...authHeaders,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return null;
      //throw new Error(`Error ${response.status}: ${errorText}`);
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
  } catch (error) {
    //console.error('❌ Error en apiFetch:', error);
    throw error;
  }
};
