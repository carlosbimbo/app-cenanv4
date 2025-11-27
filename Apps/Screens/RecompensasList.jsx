import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  Text,
  FlatList,
  View,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Image,
} from "react-native";
import { MaterialIcons } from "react-native-vector-icons"; // Importa los iconos de MaterialIcons
import { useNavigation } from "@react-navigation/native";
import YoutubePlayer from "react-native-youtube-iframe";
import { AntDesign,FontAwesome5,MaterialCommunityIcons,FontAwesome6 } from "@expo/vector-icons"; // Para íconos de botones
import Animated, { Easing, useAnimatedStyle, withSpring } from "react-native-reanimated";
import ProgressBar from "react-native-progress/Bar"; // Importar la barra de progreso
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import logosinfoto from '../../images/sinfoto.png';

// Componente para cada video
const VideoList = ({ user }) => {
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  //const [resumentakesuple, setResumentakesuple] = useState([]);
  const db = useSQLiteContext();
  const togglePlaying = useCallback((videoId) => {
    setPlayingVideoId((prev) => (prev === videoId ? null : videoId));
  }, []);

    //
    const fetchResumentakesuple = useCallback(async () => {
      try {        
        const query = `
        SELECT 
            R.iduser, R.nro_sema_combinado, R.video_group, R.total_score_sumado, R.nrosemas_actual, 
            R.show_video, R.video_premio_desc, R.video_premio_ruta,R.video_premio_codigoid, R.orden_video
        FROM (
            SELECT 
                ? as iduser, '13' as nro_sema_combinado, 13 as video_group, 210 as total_score_sumado, 
                (select (case when calcu_nrodias > 0 then (calcu_nrosema + 1) else calcu_nrosema end) as nrosemas_actual from T_05_ETAPA_GESTACIONAL where id = ? limit 1) as nrosemas_actual, 1 as show_video, video_premio_desc, video_premio_ruta,video_premio_codigoid, 1000 as orden_video 
            FROM T_LECT_SEMANAS 
            WHERE nro_semana = 13
            UNION ALL
						SELECT 
                ? as iduser, '14' as nro_sema_combinado, 14 as video_group, 210 as total_score_sumado, 
                (select (case when calcu_nrodias > 0 then (calcu_nrosema + 1) else calcu_nrosema end) as nrosemas_actual from T_05_ETAPA_GESTACIONAL where id = ? limit 1) as nrosemas_actual, 1 as show_video, video_premio_desc, video_premio_ruta,video_premio_codigoid, 999 as orden_video 
            FROM T_LECT_SEMANAS 
            WHERE nro_semana = 10 AND (SELECT nro_sema FROM T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? limit 1) >= 14 
						UNION ALL
						SELECT 
                ? as iduser, '15' as nro_sema_combinado, 15 as video_group, 210 as total_score_sumado, 
                (select (case when calcu_nrodias > 0 then (calcu_nrosema + 1) else calcu_nrosema end) as nrosemas_actual from T_05_ETAPA_GESTACIONAL where id = ? limit 1) as nrosemas_actual, 1 as show_video, video_premio_desc, video_premio_ruta,video_premio_codigoid, 998 as orden_video 
            FROM T_LECT_SEMANAS 
            WHERE nro_semana = 11 AND (SELECT nro_sema FROM T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? limit 1) >= 15 
						UNION ALL
						SELECT 
                ? as iduser, '16' as nro_sema_combinado, 16 as video_group, 210 as total_score_sumado, 
                (select (case when calcu_nrodias > 0 then (calcu_nrosema + 1) else calcu_nrosema end) as nrosemas_actual from T_05_ETAPA_GESTACIONAL where id = ? limit 1) as nrosemas_actual, 1 as show_video, video_premio_desc, video_premio_ruta,video_premio_codigoid, 997 as orden_video 
            FROM T_LECT_SEMANAS 
            WHERE nro_semana = 12 AND (SELECT nro_sema FROM T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? limit 1) >= 16 
            UNION ALL
            SELECT
                U.iduser, U.nro_sema_combinado, U.video_group, U.total_score_sumado, U.nrosemas_actual,
                U.show_video,
                CASE WHEN show_video = 1 THEN F.video_premio_desc ELSE null END AS video_premio_desc,
                CASE WHEN show_video = 1 THEN F.video_premio_ruta ELSE null END AS video_premio_ruta,
                CASE WHEN show_video = 1 THEN F.video_premio_codigoid ELSE null END AS video_premio_codigoid,               
								ROW_NUMBER() OVER (ORDER BY U.video_group ASC) AS orden_video
            FROM (
                SELECT
                    H.iduser, H.nro_sema_combinado, H.video_group, H.total_score_sumado, H.nrosemas_actual,
                    CASE WHEN IFNULL( total_score_sumado, 0 ) BETWEEN 180 AND 210 THEN 1 ELSE CASE WHEN IFNULL( total_score_sumado, 0 ) > 10 THEN 1 ELSE 0 END END AS show_video
                FROM (
                    SELECT
                        iduser, GROUP_CONCAT(nroseman, ',') AS nro_sema_combinado, video_group,
                        SUM(total_score) AS total_score_sumado, nrosemas_actual
                    FROM (
                        SELECT
                            W.iduser, W.nroseman, S.video_group, SUM(IFNULL(W.score_gesta, 0)) AS total_score,
                            W.nrosemas_actual
                        FROM (                   
											select 
												IFNULL(T.iduser,Z.iduser) as iduser,IFNULL(T.nro_sema,Z.nroseman) as nroseman,IFNULL(T.score_gesta,10) as score_gesta,
												IFNULL(T.nro_sema,(SELECT nro_sema FROM T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? limit 1)) as nrosemas_actual,IFNULL(T.fecha,Z.fec_diagesta) as fecha,
												(case when IFNULL(T.iduser,-1) == -1 then 0 else 1 end) as isfilluser												
												from T_05_DIAS_GESTACION Z
                       left JOIN 
											 (
											 SELECT
                                T.iduser, T.nro_sema,
                                (CASE WHEN T.hemoglo < 11 THEN (total_pictu * 5) ELSE (total_pictu * 10) END) AS score_gesta,
                                T.nrosemas_actual,T.fecha
                            FROM (
                                SELECT
                                    X.iduser, CAST(Y.hemoglo AS Float) AS hemoglo, X.fecha,
                                    COUNT(DISTINCT X.foto) AS total_pictu, X.nro_sema,
                                    (CASE WHEN Y.calcu_nrodias > 0 THEN (Y.calcu_nrosema + 1) ELSE Y.calcu_nrosema END)
                                    AS nrosemas_actual
                                FROM T_05_REGISTRO_SUPLEMENTOS X
                                JOIN T_05_ETAPA_GESTACIONAL Y ON Y.id = X.iduser
                                WHERE X.iduser = ? AND X.fecha <= DATE('now', '-5 hours')
                                GROUP BY X.fecha
                            ) AS T                            
                            WHERE T.iduser = ?
												) T ON T.iduser = Z.iduser AND T.fecha = Z.fec_diagesta
												where nroseman BETWEEN 16 and 40 and Z.fec_diagesta <= DATE('now', '-5 hours')
					
                        ) AS W
                        JOIN T_LECT_SEMANAS S ON S.nro_semana = W.nroseman
                        GROUP BY W.iduser, W.nroseman, S.video_group
					
                    ) AS P
                    GROUP BY iduser, video_group, nrosemas_actual
			
                ) AS H
            ) AS U
            JOIN T_LECT_SEMANAS F ON F.nro_semana = U.video_group
            WHERE U.show_video = 1
        ) AS R
        where R.video_group is not null and NOT(R.video_group = 13 and R.orden_video = 0)
        ORDER BY R.orden_video DESC, R.video_group DESC;
        `;
        
        //COMMENT 04112025
        //CASE WHEN IFNULL(total_score_sumado, 0) BETWEEN 180 AND 210 THEN 1 ELSE 0 END AS show_video
        //console.log(query);                      
        const rstakesupl = await db.getAllAsync(query, [
          user.id,
          user.id,
          user.id,
          user.id,
          user.id,
          user.id,
          user.id,
          user.id,
          user.id,
          user.id,
          user.id,
          user.id,
          user.id,
          user.id
        ]);  
        //JOIN T_05_DIAS_GESTACION Z ON T.iduser = Z.iduser AND T.fecha = Z.fec_diagesta AND T.nro_sema = Z.nroseman
        //console.log('Resumen tomo suplementos fetchResumentakesuple:', rstakesupl);
        setVideos(rstakesupl);
      } catch (error) {
        console.error('Error al obtener datos de semana de gestacion y toma de suplementos en recompensas:', error);
      }
    }, [db, user.id]);
  
  
  
    useEffect(() => {
      fetchResumentakesuple();
      const loadVideos = async () => {
        setLoading(true);
        setTimeout(() => {
          //setVideos(resumentakesuple);
          setLoading(false);
        }, 1000);
      };
  
      loadVideos();
    }, [fetchResumentakesuple]);

  const screenWidth = Dimensions.get("window").width;
  const videoHeight = screenWidth < 400 ? 180 : 250;

  const renderItem = ({ item }) => (
    <View style={styles.videoContainer}>
      <Text style={styles.videoTitle}>{item.video_premio_desc}</Text>
      <YoutubePlayer height={videoHeight} videoId={item.video_premio_codigoid} play={playingVideoId === item.video_premio_codigoid} />
      <TouchableOpacity onPress={() => togglePlaying(item.video_premio_codigoid)} style={styles.playPauseButton}>
        <Text style={styles.playPauseText}>
          {playingVideoId === item.video_premio_codigoid ? "Pausar" : "Reproducir"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Cargando videos...</Text>
      </View>
    );
  }
  //console.log('videos si : ',videos);
  return (
    <FlatList
      data={videos}
      renderItem={renderItem}
      keyExtractor={(item, index) => item + index}
      contentContainerStyle={styles.listContent}
      numColumns={1}
    />
  );
};

