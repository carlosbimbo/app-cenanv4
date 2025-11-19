import { openDatabaseSync } from "expo-sqlite";

export async function syncCenanData(CENAN2025) {
  const db = openDatabaseSync("auth.db");

  try {
    // 🚀 INICIO DE TRANSACCIÓN
    await db.execAsync("BEGIN TRANSACTION;");

    const users = CENAN2025?.users?.usuarios ?? [];
    for (const u of users) {
      await db.runAsync(
        `INSERT OR REPLACE INTO users 
          (id,username,password,dni,nombape,lati,longi,altura,lati_viv,longi_viv,altura_viv,profileImage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          u.id,u.username,u.password,u.dni,u.nombape,u.lati,u.longi,u.altura,u.lati_viv,u.longi_viv,u.altura_viv,u.profileImage
        ]
      );
    }

    const etapas = CENAN2025?.t_05_etapa_gestacional?.etapagesta ?? [];
    for (const g of etapas) {
      await db.runAsync(
        `INSERT OR REPLACE INTO t_05_etapa_gestacional 
         (id,opcgesta,fur,fec_proba_parto,eco_nro_sem_emb,eco_nro_dias_emb,hemoglo,calcu_nrosema,calcu_nrodias,calcu_nrodias_parto,calcu_fecaprox_parto)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          g.id,g.opcgesta,g.fur,g.fec_proba_parto,g.eco_nro_sem_emb,g.eco_nro_dias_emb,g.hemoglo,g.calcu_nrosema,g.calcu_nrodias,g.calcu_nrodias_parto,g.calcu_fecaprox_parto
        ]
      );
    }

    const suplementos = CENAN2025?.t_05_registro_suplementos?.suplement ?? [];
    for (const s of suplementos) {
      await db.runAsync(
        `INSERT OR REPLACE INTO t_05_registro_suplementos 
         (idsuple,iduser,fecha,tipo_suple,foto,nro_sema,destinationUri)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          s.idsuple,s.iduser,s.fecha,s.tipo_suple,s.foto,s.nro_sema,s.destinationUri
        ]
      );
    }

    const eventos = CENAN2025?.t_05_registro_eventos?.eventos ?? [];
    for (const e of eventos) {
      await db.runAsync(
        `INSERT OR REPLACE INTO t_05_registro_eventos 
         (ideven,iduser,tipo,fecha,hora,descrip,alarma,estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          e.ideven,e.iduser,e.tipo,e.fecha,e.hora,e.descrip,e.alarma,e.estado
        ]
      );
    }

    const agendas = CENAN2025?.t_05_agenda_gestacional?.agendaGestacional ?? [];
    for (const a of agendas) {
      await db.runAsync(
        `INSERT OR REPLACE INTO t_05_agenda_gestacional (id, nrosem, fec_marker)
         VALUES (?, ?, ?);`,
        [a.id, a.nrosem, a.fec_marker]
      );
    }

    const dias = CENAN2025?.t_05_dias_gestacion?.diasGestacion ?? [];
    for (const d of dias) {
      await db.runAsync(
        `INSERT OR REPLACE INTO t_05_dias_gestacion 
         (id_diasg, iduser, nroseman, fec_seman, fec_diagesta)
         VALUES (?, ?, ?, ?, ?);`,
        [
          d.id_diasg, d.iduser, d.nroseman,
          d.fec_seman, d.fec_diagesta
        ]
      );
    }

    await db.execAsync("COMMIT;");
    console.log("✅ Sincronización local completada correctamente");

  } catch (error) {
    await db.execAsync("ROLLBACK;");
    console.error("❌ Error durante la sincronización:", error);
    throw error;
  }
}
