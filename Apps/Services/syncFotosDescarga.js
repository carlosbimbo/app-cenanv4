// syncFotosDescarga.js
import * as FileSystem from "expo-file-system";
//import { openDatabaseSync } from "expo-sqlite";

export async function syncDescargarFotos(username) {
  //const db = openDatabaseSync("auth.db");
  console.log('syncDescargarFotos : ',username);

  try {
    console.log("📡 Consultando fotos remotas...");

    const res = await fetch(
      `https://www.macrocorpsystem.com/cenan2025/fotos-usuario/${username}`
    );

    const data = await res.json();

    if (!data.fotos || data.fotos.length === 0) {
      console.log("📭 No hay fotos remotas para este usuario");
      return;
    }

    for (const item of data.fotos) {
      const remoteUrl = item.url;
      const nombreArchivo = item.foto;

      const localPath = FileSystem.documentDirectory + nombreArchivo;

      // Si ya existe, no descargar de nuevo
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        console.log("✔ Foto ya existe localmente:", nombreArchivo);

        /*await db.runAsync(
          `UPDATE t_05_registro_suplementos 
           SET destinationUri = ? 
           WHERE foto = ?`,
          [localPath, nombreArchivo]
        );*/

        continue;
      }

      // Descargar archivo
      const descarga = await FileSystem.downloadAsync(remoteUrl, localPath);

      if (descarga.status === 200) {
        console.log("📥 Foto descargada:", nombreArchivo);

        /*await db.runAsync(
          `UPDATE t_05_registro_suplementos 
           SET destinationUri = ?
           WHERE foto = ?`,
          [localPath, nombreArchivo]
        );
        */
      }
    }

    console.log("✅ Descarga de fotos completada");

  } catch (err) {
    console.log("❌ Error en descarga de fotos", err);
  }
}
