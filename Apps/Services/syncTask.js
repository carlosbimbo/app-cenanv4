import * as BackgroundTask from "expo-background-task";
import { openDatabaseSync } from "expo-sqlite";
import axios from "axios";

const TASK_NAME = "SYNC_TASK";

// Usamos la versión síncrona en background
const db = openDatabaseSync("auth.db");

BackgroundTask.defineTask(TASK_NAME, async () => {
  try {
    console.log("🔄 Ejecutando syncTask...");

    // Leer registros pendientes
    const registros = await new Promise((resolve, reject) => {
      db.execAsync(
        [{ sql: "SELECT * FROM T_05_REGISTRO_SUPLEMENTOS WHERE estado IS NULL OR estado = 0", args: [] }],
        false
      ).then(result => {
        // result es un array de resultSets, tomamos el primero
        const rows = result[0]?.rows ?? [];
        resolve(rows);
      }).catch(reject);
    });

    if (!registros || registros.length === 0) {
      console.log("✅ No hay registros pendientes");
      return BackgroundTask.Result.NoData;
    }

    console.log("📤 Subiendo registros:", registros.length);

    // Enviar con Axios
    const response = await axios.post("https://tu-api.com/sync", { data: registros });

    if (response.status === 200) {
      // Marcar sincronizados
      await db.execAsync([
        { sql: "UPDATE T_05_REGISTRO_SUPLEMENTOS SET estado = 1 WHERE estado IS NULL OR estado = 0", args: [] }
      ]);
      console.log("✅ Sincronización completa");
      return BackgroundTask.Result.NewData;
    } else {
      console.log("⚠️ Error al sincronizar:", response.status);
      return BackgroundTask.Result.Failed;
    }
  } catch (err) {
    console.error("❌ Error en syncTask:", err);
    return BackgroundTask.Result.Failed;
  }
});

export async function registerBackgroundSync() {
  try {
    await BackgroundTask.registerTaskAsync(TASK_NAME, {
      minimumInterval: 120, // ⏱️ cada 2 minutos
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log("✅ Background sync registrado (cada 2 minutos)");
  } catch (err) {
    console.error("❌ Error registrando background sync:", err);
  }
}