const Formulario1 = ({ user }) => (
  <SafeAreaView className="p-4">
    <Text className="text-xl">Lista de Videos</Text>
    <VideoList user={user} />
  </SafeAreaView>
);

const Formulario2 = ({ user }) => (
  <SafeAreaView className="p-4">
    <Text className="text-xl">Mis Consejos</Text>
    <VideoConsejosList user={user} />
  </SafeAreaView>
);

const Formulario3 = ({ user }) => (
  <SafeAreaView className="p-4">
    <Text className="text-xl">Mis Reels</Text> 
    <VideoReelsList user={user} />  
  </SafeAreaView>
);

const TabContent = ({ selectedTab, user }) => {
  //console.log('user TabContent user.id : ',user.id);
  switch (selectedTab) {
    case 1:
      return <Formulario1 user={user} />;
    case 2:
      return <Formulario2 user={user} />;
    case 3:
      return <Formulario3 user={user} />;
    default:
      return <Formulario1 />;
  }
};

// 🔥 Versión completa de VideoConsejosList corregida
const VideoConsejosList = ({ user }) => {
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [rawVideos, setRawVideos] = useState([]); // ← almacena los datos crudos de SQLite
  const db = useSQLiteContext();

  const togglePlaying = useCallback((videoId) => {
    setPlayingVideoId((prev) => (prev === videoId ? null : videoId));
  }, []);

  // 🔍 Consulta a la base de datos
  const fetchResumentakesuple = useCallback(async () => {
    try {

      const query = `
              SELECT
              W.iduser,
              W.nroseman,
              W.nroseman AS video_group,
              SUM(IFNULL(W.score_gesta, 0)) AS total_score,
              W.nrosemas_actual,
              CASE
                  WHEN SUM(IFNULL(W.score_gesta, 0)) = 0 THEN NULL
                  WHEN SUM(IFNULL(W.score_gesta, 0)) = 10 THEN tips_emb1_desc
                  WHEN SUM(IFNULL(W.score_gesta, 0)) = 20 THEN tips_emb1_desc || '|' || tips_emb2_desc
                  WHEN SUM(IFNULL(W.score_gesta, 0)) = 30 THEN tips_emb1_desc || '|' || tips_emb2_desc || '|' || tips_emb3_desc
                  WHEN SUM(IFNULL(W.score_gesta, 0)) = 40 THEN tips_emb1_desc || '|' || tips_emb2_desc || '|' || tips_emb3_desc || '|' || tips_cons1_desc
                  WHEN SUM(IFNULL(W.score_gesta, 0)) > 40 THEN tips_emb1_desc || '|' || tips_emb2_desc || '|' || tips_emb3_desc || '|' || tips_cons1_desc
                  ELSE NULL
              END AS descrip_video,
              CASE
                  WHEN SUM(IFNULL(W.score_gesta, 0)) = 0 THEN NULL
                  WHEN SUM(IFNULL(W.score_gesta, 0)) = 10 THEN tips_emb1_ruta
                  WHEN SUM(IFNULL(W.score_gesta, 0)) = 20 THEN tips_emb1_ruta || '|' || tips_emb2_ruta
                  WHEN SUM(IFNULL(W.score_gesta, 0)) = 30 THEN tips_emb1_ruta || '|' || tips_emb2_ruta || '|' || tips_emb3_ruta
                  WHEN SUM(IFNULL(W.score_gesta, 0)) = 40 THEN tips_emb1_ruta || '|' || tips_emb2_ruta || '|' || tips_emb3_ruta || '|' || tips_cons1_ruta
                  WHEN SUM(IFNULL(W.score_gesta, 0)) > 40 THEN tips_emb1_ruta || '|' || tips_emb2_ruta || '|' || tips_emb3_ruta || '|' || tips_cons1_ruta
                  ELSE NULL
              END AS consejos_videoid
            FROM (        
                SELECT 
                    IFNULL(T.iduser,Z.iduser) AS iduser,
                    Z.nroseman,
                    IFNULL(T.score_gesta,10) AS score_gesta,
                    IFNULL(T.nro_sema,(SELECT nro_sema FROM T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? LIMIT 1)) AS nrosemas_actual,
                    IFNULL(T.fecha,Z.fec_diagesta) AS fecha,
                    S.tips_emb1_ruta,
                    S.tips_emb2_ruta,
                    S.tips_emb3_ruta,
                    S.tips_cons1_ruta,
                    S.tips_emb1_desc,
                    S.tips_emb2_desc,
                    S.tips_emb3_desc,
                    S.tips_cons1_desc
                FROM T_05_DIAS_GESTACION Z
                JOIN (
                    SELECT
                        T.iduser, T.nro_sema,
                        (CASE WHEN T.hemoglo < 11 THEN (total_pictu * 5) ELSE (total_pictu * 10) END) AS score_gesta,
                        T.nrosemas_actual, T.fecha
                    FROM (
                        SELECT
                            X.iduser,
                            CAST(Y.hemoglo AS FLOAT) AS hemoglo,
                            X.fecha,
                            COUNT(DISTINCT (X.idsuple || X.iduser)) AS total_pictu,
                            (X.nro_sema - 1) as nro_sema,
                            (CASE WHEN Y.calcu_nrodias > 0 THEN (Y.calcu_nrosema) ELSE Y.calcu_nrosema - 1 END) AS nrosemas_actual
                        FROM T_05_REGISTRO_SUPLEMENTOS X
                        JOIN T_05_ETAPA_GESTACIONAL Y ON Y.id = X.iduser
                        WHERE X.iduser = ?
                          AND X.fecha <= DATE('now', '-5 hours')
                        GROUP BY X.fecha
                    ) AS T
                    WHERE T.iduser = ?
                ) T ON T.iduser = Z.iduser AND T.fecha = Z.fec_diagesta
                JOIN T_LECT_SEMANAS S ON S.nro_semana = Z.nroseman
                WHERE Z.nroseman BETWEEN 13 AND 40
                  AND Z.fec_diagesta <= DATE('now', '-5 hours')
            ) AS W
            GROUP BY W.iduser, W.nroseman
            ORDER BY W.nroseman DESC;
      `;

      /*
      const query = `
        SELECT
          W.iduser,
          W.nroseman,
          W.nroseman AS video_group,
          SUM(IFNULL(W.score_gesta, 0)) AS total_score,
          W.nrosemas_actual,
          CASE
              WHEN SUM(IFNULL(W.score_gesta, 0)) = 0 THEN NULL
              WHEN SUM(IFNULL(W.score_gesta, 0)) = 10 THEN tips_emb1_desc
              WHEN SUM(IFNULL(W.score_gesta, 0)) = 20 THEN tips_emb1_desc || '|' || tips_emb2_desc
              WHEN SUM(IFNULL(W.score_gesta, 0)) = 30 THEN tips_emb1_desc || '|' || tips_emb2_desc || '|' || tips_emb3_desc
              WHEN SUM(IFNULL(W.score_gesta, 0)) = 40 THEN tips_emb1_desc || '|' || tips_emb2_desc || '|' || tips_emb3_desc || '|' || tips_cons1_desc
              WHEN SUM(IFNULL(W.score_gesta, 0)) > 40 THEN tips_emb1_desc || '|' || tips_emb2_desc || '|' || tips_emb3_desc || '|' || tips_cons1_desc
              ELSE NULL
          END AS descrip_video,
          CASE
              WHEN SUM(IFNULL(W.score_gesta, 0)) = 0 THEN NULL
              WHEN SUM(IFNULL(W.score_gesta, 0)) = 10 THEN tips_emb1_ruta
              WHEN SUM(IFNULL(W.score_gesta, 0)) = 20 THEN tips_emb1_ruta || '|' || tips_emb2_ruta
              WHEN SUM(IFNULL(W.score_gesta, 0)) = 30 THEN tips_emb1_ruta || '|' || tips_emb2_ruta || '|' || tips_emb3_ruta
              WHEN SUM(IFNULL(W.score_gesta, 0)) = 40 THEN tips_emb1_ruta || '|' || tips_emb2_ruta || '|' || tips_emb3_ruta || '|' || tips_cons1_ruta
              WHEN SUM(IFNULL(W.score_gesta, 0)) > 40 THEN tips_emb1_ruta || '|' || tips_emb2_ruta || '|' || tips_emb3_ruta || '|' || tips_cons1_ruta
              ELSE NULL
          END AS consejos_videoid
        FROM (        
            SELECT 
                IFNULL(T.iduser,Z.iduser) AS iduser,
                Z.nroseman,
                IFNULL(T.score_gesta,10) AS score_gesta,
                IFNULL(T.nro_sema,(SELECT nro_sema FROM T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? LIMIT 1)) AS nrosemas_actual,
                IFNULL(T.fecha,Z.fec_diagesta) AS fecha,
                S.tips_emb1_ruta,
                S.tips_emb2_ruta,
                S.tips_emb3_ruta,
                S.tips_cons1_ruta,
                S.tips_emb1_desc,
                S.tips_emb2_desc,
                S.tips_emb3_desc,
                S.tips_cons1_desc
            FROM T_05_DIAS_GESTACION Z
            JOIN (
                SELECT
                    T.iduser, T.nro_sema,
                    (CASE WHEN T.hemoglo < 11 THEN (total_pictu * 5) ELSE (total_pictu * 10) END) AS score_gesta,
                    T.nrosemas_actual, T.fecha
                FROM (
                    SELECT
                        X.iduser,
                        CAST(Y.hemoglo AS FLOAT) AS hemoglo,
                        X.fecha,
                        COUNT(DISTINCT X.foto) AS total_pictu,
                        X.nro_sema,
                        (CASE WHEN Y.calcu_nrodias > 0 THEN (Y.calcu_nrosema + 1) ELSE Y.calcu_nrosema END) AS nrosemas_actual
                    FROM T_05_REGISTRO_SUPLEMENTOS X
                    JOIN T_05_ETAPA_GESTACIONAL Y ON Y.id = X.iduser
                    WHERE X.iduser = ?
                      AND X.fecha <= DATE('now', '-5 hours')
                    GROUP BY X.fecha
                ) AS T
                WHERE T.iduser = ?
            ) T ON T.iduser = Z.iduser AND T.fecha = Z.fec_diagesta
            JOIN T_LECT_SEMANAS S ON S.nro_semana = Z.nroseman
            WHERE Z.nroseman BETWEEN 13 AND 40
              AND Z.fec_diagesta <= DATE('now', '-5 hours')
        ) AS W
        GROUP BY W.iduser, W.nroseman
        ORDER BY W.nroseman DESC;
      `;
      */

      const rstakesupl = await db.getAllAsync(query, [user.id, user.id, user.id]);
      setRawVideos(rstakesupl); // ← guardamos el resultado original
    } catch (error) {
      console.error("Error al obtener datos de recompensas videos de Consejos:", error);
    }
  }, [db, user.id]);

  // ⚙️ Cargar datos iniciales
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchResumentakesuple();
      setLoading(false);
    };
    load();
  }, [fetchResumentakesuple]);

  // 🔄 Transformar los campos separados por "|" a una lista plana
  useEffect(() => {
    if (rawVideos.length > 0) {
      const expanded = rawVideos.flatMap((item) => {
        const descs = item.descrip_video ? item.descrip_video.split("|") : [];
        const ids = item.consejos_videoid ? item.consejos_videoid.split("|") : [];

        return descs.map((desc, i) => ({
          video_premio_desc: desc.trim(),
          video_premio_codigoid: ids[i]?.trim() ?? "",
        }));
      });

      setVideos(expanded);
    }
  }, [rawVideos]);

  // 📱 Renderizar cada video individualmente
  const screenWidth = Dimensions.get("window").width;
  const videoHeight = screenWidth < 400 ? 180 : 250;

  const renderItem = ({ item }) => (
    <View style={styles.videoContainer}>
      <Text style={styles.videoTitle}>{item.video_premio_desc}</Text>
      <YoutubePlayer
        height={videoHeight}
        videoId={item.video_premio_codigoid}
        play={playingVideoId === item.video_premio_codigoid}
      />
      <TouchableOpacity
        onPress={() => togglePlaying(item.video_premio_codigoid)}
        style={styles.playPauseButton}
      >
        <Text style={styles.playPauseText}>
          {playingVideoId === item.video_premio_codigoid ? "Pausar" : "Reproducir"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // 🌀 Mostrar carga
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Cargando videos...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-black">
    <FlatList
      data={videos}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.video_premio_codigoid}_${index}`}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    />
  </View>
  );
};

const VideoReelsList = ({ user }) => {
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  //const [resumentakesuple, setResumentakesuple] = useState([]);
  const db = useSQLiteContext();
  const togglePlaying = useCallback((videoId) => {
    setPlayingVideoId((prev) => (prev === videoId ? null : videoId));
  }, []);

    //
    const fetchResumentakesuple = useCallback(async () => {
      try {        
        const query = `
        SELECT F.iduser, F.nro_sema,F.fecha,F.orden_video,R.descrip,RTRIM(LTRIM(R.rutavideo)) as rutavideo FROM (
          SELECT
              T.iduser, T.nro_sema,T.fecha,ROW_NUMBER() OVER (ORDER BY T.fecha ASC) AS orden_video
          FROM (
              SELECT
                  X.iduser,
                  CAST(Y.hemoglo AS FLOAT) AS hemoglo,
                  X.fecha,
                  COUNT(DISTINCT X.foto) AS total_pictu,
                  X.nro_sema,
                  (CASE WHEN Y.calcu_nrodias > 0 THEN (Y.calcu_nrosema + 1) ELSE Y.calcu_nrosema END) AS nrosemas_actual
              FROM T_05_REGISTRO_SUPLEMENTOS X
              JOIN T_05_ETAPA_GESTACIONAL Y ON Y.id = X.iduser
              WHERE X.iduser = ?
                AND X.fecha <= DATE('now', '-5 hours')
              GROUP BY X.fecha
          ) AS T
          WHERE T.iduser = ?
          ) AS F
          JOIN T_05_REELS_VIDEO R ON R.idreel = F.orden_video
          ORDER BY F.orden_video DESC;
        `;
        
        //COMMENT 04112025
        //CASE WHEN IFNULL(total_score_sumado, 0) BETWEEN 180 AND 210 THEN 1 ELSE 0 END AS show_video
        console.log(query);                      
        const rstakesupl = await db.getAllAsync(query, [
          user.id,
          user.id
        ]);  
        //JOIN T_05_DIAS_GESTACION Z ON T.iduser = Z.iduser AND T.fecha = Z.fec_diagesta AND T.nro_sema = Z.nroseman
        //console.log('Resumen tomo suplementos fetchResumentakesuple:', rstakesupl);
        setVideos(rstakesupl);
      } catch (error) {
        console.error('Error al obtener datos de recompensas en videos de Reels:', error);
      }
    }, [db, user.id]);
  
  
  
    useEffect(() => {
      fetchResumentakesuple();
      const loadVideos = async () => {
        setLoading(true);
        setTimeout(() => {
          //setVideos(resumentakesuple);
          setLoading(false);
        }, 1000);
      };
  
      loadVideos();
    }, [fetchResumentakesuple]);

  const screenWidth = Dimensions.get("window").width;
  const videoHeight = screenWidth < 400 ? 180 : 250;

  const renderItem = ({ item }) => (
    <View style={styles.videoContainer}>
      <Text style={styles.videoTitle}>{item.descrip}</Text>
      <YoutubePlayer height={videoHeight} videoId={item.rutavideo} play={playingVideoId === item.rutavideo} />
      <TouchableOpacity onPress={() => togglePlaying(item.rutavideo)} style={styles.playPauseButton}>
        <Text style={styles.playPauseText}>
          {playingVideoId === item.rutavideo ? "Pausar" : "Reproducir"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Cargando videos...</Text>
      </View>
    );
  }
  //console.log('videos si : ',videos);
  return (
    <FlatList
      data={videos}
      renderItem={renderItem}
      keyExtractor={(item, index) => item + index}
      contentContainerStyle={styles.listContent}
      numColumns={1}
    />
  );
};

export default function RecompensasList({ route }) {
  const { user } = route.params;
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const [selectedTab, setSelectedTab] = useState(1);
  const [profileImage, setProfileImage] = useState('');
  //const [profileImage, setProfileImage] = useState(user.profileImage || null); // URI de la imagen
  const [progressValue, setProgressValue] = useState([]);
  const [begingestaApp, setBeginGestaApp] = useState([]);
  
  const buttonAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(selectedTab === 1 ? 1.05 : 1, { damping: 10 }) }],
    };
  });

  const progressMax = 210;
  //const progressValue = 50;
  //let progressValue = 0;
  const fetchDaysgestaall = useCallback(async () => {
    try {

      /////////////////Partiendo la query de Puntaje///////////////
     const query = `
      SELECT 
        R.iduser,
        R.total_score_sumado,
        R.nrosemas_actual,
        R.hemoglo,
        CASE
          WHEN R.hemoglo < 11 AND R.nrosemas_actual BETWEEN 8 AND 10 THEN 'Valiente guerrera'
          WHEN R.hemoglo < 11 AND R.nrosemas_actual BETWEEN 11 AND 13 THEN 'Despierta guerrera'
          WHEN R.hemoglo >= 11 AND R.nrosemas_actual BETWEEN 14 AND 16 THEN 'Iniciadora del hierro'
          WHEN R.hemoglo >= 11 AND R.nrosemas_actual BETWEEN 17 AND 19 THEN 'Aspirante del hierro'
          WHEN R.hemoglo >= 11 AND R.nrosemas_actual BETWEEN 20 AND 22 THEN 'Exploradora del hierro'
          WHEN R.hemoglo >= 11 AND R.nrosemas_actual BETWEEN 23 AND 25 THEN 'Guerrera del hierro'
          WHEN R.hemoglo >= 11 AND R.nrosemas_actual BETWEEN 26 AND 28 THEN 'Defensora del hierro'
          WHEN R.hemoglo >= 11 AND R.nrosemas_actual BETWEEN 29 AND 31 THEN 'Dama de hierro'
          WHEN R.hemoglo >= 11 AND R.nrosemas_actual BETWEEN 32 AND 34 THEN 'Princesa de hierro'
          WHEN R.hemoglo >= 11 AND R.nrosemas_actual BETWEEN 35 AND 37 THEN 'Reina de hierro'
          WHEN R.hemoglo >= 11 AND R.nrosemas_actual BETWEEN 38 AND 40 THEN 'Emperatriz de hierro'
          ELSE 'Iniciadora del hierro'
        END AS level_gesta
      FROM vista_gesta R
      WHERE R.iduser = ?;
      `;
      console.log(query);
      const results = await db.getAllAsync(query, [user.id]);
      console.log(results);
      
      /////////////////Fin Partiendo la query de Puntaje///////////////
         /*
      const query = `
      SELECT R.iduser,R.score_gesta as total_score_sumado,R.nrosemas_actual,R.hemoglo,						
														CASE
														WHEN R.hemoglo < 11 AND IFNULL(R.nrosemas_actual, 0) = 8 THEN 'Valiente guerrera'
														WHEN R.hemoglo < 11 AND IFNULL(R.nrosemas_actual, 0) = 9 THEN 'Valiente guerrera'
														WHEN R.hemoglo < 11 AND IFNULL(R.nrosemas_actual, 0) = 10 THEN 'Valiente guerrera'
														WHEN R.hemoglo < 11 AND IFNULL(R.nrosemas_actual, 0) = 11 THEN 'Despierta guerrera'
														WHEN R.hemoglo < 11 AND IFNULL(R.nrosemas_actual, 0) = 12 THEN 'Despierta guerrera'
														WHEN R.hemoglo < 11 AND IFNULL(R.nrosemas_actual, 0) = 13 THEN 'Despierta guerrera'						
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 14 THEN 'Iniciadora del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 15 THEN 'Iniciadora del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 16 THEN 'Iniciadora del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 17 THEN 'Aspirante del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 18 THEN 'Aspirante del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 19 THEN 'Aspirante del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 20 THEN 'Exploradora del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 21 THEN 'Exploradora del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 22 THEN 'Exploradora del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 23 THEN 'Guerrera del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 24 THEN 'Guerrera del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 25 THEN 'Guerrera del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 26 THEN 'Defensora del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 27 THEN 'Defensora del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 28 THEN 'Defensora del hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 29 THEN 'Dama de hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 30 THEN 'Dama de hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 31 THEN 'Dama de hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 32 THEN 'Princesa de hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 33 THEN 'Princesa de hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 34 THEN 'Princesa de hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 35 THEN 'Reina de hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 36 THEN 'Reina de hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 37 THEN 'Reina de hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 38 THEN 'Emperatriz de hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 39 THEN 'Emperatriz de hierro'
														WHEN R.hemoglo >= 11 AND IFNULL(R.nrosemas_actual, 0) = 40 THEN 'Emperatriz de hierro'
														ELSE 'Iniciadora del hierro'
														END AS level_gesta
														FROM (
														SELECT G.iduser,
                                SUM(IFNULL(G.score_gesta, 0)) as score_gesta,
                                G.nrosemas_actual,G.hemoglo
														FROM (
														SELECT
                                T.iduser, T.semanita_actual as nro_sema,
                                (CASE WHEN T.hemoglo < 11 THEN (total_pictu * 5) ELSE (total_pictu * 10) END) AS score_gesta,
                                M.nroseman as nrosemas_actual,T.fecha,T.hemoglo
                            FROM (								
                                SELECT
                                    X.iduser, CAST(Y.hemoglo AS Float) AS hemoglo, X.fecha,
                                    COUNT(DISTINCT (X.idsuple || X.iduser)) AS total_pictu, X.nro_sema,
                                    (CASE WHEN Y.calcu_nrodias > 0 THEN (Y.calcu_nrosema + 1) ELSE Y.calcu_nrosema END)
                                    AS nrosemas_actual,MAX(D.nroseman) AS semanita_actual
                                FROM T_05_REGISTRO_SUPLEMENTOS X
                                JOIN T_05_ETAPA_GESTACIONAL Y ON Y.id = X.iduser
																JOIN T_05_DIAS_GESTACION D ON D.iduser = X.iduser AND D.fec_diagesta = X.fecha
                                WHERE X.iduser = ? AND X.fecha <= DATE('now')
                                GROUP BY X.iduser,X.fecha
                            ) AS T  
														left join (												
														select A.iduser,A.nroseman from T_05_DIAS_GESTACION A
														JOIN(
														select iduser,MAX(fecha) as fecha from T_05_REGISTRO_SUPLEMENTOS  														
														WHERE iduser = ?
														) B ON  B.iduser = A.iduser AND B.fecha = A.fec_diagesta																									
														) M ON M.iduser = T.iduser
                            WHERE T.iduser = ?
														) AS G
														WHERE G.nro_sema = G.nrosemas_actual
														GROUP BY G.iduser
														) AS R;
                        `; 

      console.log('query de Puntaje!!!! :', query,user.id);   

      const results = await db.getAllAsync(query, [
        user.id, 
        user.id,
        user.id
      ]);
        */    
      console.log('Datos de la todos los dias de gestacion KKKA fetchDaysgestaall :', results);
      setProgressValue(results);
      //setProgressValue(results[0].total_score_sumado);
      //progressValue = results[0].total_score_sumado; 
    } catch (error) {
      console.error('Error al obtener datos de todos los dias de gestacion:', error);
    }
  }, [db, user.id]);


  useEffect(() => {
    fetchDaysgestaall();   
  }, [fetchDaysgestaall]);

  const fetchImgProfile = useCallback(async () => {
    try {
         
      const results = await db.getFirstAsync('SELECT profileImage FROM users WHERE id = ?', [user.id]); 
      console.log('Datos User fetchImgProfile :', results);
      setProfileImage(results.profileImage);      
    } catch (error) {
      console.error('Error al obtener datos del Profile del Usuario:', error);
    }
  }, [db, user.id]);

  useEffect(() => {
    fetchImgProfile();
  }, [fetchImgProfile]);

  //
  const getgestabeginapp = useCallback(async () => {
    try {      
      const results = await db.getAllAsync('SELECT * FROM vista_gesta_first WHERE id = ?', [user.id]); 
      console.log('Datos getgestabeginapp :', results);
      setBeginGestaApp(results);      
    } catch (error) {
      console.error('Error al obtener datos del getgestabeginapp:', error);
    }
  }, [db, user.id]);

  useEffect(() => {
    getgestabeginapp();
  }, [getgestabeginapp]);
  //
   
  /*let vtotal_scorexxx = progressValue.total_score_sumado;
  console.log('progressValue ONLY xxx :', vtotal_scorexxx);*/

  let vtotal_score = 0;
  let vlevel_gesta = '';
  progressValue.map((infges) => {
    vtotal_score = infges.total_score_sumado;
    vlevel_gesta = infges.level_gesta;
  })
  console.log('progressValue ONLY SSSS :', vtotal_score);

 //gesta into first app 25112025
 let zlevel_gesta = '';
 begingestaApp.map((infges) => {
  zlevel_gesta = infges.level_gesta;
 })
 console.log('begingestaApp ONLY okas :', zlevel_gesta);
//fin gesta into first app 25112025

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      <SafeAreaView className="px-6 mt-4">
        <View style={styles.userInfoContainer}>
        {profileImage ? (                    
                    <Image source={{ uri: profileImage }} style={styles.userImage} />                    
                ) : (                   
                    <Image
                      source={logosinfoto} // URL de la foto del usuario
                      style={styles.userImage}
                    />                    
                )}
          <View style={styles.userTextContainer}>
            <Text style={styles.userInfoText}>
            <Text style={styles.highlightText}>{user.nombape}</Text>, tu nivel de puntuación acredita que eres una{" "}
              <Text style={styles.highlightText}>{vlevel_gesta || zlevel_gesta} <FontAwesome6 name="medal" size={24} color="#85268d" style={styles.trophyIcon} /></Text>
            </Text>
          </View>
          
        </View>
      </SafeAreaView>

      
    <SafeAreaView className="px-6 mt-2">
      <View className="flex-row justify-between items-center">
    <Text style={styles.pointsText}>
      {vtotal_score} puntos
      <MaterialCommunityIcons
        name="medal"
        size={20}
        color="#85268d"
        style={styles.scorepointsIcon}
      />
    </Text>
    <Text style={styles.pointsText}>210 puntos
    <AntDesign
        name="like2"
        size={20}
        color="#85268d"
        style={styles.scorepointsIcon}
      />
    </Text>
  </View>
        <ProgressBar
          progress={vtotal_score / progressMax}
          width={null}
          height={10}
          color="#85268d"
          unfilledColor="#e0e0e0"
          borderRadius={5}
          borderWidth={0}
          style={styles.progressBar}
        />
      </SafeAreaView>

      
      <SafeAreaView className="flex-row px-6 mt-2 justify-center">
        <View className="flex flex-row justify-center items-center space-x-2 bg-fuchsia-800 py-1 px-4 rounded-full my-4 shadow-md">
          <TouchableOpacity
            onPress={() => setSelectedTab(1)}
            style={[styles.button, buttonAnimation]}
          >
            <View className="flex flex-row items-center justify-center">
              <MaterialIcons name="video-library" size={20} color={selectedTab === 1 ? 'white' : 'gray'} style={{ marginRight: 4 }} />
              <Text className="ml-1 text-white font-bold text-[15px]">Videos</Text>
            </View>
          </TouchableOpacity>

          <View className="w-px bg-gray-300 h-8" />

          <TouchableOpacity
            onPress={() => setSelectedTab(2)}
            style={[styles.button, buttonAnimation]}
          >
            <View className="flex flex-row items-center justify-center">
              <MaterialIcons name="lightbulb" size={20} color={selectedTab === 2 ? 'white' : 'gray'} style={{ marginRight: 4 }} />
              <Text className="ml-1 text-white font-bold text-[15px]">Consejos</Text>
            </View>
          </TouchableOpacity>

          <View className="w-px bg-gray-300 h-8" />

          <TouchableOpacity
            onPress={() => setSelectedTab(3)}
            style={[styles.button, buttonAnimation]}
          >
            <View className="flex flex-row items-center justify-center">
              <MaterialIcons name="movie" size={20} color={selectedTab === 3 ? 'white' : 'gray'} style={{ marginRight: 4 }} />
              <Text className="ml-1 text-white font-bold text-[15px]">Recetas</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      
      <FlatList
        data={[<TabContent selectedTab={selectedTab} user={user} />]}
        renderItem={({ item }) => item}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 10, // Espacio entre la imagen y el texto
  },
  userInfoText: {
    fontSize: 18,
    color: "#444",
    flex: 1, // Toma el espacio disponible
  },
  highlightText: {
    fontWeight: "bold",
    color: "#85268d",
  },
  userInfoContainer: {
    flexDirection: "row", // Alinea los elementos horizontalmente
    alignItems: "center", // Centra verticalmente los elementos
  },
  userTextContainer: {
    flex: 1, // El texto ocupa el espacio restante
    marginTop: 10, // Ajusta esta propiedad para mover el texto hacia abajo
  },
  trophyIcon: {
    marginLeft: 10, // Espacio entre el texto y el icono
  },
  scorepointsIcon: {
    marginTop: 10, // Espacio entre el texto y el icono
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "left", // Alinea el texto a la izquierda
    color: "#85268d",
  },
  progressBar: {
    marginBottom: -5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 10,
  },
  videoContainer: {
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  videoTitle: {
    textAlign: "center",
    fontWeight: "bold",
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  playPauseButton: {
    padding: 10,
    backgroundColor: "#85268d",
    alignItems: "center",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  playPauseText: {
    color: "#fff",
    fontWeight: "bold",
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#Fuchsia-800",
  },imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#d3d3d3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
});
