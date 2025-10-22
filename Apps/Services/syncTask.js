import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import { openDatabaseSync } from "expo-sqlite";
import * as SecureStore from 'expo-secure-store';

// Nombre de la tarea
const TASK_NAME = "SYNC_TASK";

// Base de datos local
const db = openDatabaseSync("auth.db");

// Callback opcional para mostrar logs dentro de la app
let logCallback = null;
export const setLogCallback = (callback) => (logCallback = callback);

// Configuración de notificaciones (para mostrar alertas visuales)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// 🧩 Definición de la tarea
TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const now = new Date().toLocaleTimeString();
    const startMsg = `🔄 [${now}] Ejecutando tarea de sincronización...`;
    console.log(startMsg);
    logCallback?.(startMsg);

    // 🔔 Notificación para confirmar ejecución
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔄 Sincronización iniciada",
        body: `Tarea ejecutada a las ${now}`,
      },
      trigger: null,
    });

    // ✅ Consulta usando getAllAsync (más segura que execAsync)
    const registros = await db.getAllAsync(
      "SELECT id, dni, nombape FROM users"
    );

    if (!registros || registros.length === 0) {
      const msg = `✅ [${now}] No hay registros pendientes`;
      console.log(msg);
      logCallback?.(msg);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✅ Sincronización completa",
          body: "No hay registros pendientes.",
        },
        trigger: null,
      });

      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Aquí podrías enviar datos reales al servidor (simulado por ahora)
    console.log(`📤 [${now}] ${registros.length} registros encontrados`);
    logCallback?.(`📤 [${now}] ${registros.length} registros encontrados`);

    const token = await SecureStore.getItemAsync('authToken');

    console.log(`📤 [${now}] ${token} es mi toen de usuario`);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "✅ Sincronización exitosa",
        body: `${registros.length} registros procesados correctamente.${token}`,
      },
      trigger: null,
    });

    return BackgroundFetch.BackgroundFetchResult.NewData;

  } catch (err) {
    const errorMsg = `❌ [${new Date().toLocaleTimeString()}] Error: ${err.message}`;
    console.error(errorMsg);
    logCallback?.(errorMsg);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "❌ Error en tarea de sincronización",
        body: err.message,
      },
      trigger: null,
    });

    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// 🧱 Registrar la tarea
export async function registerBackgroundSync() {
  try {
    const status = await BackgroundFetch.getStatusAsync();

    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
      console.warn("⚠️ Background fetch restringido por el sistema");
      return;
    }

    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 60, // ⏱️ cada 1 minuto
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log("✅ Background sync registrado correctamente");
  } catch (err) {
    console.error("❌ Error registrando background sync:", err);
  }
}
