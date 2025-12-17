import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import { openDatabaseSync } from "expo-sqlite";
import { apiFetch } from "./api";
import { getCurrentNetworkState } from "../Context/NetworkContext";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
//import { waitForUnlock, acquireTaskLock, releaseTaskLock } from "../Utils/TaskCoordinator";

const TASK_NAME = "SYNC_TASK";
const SYNC_CHANNEL_ID = "sync_channel"; // 👈 Canal exclusivo para la sincronización

// 🧩 Configuración inicial de notificaciones (debe llamarse al iniciar la app)
export async function setupNotifications() {
  try {
    // 🟢 Permitir mostrar notificaciones incluso si la app está abierta
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // 🟢 Pedir permisos si no existen
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("🚫 Permiso de notificaciones denegado por el usuario");
      return;
    }

    // 🟢 Canal de notificaciones en Android (canal separado para sincronización)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(SYNC_CHANNEL_ID, {
        name: "Sincronización automática",
        description: "Canal exclusivo para las notificaciones de sincronización de datos.",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
      console.log("📱 Canal de notificaciones Android configurado (SYNC_CHANNEL_ID)");
    }
  } catch (error) {
    console.error("❌ Error configurando notificaciones:", error);
  }
}
async function syncFotos(db) {
  try {
    
    const fotos = await db.getAllAsync(
      "SELECT destinationUri, foto FROM T_05_REGISTRO_SUPLEMENTOS WHERE destinationUri IS NOT NULL"
    );

    if (fotos.length === 0) {
      console.log("📁 No hay fotos para sincronizar");
      return 0;
    }

    let fotosSync = 0;

    for (const item of fotos) {
      const localUri = item.destinationUri;
      const nombreOriginal = item.foto;   

      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists) {
        console.log("⚠️ Foto NO existe físicamente en el dispositivo:", localUri);
        continue;
      }

      const formData = new FormData();
      formData.append("fotos", {
        uri: localUri,
        type: "image/jpeg",
        name: nombreOriginal,  
      });

      try {
        const res = await fetch(
          "https://www.macrocorpsystem.com/cenan2025/upload-fotos",
          {
            method: "POST",
            body: formData, 
          }
        );

        const text = await res.text();
        let resultado;

        try {
          resultado = JSON.parse(text);
        } catch (err) {
          console.log("❌ Servidor devolvió HTML:");
          console.log(text);
          throw new Error("Respuesta inválida");
        }

        console.log("📤 Foto enviada:", resultado);
        fotosSync++;
      } catch (err) {
        console.log("❌ Error enviando foto:", err.message);
      }
    }

    return fotosSync;
  } catch (err) {
    console.error("❌ Error general en syncFotos:", err);
    return 0;
  }
}

// 🧩 Función principal de sincronización
export async function performSync() {
  try {
    /*await waitForUnlock(); // espera a que no haya otra tarea
    await acquireTaskLock("SYNC_TASK"); // bloquea mientras se ejecuta*/

    const { isConnected, isInternetReachable } = getCurrentNetworkState();
    if (!(isConnected || isInternetReachable)) {
      console.log("⚠️ Sin conexión, omitiendo sincronización");
      return;
    }

    const now = new Date().toLocaleTimeString();
    console.log(`🔁 Ejecutando sincronización a las ${now}`);

    const db = openDatabaseSync("auth.db");

    // 🔹 Consulta de tablas locales
    const users = await db.getAllAsync("SELECT * FROM users");
    const etapas = await db.getAllAsync("SELECT * FROM T_05_ETAPA_GESTACIONAL");
    const eventos = await db.getAllAsync("SELECT * FROM T_05_REGISTRO_EVENTOS");
    const supleme = await db.getAllAsync("SELECT * FROM T_05_REGISTRO_SUPLEMENTOS");
    const agendages = await db.getAllAsync("SELECT * FROM T_05_AGENDA_GESTACIONAL");
    const diasges = await db.getAllAsync("SELECT * FROM T_05_DIAS_GESTACION");

    console.log(`📦 ${users.length} usuarios, ${etapas.length} etapas, ${eventos.length} eventos, ${supleme.length} supleme, ${agendages.length} agendages, ${diasges.length} diasges`);

    let usersSynced = 0;
    let etapasSynced = 0;
    let eventosSynced = 0;
    let suplemeSynced = 0;
    let agendaSynced = 0;
    let diasgesSynced = 0;

    //udp tokenapp User
    const viduser = await SecureStore.getItemAsync("userlogintask");
    const exisUser = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [viduser]);
    if (exisUser) {          
    const { status } = await Notifications.requestPermissionsAsync();
    const udpusertoken =
      status === "granted"
        ? (await Notifications.getExpoPushTokenAsync()).data
        : null;
      console.log("udpusertoken de syncTask send postgres:", udpusertoken);    
      const udpusertok =   await db.runAsync('UPDATE users SET expopushtoken = ? WHERE id = ?', [udpusertoken,viduser]);                  
    }
    //fin udp tokenapp User

    if (users.length > 0) {
      try {
        const sync_users = await apiFetch(
          "/syncalluser",
          { method: "POST", body: JSON.stringify(users) },
          true
        );
        console.log("✅ Users sincronizadas correctamente");
        usersSynced = users.length;
      } catch (err) {
        console.log("❌ Error sincronizando users:", err.message);
      }
    }

    if (etapas.length > 0) {
      try {
        const sync_eta = await apiFetch(
          "/saveorudparragesta",
          { method: "POST", body: JSON.stringify(etapas) },
          true
        );
        console.log("✅ Etapas sincronizadas correctamente");
        etapasSynced = etapas.length;
      } catch (err) {
        console.log("❌ Error sincronizando etapas:", err.message);
      }
    }

    if (eventos.length > 0) {
      try {
        const sync_events = await apiFetch(
          "/syncalleventuser",
          { method: "POST", body: JSON.stringify(eventos) },
          true
        );
        console.log("✅ Eventos sincronizados correctamente");
        eventosSynced = eventos.length;
      } catch (err) {
        console.log("❌ Error sincronizando eventos:", err.message);
      }
    }

    if (supleme.length > 0) {
      try {
        const sync_suple = await apiFetch(
          "/syncallsuple",
          { method: "POST", body: JSON.stringify(supleme) },
          true
        );
        console.log("✅ Suplementos sincronizados correctamente");
        suplemeSynced = supleme.length;
      } catch (err) {
        console.log("❌ Error sincronizando suplementos:", err.message);
      }
    }

    if (agendages.length > 0) {
      try {
        const sync_agenda = await apiFetch(
          "/syncallagendagesta",
          { method: "POST", body: JSON.stringify(agendages) },
          true
        );
        console.log("✅ Agenda Gestacional sincronizadas correctamente");
        agendaSynced = agendages.length;
      } catch (err) {
        console.log("❌ Error sincronizando Agenda Gestacional:", err.message);
      }
    }

    if (diasges.length > 0) {
      try {
        const sync_diasges = await apiFetch(
          "/syncalldaysgesta",
          { method: "POST", body: JSON.stringify(diasges) },
          true
        );
        console.log("✅ Días Gestación sincronizados correctamente");
        diasgesSynced = diasges.length;
      } catch (err) {
        console.log("❌ Error sincronizando Días Gestación:", err.message);
      }
    }

    //Para actualizar en todo momento el token expo de notificaciones
    const vuserId = await SecureStore.getItemAsync("userlogintask");
    const { status } = await Notifications.requestPermissionsAsync();
    const vexpopushtoken =
      status === "granted"
        ? (await Notifications.getExpoPushTokenAsync()).data
        : null;
    console.log("expopushtoken de syncTask to postgres:", vexpopushtoken);
    const payload = {
      userId: vuserId,
      expopushtoken: vexpopushtoken,
    };    
    const result = await apiFetch("/save-userexpotoken", {
      method: "POST",      
      body: JSON.stringify(payload),
    });
    //Fin Para actualizar en todo momento el token expo de notificaciones

    const fotosSynced = await syncFotos(db);

    // 🟢 Mostrar notificación de éxito con canal exclusivo
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "✅ Sincronización exitosa",
        body: `Usuarios: ${usersSynced}, Etapas: ${etapasSynced}, Eventos: ${eventosSynced}, Suplementos: ${suplemeSynced}, Agenda: ${agendaSynced}, Días: ${diasgesSynced}`,
        sound: "default",
        channelId: SYNC_CHANNEL_ID, // 👈 Canal específico
      },
      trigger: null,
    });

    console.log("📢 Notificación mostrada correctamente");
  } catch (err) {
    console.error("❌ Error general en sincronización:", err);

    // 🔴 Notificación de error con canal exclusivo
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "❌ Error en sincronización",
        body: err.message ?? "Error desconocido",
        sound: "default",
        channelId: SYNC_CHANNEL_ID,
      },
      trigger: null,
    });
  }/*finally {
    await releaseTaskLock();
  }*/
}

// 🔹 Define la tarea background
TaskManager.defineTask(TASK_NAME, async () => {
  console.log("🕒 Tarea SYNC_TASK ejecutada en segundo plano");
  await performSync();
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// 🔸 Registrar tarea
export async function registerBackgroundSync() {
  try {
    const status = await BackgroundFetch.getStatusAsync();

    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
      console.warn("⚠️ Background fetch restringido por el sistema");
      return;
    }

    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 180, // cada 3 minutos
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log("✅ Background sync registrado correctamente");
  } catch (err) {
    console.error("❌ Error registrando BackgroundFetch:", err);
  }
}
