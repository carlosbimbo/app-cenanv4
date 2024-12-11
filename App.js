import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, Image,TouchableOpacity,KeyboardAvoidingView,ScrollView,FlatList } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useState, useEffect, useRef } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import logo from './images/logogesta.png';
import logoeco from './images/icoeco.png';
import logofpp from './images/icofpp.png';
import logofur from './images/icofur.png';
import iconsave from './images/btnsave.png';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import DropDownPicker from 'react-native-dropdown-picker';
import getUserLocation  from './hooks/userLocation';
import TabNavigation from './Apps/Navigations/TabNavigation';

import { addDays, format,differenceInDays } from 'date-fns';

//initialize the database
const initializeDatabase = async(db) => {
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username varchar(100) UNIQUE,
                password varchar(10),
                dni varchar(8),
                nombape varchar(150),
                lati varchar(100),
                longi varchar(100),
                altura varchar(100)
            );
        `);

        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS T_05_ETAPA_GESTACIONAL (
                id INTEGER PRIMARY KEY NOT NULL,
                fur varchar(10) NULL,
                fec_proba_parto varchar(10) NULL,
                eco_nro_sem_emb INT NULL,
                eco_nro_dias_emb INT NULL,
                hemoglo varchar(10) NULL
                );
        `);

        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS T_05_AGENDA_GESTACIONAL (
                id INT NOT NULL,                
                nrosem INT NOT NULL,
                fec_marker varchar(10) NULL,
                PRIMARY KEY (id, nrosem)                
                );
        `);

        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS T_LECT_SEMANAS (
              nro_semana INTEGER NOT NULL PRIMARY KEY,
              img_bb VARCHAR(100),
              desc_img VARCHAR(200),
              altura_bb VARCHAR(100),
              peso_bb VARCHAR(100),
              tips_emb1_desc VARCHAR(200),
              tips_emb1_ruta VARCHAR(100),
              tips_emb2_desc VARCHAR(200),
              tips_emb2_ruta VARCHAR(100),
              tips_emb3_desc VARCHAR(200),
              tips_emb3_ruta VARCHAR(100),
              tips_cons1_desc VARCHAR(200),
              tips_cons1_ruta VARCHAR(100),
              tips_cons2_desc VARCHAR(200),
              tips_cons2_ruta VARCHAR(100),
              tips_nutri_desc VARCHAR(200),
              tips_nutri_ruta VARCHAR(200),
              video_premio_desc VARCHAR(200),
              video_premio_ruta VARCHAR(100),
              video_free1_desc VARCHAR(200),
              video_free1_ruta VARCHAR(100),
              video_free2_desc VARCHAR(200),
              video_free2_ruta VARCHAR(100),
              video_free3_desc VARCHAR(200),
              video_free3_ruta VARCHAR(100)               
                );
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (1,'sizelogobebe1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Practica Ejercicios de respiración','sem1_tipscons1.png','Recuerda tomar tu acido folico','sem1_tipscons2.png','Mantener una dieta rica en ácido fólico','sem1_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (2,'sizelogobebe2.png',NULL,NULL,NULL,'Ejercicios de fortalecimiento de suelo pelvico: Ejercicios de kejel','sem2_tipsemb1.png',NULL,NULL,NULL,NULL,'Continua con tu ejercicios de respiración','sem2_tipscons1.png','Recuerda tomar tu acido folico es importante','sem2_tipscons2.png','Receta','sem2_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (3,'sizelogobebe3.png',NULL,NULL,NULL,'Ejercicios de fortalecimiento de suelo pelvico: Ejercicios de kejel','sem3_tipsemb1.png',NULL,NULL,NULL,NULL,'Continua con tu ejercicios de respiración','sem3_tipscons1.png','recuerda tomar tu acido folico es importante','sem3_tipscons2.png','Receta','sem3_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (4,'sizelogobebe4.png',NULL,NULL,NULL,'Leele en voz alta','sem4_tipsemb1.png','Practica ejercicios de relajación y respiración','sem4_tipsemb_2.png','Mantente hidratada ,consume agua.','sem4_tipsemb3.png','Confirma tu embarazo','sem4_tipscons1.png','recuerda tomar tu acido folico es importante','sem4_tipscons2.png','Receta','sem4_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (5,'sizelogobebe5.png','Tu bebé tiene el tamaño de una semilla de ajonjolí',NULL,'0.2 gramos','Empieza ejercicios de relajación','sem5_tipsemb1.png','Duerme de 7 a 8 horas. O Cuando tu cuerpo te lo pida','sem5_tipsemb_2.png','Bebe liquidos claros y frios para aliviar las anuseas.','sem5_tipsemb3.png','Acude a tu control prenatal','sem5_tipscons1.png','No es aconsejable que te tiñas el cabello','sem5_tipscons2.png','Si tienes nauseas y vómitos come en pequeñas porciones.','sem5_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (6,'sizelogobebe6.png','Tu bebé tiene el tamaño de un grano de arroz','0.3  cm','0.6 gramos','Empieza a darle caricias a tu vientre asi estimulas la conectividad neuronal','sem6_tipsemb1.png','Continua con tu s ejercicios de relajación y respiración','sem6_tipsemb_2.png','Acepta los cambios de tu cuerpo,sobre todo los emocionales','sem6_tipsemb3.png','Haste tus análisis es importante y tu primera aecografía','sem6_tipscons1.png','Para evitar las nauseas y vomito alejate de olores fuertes.','sem6_tipscons2.png','Receta','sem6_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (7,'sizelogobebe7.png','Tu bebé tiene el tamaño de un frijol','1.1 cm','1 -2 gramos','Empieza tus ejercicios de estiramiento','sem7_tipsemb1.png','Continua con tus ejercicios de fortalecimiento del piso pelvico','sem7_tipsemb_2.png','Lee en voz alta','sem7_tipsemb3.png','Si tienes nauseas y vómitos exagerados ve a tu medico/  obstetra','sem7_tipscons1.png','Es normal estar cansada o con mucho sueño,es parte de la dulce espera.','sem7_tipscons2.png','Receta','sem7_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (8,'sizelogobebe8.png','Tu bebé tiene el tamaño de una cereza','1.7 cm','2-3 gramos','Hablale al futuro bebe,cuentale historias','sem8_tipsemb1.png','Usa música de fondo para relajarte y respirar','sem8_tipsemb_2.png','Continua con tus ejercicios de kejel','sem8_tipsemb3.png','Si sientes dolor en el bajo vientre acude a tu médico.','sem8_tipscons1.png',NULL,NULL,'Receta','sem8_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (9,'sizelogobebe9.png','Tu bebé tiene el tamaño de una frambuesa','2.4 cm','3 gramos','Empieza con pilates de bajo impacto en silla','sem9_tipsemb1.png','Relajate y respira','sem9_tipsemb_2.png',NULL,NULL,'Hablale al bebe junto con tu pareja','sem9_tipscons1.png',NULL,NULL,'Alimentación saludable','sem9_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (10,'sizelogobebe10.png','Tu bebé tiene el tamaño de un pallar','3.4 cm','4 gramos','Lee en voz alta','sem10_tipsemb1.png','Hablale y cuentale historias','sem10_tipsemb_2.png',NULL,NULL,'has caminatas cortas junto a tu pareja','sem10_tipscons1.png',NULL,NULL,'Evita alimentos que relajan el esfinter gastro esofágico como tomate,platanos,café o té','sem10_tipsnutri1.png',NULL,NULL,'Video CENAN: Alimentación','https://www.youtube.com/shorts/LFFlLgL8In8','Video 12: Guía del uso del APP','https://www.youtube.com/shorts/LFFlLgL8In8','Story telling: Como involucrar al padre y la familia en el embarazo','https://www.youtube.com/shorts/uP9hWJdmcAk');
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (11,'sizelogobebe11.png','Tu bebé tiene el tamaño de un limón','4.3 cm','7 gramos','Escucha música clasica o melodías instrumentadas sin voz','sem11_tipsemb1.png','Practica estiramientos de hombros y espalda parada (posición sumo)','sem11_tipsemb_2.png','Hablale y cuentale historias','sem11_tipsemb3.png','Usa zapatos comodos','sem11_tipscons1.png',NULL,NULL,'Receta','sem11_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (12,'sizelogobebe12.png','Tu bebé tiene el tamaño de una lima','5.7 cm','14 gramos','Escucha música clasica o melodías instrumentadas sin voz','sem12_tipsemb1.png','Practica estiramientos de caderas y gluteos en posición perro o gato','sem12_tipsemb_2.png','Relajate y respira','sem12_tipsemb3.png','Empieza a escribir la carta para tu bebe','sem12_tipscons1.png',NULL,NULL,'Receta','sem12_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (13,'sizelogobebe13.png','Tu bebé tiene el tamaño de un durazno','8 cm','23 gramos','Presentale diferentes pautas musicales ','sem13_tipsemb1.png','Continua con tus esturamientos de hobros ,brazos,caderas y gluteos ','sem13_tipsemb_2.png','Relajate y respira','sem13_tipsemb3.png','Busca ropa comoda','sem13_tipscons1.png',NULL,NULL,'Receta','sem13_tipsnutri1.png','Video 1: Importancia del consumo del suplemento de hierro','https://www.youtube.com/watch?v=tFDqpZcUoKs','Video 11: Anemia,causas y consecuencias','https://www.youtube.com/shorts/MTZj6JRwv50',NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (14,'sizelogobebe14.png','Tu bebé tiene el tamaño de un kiwi','14 cm','43 gramos','Empieza ejercicos en la posición de loto para fortalecimiento de muslos y piernas','sem14_tipsemb1.png','Escucha música clasica o melodías instrumentadas sin voz','sem14_tipsemb_2.png','Escucha música clasica o melodías instrumentadas sin voz','sem14_tipsemb3.png','Trata de dormir del lado derecho','sem14_tipscons1.png',NULL,NULL,'Si tienes problemas con el sulfato ferroso despues de pasar la pastilla consume un fruta de sabor fuerte','sem14_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (15,'sizelogobebe15.png','Tu bebé tiene el tamaño de una manzana','15 cm','70 gramos','Empieza ha realizar caminatas un poco más largas,siempre acompañada de alguien ','sem15_tipsemb1.png','Hablale a bebe de tus sentimientos hacia el (solo los positivos)','sem15_tipsemb_2.png',NULL,NULL,'Cuentale de tu carta','sem15_tipscons1.png',NULL,NULL,'Si te estriñes consume mayor cantidad de agua y fibras crudas (ensaladas)','sem15_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (16,'sizelogobebe16.png','Tu bebé tiene el tamaño de una pera','16 cm','100 gramos','Empieza a presentar texturas a tu vientre : Suave,rugoso,entre otras','sem16_tipsemb1.png','Escucha música clasica o melodías instrumentadas sin voz','sem16_tipsemb_2.png','Escucha música clasica o melodías instrumentadas sin voz','sem16_tipsemb3.png','No olvides cepillarte los dientes despues de cada alimento','sem16_tipscons1.png',NULL,NULL,'Receta','sem16_tipsnutri1.png','Video 2: Derrumbando mitos y creencias','https://www.youtube.com/shorts/aqcxaPsOXTE',NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (17,'sizelogobebe17.png','Tu bebé tiene el tamaño de una naranja','18 cm','140 gramos','Practica ejercicios de visualización creativa','sem17_tipsemb1.png','Continua relajandote y respirando','sem17_tipsemb_2.png',NULL,NULL,'Proteje tu piel usa bloqueador solar','sem17_tipscons1.png',NULL,NULL,'Receta','sem17_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (18,'sizelogobebe18.png','Tu bebé tiene el tamaño de una palta','20 cm','190 gramos','Has ejercicios para brazos ','sem18_tipsemb1.png','Escucha música clasica o melodías instrumentadas sin voz','sem18_tipsemb_2.png','Sentiras como mariposas  son los primeros movimientos del bebe','sem18_tipsemb3.png','Puedes empezar a lucir ropa de embarazada','sem18_tipscons1.png',NULL,NULL,'Receta','sem18_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (19,'sizelogobebe19.png','Tu bebé tiene el tamaño de un mango','22 cm','240 gramos','Has ejercicios para brazos ','sem19_tipsemb1.png','Escucha música clasica o melodías instrumentadas sin voz','sem19_tipsemb_2.png',NULL,NULL,'Es importante el consumo de los suplementos de hierro','sem19_tipscons1.png',NULL,NULL,'Receta','sem19_tipsnutri1.png','Video 3: Sesión de pilates ','https://youtube.com/shorts/coubVpFALcY',NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (20,'sizelogobebe20.png','Tu bebé tiene el tamaño de una toronja rosada','25 cm','300 gramos','Escucha música clasica o melodías instrumentadas sin voz','sem20_tipsemb1.png','sentiras tu vientre como una ollita popcorn es tu bebe fortaleciendo su reflejo plantar','sem20_tipsemb_2.png',NULL,NULL,'Con tu pareja convérsale al bebe','sem20_tipscons1.png',NULL,NULL,'Receta','sem20_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (21,'sizelogobebe21.png','Tu bebé tiene el tamaño de un pepinillo','26 cm','360 gramos','Continua con los ejercicios de kejel','sem21_tipsemb1.png','Hablale a bebe,presentale nuevas voces de la familia','sem21_tipsemb_2.png',NULL,NULL,'Si sientes zumbido de oídos o dolor de cabeza acude al EESS','sem21_tipscons1.png',NULL,NULL,'No te olvides de tu dieta balanceada','sem21_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (22,'sizelogobebe22.png','Tu bebé tiene el tamaño de una berenjena','28 cm','430 gramos','Lee libros más complejos,con rimas.','sem22_tipsemb1.png','Practica ejercicios en posición de loto,terminar con transicion de pero /gato','sem22_tipsemb_2.png',NULL,NULL,'Usa zapatos cómodos','sem22_tipscons1.png',NULL,NULL,'Receta','sem22_tipsnutri1.png','Video 4: Sesión de yoga','https://youtube.com/shorts/dotjbOrfh5c',NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (23,'sizelogobebe23.png','Tu bebé tiene el tamaño de un coco','29 cm','500 gramos','Continua con tu caminatas,siempre en compañía ','sem23_tipsemb1.png','Has ejercicios de estiramiento de brazos y espalda ','sem23_tipsemb_2.png',NULL,NULL,'Consume agua','sem23_tipscons1.png',NULL,NULL,'Consume frutas y verduras','sem23_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (24,'sizelogobebe24.png','Tu bebé tiene el tamaño de una coliflor','30 cm','600 gramos','Has ejercicios de respiración empieza con la respiración profunda ','sem24_tipsemb1.png','Lee libros de cuentos con final feliz','sem24_tipsemb_2.png','Escucha música clasica o melodías instrumentadas sin voz','sem24_tipsemb3.png','Aprende a dormir con almohadas','sem24_tipscons1.png',NULL,NULL,'Receta','sem24_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (25,'sizelogobebe25.png','Tu bebé tiene el tamaño de una lechuga','36 cm','660 gramos','Puedes empezar con iluminar tu vientre con luces suaves','sem25_tipsemb1.png','Escucha melodias suaves','sem25_tipsemb_2.png','has ejercicos de fortalecimiento de caderas y gluteos asi como abdominales','sem25_tipsemb3.png','Puedes hacerte tus primeras fotos con tu vientre','sem25_tipscons1.png',NULL,NULL,'Receta','sem25_tipsnutri1.png','Video 5: Preparándonos para el nacimiento del bebé','https://youtube.com/shorts/x5mzL8ZzWZM',NULL,NULL,NULL,NULL,'Video de ejercicios CENAN','https://www.youtube.com/shorts/nToKOh2ZCcE');
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (26,'sizelogobebe26.png','Tu bebé tiene el tamaño de un repollo','37 cm','760 gramos','Has ejercicios de brazos ','sem26_tipsemb1.png','has tus ejercicios de fortalecimiento de suelo pelvico','sem26_tipsemb_2.png','Sentiras movientos mas gruesos de tu bebe ','sem26_tipsemb3.png','Caminatas largas','sem26_tipscons1.png',NULL,NULL,'Receta','sem26_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (27,'sizelogobebe27.png','Tu bebé tiene el tamaño de un brocoli','38 cm','875 gramos','continua con tus ejercicios de estiramiento y fortalecimiento de glutos ,caderas y piernas ','sem27_tipsemb1.png','Escucha música clasica o melodías instrumentadas sin voz','sem27_tipsemb_2.png','Cuenta los movimientos del bebe sobre todo despues de los alimentos','sem27_tipsemb3.png','Háblale al bebé cuentale lo que hiciste en el día ','sem27_tipscons1.png',NULL,NULL,'Receta','sem27_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (28,'sizelogobebe28.png','Tu bebé tiene el tamaño de un melon ','39 cm','1000 gramos','Presentale sonidos diferenciados por ejemplo los instrumentos musicales','sem28_tipsemb1.png','continua con tus ejercicios de respiración y relajación','sem28_tipsemb_2.png',NULL,NULL,'Vigila los movimientos de tu bebé','sem28_tipscons1.png',NULL,NULL,'Es importante el consumo de carnes para el creciemiento de tu bebe asi como frutas y verduras','sem28_tipsnutri1.png','Video 6: Preparación para el parto: Ejercicios,replicación y relajación','https://youtube.com/shorts/G6bYmjpKbFk',NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (29,'sizelogobebe29.png','Tu bebé tiene el tamaño de una toronja amarilla','40 cm','1,100 gramos','Practica ejercicios de visualización creativa','sem29_tipsemb1.png','continua con ejercicios de fortalecimiento de brazos,espalda y hombros','sem29_tipsemb_2.png','cuenta los movimientos del bebe sobre todo despues de los alimentos','sem29_tipsemb3.png','Escucha música clásica','sem29_tipscons1.png',NULL,NULL,'Receta','sem29_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (30,'sizelogobebe30.png','Tu bebé tiene el tamaño de una toronja amarilla','40 cm','1,300 gramos','Cuentale cuentos donde hay cambio de voces ','sem30_tipsemb1.png','Cantale canciones','sem30_tipsemb_2.png','Caminatas largas','sem30_tipsemb3.png','Vigila tu limpieza despues de ir al baño','sem30_tipscons1.png',NULL,NULL,'Receta de sangresita','sem30_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (31,'sizelogobebe31.png','Tu bebé tiene el tamaño de un zapallo loche','41 cm','1500 gramos','Puedes hacer ejercicos de espalda y abdominales (ejercicio del puente)','sem31_tipsemb1.png','Has ejercicios de relajación y respiración','sem31_tipsemb_2.png','presentale diferentes tipos de música: introduce operas','sem31_tipsemb3.png','No te olvides de contar los movimientos del bebe','sem31_tipscons1.png',NULL,NULL,'Receta','sem31_tipsnutri1.png','Video 7: Preparándonos para el parto','https://youtube.com/shorts/kB2UZsBI-Ik',NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (32,'sizelogobebe32.png','Tu bebé tiene el tamaño de una piña','42 cm','1,700 gramos','Empieza apreparar su bienvenida con tu familia','sem32_tipsemb1.png','has tus ejercicios de fortalecimiento de suelo pelvico','sem32_tipsemb_2.png','caminatas largas','sem32_tipsemb3.png','Involucra a tu familia en el proceso del embarazo,ya esta cerca su llegadda','sem32_tipscons1.png',NULL,NULL,'No te olvides de tu alimentación y consumo de suplementos ','sem32_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (33,'sizelogobebe33.png','Tu bebé tiene el tamaño de una papaya','44 cm','1,900 gramos','Aprederas a caminar,buscando mantener el equilibrio','sem33_tipsemb1.png','Has tus ejercicios de estiramiento de gluteos,piernas y caderas','sem33_tipsemb_2.png','Si tienes flujos ve al médico','sem33_tipsemb3.png','Si hay un líquido blanquesino y huele a lejía de inmediato a la emergencia','sem33_tipscons1.png',NULL,NULL,'Receta','sem33_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (34,'sizelogobebe34.png','Tu bebé tiene el tamaño de una sandia chica','45 cm','2,100 gramos','introduce lectura de cuentos con diferentes voces y música incluida','sem34_tipsemb1.png','presentale luces más fuertes a tu vientre','sem34_tipsemb_2.png','Has masajitos suaves al compas de la musica a tu vientre','sem34_tipsemb3.png','Dolor de cabeza,zumbido de oidos,visión borrosa de inmediato al EESS','sem34_tipscons1.png',NULL,NULL,'Receta','sem34_tipsnutri1.png','Video 8: Relajación durante el parto','https://youtube.com/shorts/gc5jczXJwds',NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (35,'sizelogobebe35.png','Tu bebé tiene el tamaño de una calabaza','46 cm','2,400 gramos','Has ejercicios de meditación','sem35_tipsemb1.png','Has ejercicios de relajación y respiración','sem35_tipsemb_2.png',NULL,NULL,'No puedes perder líquido o sangre por tus partes … de inmediato al EESS','sem35_tipscons1.png',NULL,NULL,'No te olvides de tu alimentación y consumo de suplementos ','sem35_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (36,'sizelogobebe36.png','Tu bebé tiene el tamaño de un zapallo','47 cm','2,600 gramos','has ejercicios de piernas,caderas y gluteos ','sem36_tipsemb1.png','Nos alistamos para su llegada empezamos con la maleta de parto','sem36_tipsemb_2.png',NULL,NULL,'Hablale al bebe cuentale historias','sem36_tipscons1.png',NULL,NULL,'Receta','sem36_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (37,'sizelogobebe37.png','Tu bebé tiene el tamaño de una sandia mediana','48 cm','2,800 gramos','Prepara tu maleta con batas,sandalias ,utiles de aseo,bateria para el celular.','sem37_tipsemb1.png','Coordina con tu red que te llevara al hospital cuando lleguen las contracciones','sem37_tipsemb_2.png','las contracciones falsas comienzan en cualquier lado … las verdaderas comensan arriban y van hacia abajo y son intensas… duran 30 segundos','sem37_tipsemb3.png','Si hay presencia de sangrado de inmedito a la emergencia ','sem37_tipscons1.png',NULL,NULL,'Receta','sem37_tipsnutri1.png','Video 9: Cuidados del Recien Nacido','https://youtube.com/shorts/jYPK00hba84',NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (38,'sizelogobebe38.png','Tu bebé tiene el tamaño de una calabaza grande','49 cm','3,000 gramos','Has tus ejercicios de relajación y respiración','sem38_tipsemb1.png','has tus ejercicios de caderas ,piernas y gluteos … no te olvides los de suelo pelvico','sem38_tipsemb_2.png','Tu carta para tu bebe debe de estar lista','sem38_tipsemb3.png','Si estas perdiendo como una clara de huevo espeza con manchitas marrones es tapón mucoso … estamos empezando trabajo de parto','sem38_tipscons1.png',NULL,NULL,'No te olvides de tua limentación y consumo de suplementos ','sem38_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (39,'sizelogobebe39.png','Tu bebé tiene el tamaño de una sandia grande','50 cm','3.100 gramos','Has tus ejercicios de relajación y respiración','sem39_tipsemb1.png','Escucha musica sin letras','sem39_tipsemb_2.png',NULL,NULL,'Vigila la presencia de liquido en tus partes,si es como agua blanquesina con olor a lejía de inmediato a la emergencia.','sem39_tipscons1.png','Vigila los movimientos del bebe','sem39_tipscons2.png','No te olvides de tu alimentación y consumo de suplementos ','sem39_tipsnutri1.png','Video 10: Cuidados de la madre luego del parto','https://youtube.com/shorts/akdHv8q4FkI',NULL,NULL,NULL,NULL,NULL,NULL);
              INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (40,'sizelogobebe40.png','Tu bebé tiene el tamaño de un zapallo macre ','5 1- 52 cm','3,200 a 3,400 gramos','Has tus ejercicios de relajación y respiración','sem40_tipsemb1.png','Escucha musica sin letras','sem40_tipsemb_2.png',NULL,NULL,'Vigila la presencia de liquido en tus partes,si es como agua blanquesina con olor a lejía de inmediato a la emergencia.','sem40_tipscons1.png','Vigila los movimientos del bebe','sem40_tipscons2.png','No te olvides de tu alimentación y consumo de suplementos ','sem40_tipsnutri1.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);

          `);

        console.log('Database initialized !');
    } catch (error) {
        console.log('Error while initializing the database : ', error);
    }
};

//create a stack navigator that manages the navigation between 3 screens
const Stack = createStackNavigator();

//We'll have 3 screens : Login, Register and Home

export default function App() {
  return (
    <SQLiteProvider databaseName='auth.db' onInit={initializeDatabase}>
        <NavigationContainer>
            <Stack.Navigator initialRouteName='Login'>
                <Stack.Screen name='Login' component={LoginScreen} options={{
                title: '',
                headerStyle: {
                    backgroundColor: '#fff', // Color de fondo de la barra de navegación
                    height: 40, // Ajusta la altura
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#fff', // Color del título
                },
                }} />
                <Stack.Screen name='Register' component={RegisterScreen} options={{ title: 'Registro' }} />
                <Stack.Screen name='Home' component={HomeScreen} options={{ title: 'Principal' }}/>

                <Stack.Screen name='Fur' component={FurScreen} options={{
                    title: '',
                    headerStyle: {
                        backgroundColor: '#fff', // Color de fondo de la barra de navegación
                        height: 70, // Ajusta la altura
                    },
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#fff', // Color del título
                    },
                    }} />
                <Stack.Screen name='Eco' component={EcoScreen} options={{ title: 'Ecografia' }}/>
                <Stack.Screen name='Parto' component={PartoScreen} options={{ title: 'Fecha de Parto' }}/>

                <Stack.Screen
                  name="TabNavigator"
                  component={TabNavigation}
                  options={{ title: 'Menu Principal' }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    </SQLiteProvider>
  );
}

//LoginScreen component
const LoginScreen = ({navigation}) => {

    const db = useSQLiteContext();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const [focusedInput, setFocusedInput] = useState(null); // Estado para rastrear qué TextInput está activo
    const userEmailRef = useRef(null);
    const userpasswordRef = useRef(null);

    useEffect(() => {
      if (userEmailRef.current) {
        userEmailRef.current.focus();
        setFocusedInput('userName'); // Aplicar el estilo resaltado
      }
    }, []);
    
    //function to handle login logic
    const handleLogin = async() => {

        /*if(userName.length === 0 || password.length === 0) {
            Alert.alert('Atencion','Porfavor ingrese el Usuario and Password');
            return;
        }*/

        try {

          if(userName.trim().length === 0) {
            Alert.alert('Atencion!', 'Por favor ingrese su Email Registrado.');
            userEmailRef.current.focus(); // Enfocar automáticamente
            setFocusedInput('userName'); // Resaltar el campo
            return;
            }

            if(password.trim().length === 0) {
              Alert.alert('Atencion!', 'Por favor ingrese su Password.');
              userpasswordRef.current.focus(); // Enfocar automáticamente
              setFocusedInput('password'); // Resaltar el campo
              return;
              }  

            const user = await db.getFirstAsync('SELECT * FROM users WHERE username = ?', [userName]);
            if (!user) {
                Alert.alert('Error', 'Usuario no Existe!');
                userEmailRef.current.focus(); // Enfocar automáticamente
                setFocusedInput('userName'); // Resaltar el campo
                return;
            }
            const validUser = await db.getFirstAsync('SELECT * FROM users WHERE username = ? AND password = ?', [userName, password]);
            if(validUser) {
                //Alert.alert('Correcto', `Login Exitoso ${validUser.id}`);
                Alert.alert('Correcto', `Login Exitoso`);
                navigation.navigate('Home', {user:validUser});
                setUserName('');
                setPassword('');
            } else {
                Alert.alert('Error', 'Password Incorrecto');
            }
        } catch (error) {
            console.log('Error durante el Login : ', error);
        }
    }
    return (  
        <> 
        <KeyboardAvoidingView>
         <ScrollView>        
            <View className="flex-1 bg-gray-100">
                <View className="p-8 bg-blue-500 rounded-t-3xl shadow-md w-full">
                    <Text className="text-[30px] font-bold text-white text-center mt-6">Bienvenidos</Text>
                    <Text className="text-[18px] text-white text-center mt-4">
                        Aplicacion de Seguimiento a Gestantes en su Etapa de Gestacion en el consumo de sus vitaminas
                    </Text>
                    <TouchableOpacity className="p-4 bg-white rounded-full mt-6">
                        <Text className="text-blue-500 text-center text-[18px]">Inicio</Text>
                    </TouchableOpacity>
                </View>
            </View>            
            <View style={styles.containerAdjusted}>
                <Image source={logo} style={styles.logo} />
                <Text style={styles.title}>App mhealth</Text>               
                <View style={styles.inputContainer}>
                    <Icon name="mail-outline" size={25} style={styles.icon} />
                    <TextInput
                        ref={userEmailRef} // Asignar la referencia         
                        style={[
                          styles.input,
                          focusedInput === 'userName' && styles.inputFocused,
                        ]}                      
                        placeholder="Email"
                        keyboardType="email-address"
                        value={userName}
                        maxLength={100}
                        onChangeText={setUserName}
                        onFocus={() => setFocusedInput('userName')}
                        onBlur={() => setFocusedInput(null)}
                        returnKeyType="next" // Configura el botón Enter para "siguiente"
                        onSubmitEditing={() => userpasswordRef.current.focus()} 
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="lock-closed-outline" size={25} style={styles.icon} />
                    <TextInput
                        ref={userpasswordRef} // Asignar la referencia         
                        style={[
                          styles.input,
                          focusedInput === 'password' && styles.inputFocused,
                        ]}     
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        maxLength={10}
                        onChangeText={setPassword}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        returnKeyType="done" // Último campo no necesita ir a otro
                      onSubmitEditing={handleLogin} // Invoca el registro al terminar
                    />
                </View>                
                <Pressable style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>
                <Pressable style={styles.link} onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.linkText}>No tienes una cuenta? Registrate</Text>                    
                </Pressable>
            </View>  
            </ScrollView>
    </KeyboardAvoidingView>          
        </>
    )
}

//RegisterScreenComponent
const RegisterScreen = ({navigation}) => {

    const db = useSQLiteContext();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');    
    const [userDni, setUserDni] = useState('');
    const [userNomb, setUserNomb] = useState('');

    //add 07122024
    const [errorMsg, setErrorMsg] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [altitude, setAltitude] = useState(null);
  
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net)$/;
    const isValidEmail = (userName) => emailRegex.test(userName);
    
    ////////////add aqui gps 08122024
      // Hook para obtener la ubicación al montar el componente
  useEffect(() => {
    const fetchLocation = async () => {
      const location = await getUserLocation();
      if (location.errorMsg) {
        setErrorMsg(location.errorMsg);
        Alert.alert('Error de ubicación', location.errorMsg);
      } else {
        const { latitude, longitude, altitude } = location;
        setLatitude(latitude);
        setLongitude(longitude);
        setAltitude(altitude);
        /*  
        Alert.alert(
          'Ubicación obtenida',
          `Latitud: ${latitude}\nLongitud: ${longitude}\nAltitud: ${altitude}`
        );
        */
      }
    };

    fetchLocation(); // Llamar a la función para obtener la ubicación
  }, []); // [] asegura que solo se ejecuta al montar el component
    ////////////Fin add aqui gps 08122024
    
    const [focusedInput, setFocusedInput] = useState(null); // Estado para rastrear qué TextInput está activo
    const userNombRef = useRef(null);    
    const dniRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirpasswordRef = useRef(null);   

    useEffect(() => {
      if (userNombRef.current) {
        userNombRef.current.focus();
        setFocusedInput('userNomb'); // Aplicar el estilo resaltado
      }
    }, []);

    //function to handle registration logic
    const handleRegister = async() => {
   
        try {
          /*
          const location = await getUserLocation();
          if (location.errorMsg) {
            setErrorMsg(location.errorMsg);
            Alert.alert('Error de ubicación', location.errorMsg);
          } else {
            const { latitude, longitude, altitude } = location;
            setLatitude(latitude);
            setLongitude(longitude);
            setAltitude(altitude);
    
            Alert.alert(
              'Ubicación obtenida',
              `Latitud: ${latitude}\nLongitud: ${longitude}\nAltitud: ${altitude}`
            );
          }
          */
       
            /*if  (userName.length === 0 || password.length === 0 || confirmPassword.length === 0) {
                Alert.alert('Atencion!', 'Por favor ingrese todos los campos.');
                return;
            }
            */

            if(userNomb.trim().length === 0) {
              Alert.alert('Atencion!', 'Por favor ingrese sus Nombres y Apellidos.');
              userNombRef.current.focus(); // Enfocar automáticamente
              setFocusedInput('userNomb'); // Resaltar el campo
              return;
              }

              if(userDni.trim().length === 0) {
                Alert.alert('Atencion!', 'Por favor ingrese su DNI.');
                dniRef.current.focus(); // Enfocar automáticamente
                setFocusedInput('userDni'); // Resaltar el campo
                return;
                }  

            if(userDni.trim().length < 8) {
                  Alert.alert('Atencion!', 'El numero de DNI es incorrecto.');
                  dniRef.current.focus(); // Enfocar automáticamente
                  setFocusedInput('userDni'); // Resaltar el campo
                  return;
             }     

            if(userName.trim().length === 0) {
                Alert.alert('Atencion!', 'Por favor ingrese su Email.');
                emailRef.current.focus(); // Enfocar automáticamente
                setFocusedInput('userName'); // Resaltar el campo
                return;
                 }
                 
            if(password.trim().length === 0) {
                Alert.alert('Atencion!', 'Por favor ingrese su Password.');
                passwordRef.current.focus(); // Enfocar automáticamente
                setFocusedInput('password'); // Resaltar el campo
                return;
              }
            
            if(confirmPassword.trim().length === 0) {
                Alert.alert('Atencion!', 'Por favor ingrese su Confirmacion de Password.');
                confirpasswordRef.current.focus(); // Enfocar automáticamente
                setFocusedInput('confirmPassword'); // Resaltar el campo
                return;
              }

            if (password !== confirmPassword) {
                Alert.alert('Error', 'Password no coincide');               
                confirpasswordRef.current.focus(); // Enfocar automáticamente
                setFocusedInput('confirmPassword'); // Resaltar el campo
                return;
            }
    
            if (!isValidEmail(userName)) {
                Alert.alert('Error', 'Email no valido!');
                emailRef.current.focus(); // Enfocar automáticamente
                setFocusedInput('userName'); // Resaltar el campo
                return;
            }

            if  (latitude==null && longitude==null && altitude==null) {
              Alert.alert('Error en Obtener Ubicación', errorMsg);
              return;
             }

            const existingUser = await db.getFirstAsync('SELECT * FROM users WHERE username = ?', [userName]);
            if (existingUser) {
                Alert.alert('Error', 'Usuario ya existe.');
                emailRef.current.focus(); // Enfocar automáticamente
                setFocusedInput('userName'); // Resaltar el campo
                return;             
            }
         
            const result = await db.runAsync('INSERT INTO users (username, password,dni,nombape,lati,longi,altura) VALUES (?, ?,?, ?, ?,?, ?)', [userName, password,userDni,userNomb,latitude,longitude,altitude]);
            Alert.alert('Correcto', 'Registro Completado exitosamente!');
            //const insertedId = result.lastInsertRowId;
            //Alert.alert('Correcto', `Registro completado exitosamente! ID: ${insertedId}`);
            //navigation.navigate('Home', {user : userName});
            navigation.navigate('Login');
           
        } catch (error) {
            console.log('Error durante el registro : ', error);
        }
   
      
    }

    return (
        <KeyboardAvoidingView>
         <ScrollView>   
        <View style={styles.container}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.title}>Registro de Gestante</Text>

            <TextInput  
              ref={userNombRef} // Asignar la referencia         
              style={[
                styles.input,
                focusedInput === 'userNomb' && styles.inputFocused,
              ]}
              placeholder="Nombres y Apellidos"
              value={userNomb}
              onChangeText={setUserNomb}
              onFocus={() => setFocusedInput('userNomb')}
              onBlur={() => setFocusedInput(null)}
              returnKeyType="next" // Configura el botón Enter para "siguiente"
              onSubmitEditing={() => dniRef.current.focus()} 
            />

            <TextInput 
                ref={dniRef} // Asignar la referencia         
                style={[
                  styles.input,
                  focusedInput === 'userDni' && styles.inputFocused,
                ]}
                placeholder='DNI'
                value={userDni}
                maxLength={8}
                keyboardType="numeric"
                onChangeText={setUserDni}
                onFocus={() => setFocusedInput('userDni')}
                onBlur={() => setFocusedInput(null)}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current.focus()} // Enfoca al siguiente campo
            />

            <TextInput 
                ref={emailRef} // Asignar la referencia         
                style={[
                  styles.input,
                  focusedInput === 'userName' && styles.inputFocused,
                ]}
                placeholder='Email'
                keyboardType="email-address"
                value={userName}
                onChangeText={setUserName}
                onFocus={() => setFocusedInput('userName')}
                onBlur={() => setFocusedInput(null)}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()} // Enfoca al siguiente campo
            />
            <TextInput 
                ref={passwordRef} // Asignar la referencia         
                style={[
                  styles.input,
                  focusedInput === 'password' && styles.inputFocused,
                ]}
                placeholder='Password'
                secureTextEntry
                maxLength={10}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                returnKeyType="next"
                onSubmitEditing={() => confirpasswordRef.current.focus()} // Enfoca al siguiente campo
            />
            <TextInput 
                ref={confirpasswordRef} // Asignar la referencia         
                style={[
                  styles.input,
                  focusedInput === 'confirmPassword' && styles.inputFocused,
                ]}
                placeholder='Confirmar password'
                secureTextEntry
                value={confirmPassword}
                maxLength={10}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                returnKeyType="done" // Último campo no necesita ir a otro
                onSubmitEditing={handleRegister} // Invoca el registro al terminar
            />             
            
            <Pressable style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText} >Guardar</Text>
            </Pressable>
            <Pressable style={styles.link} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Ya tienes una cuenta? Ir a Login</Text>
            </Pressable>
        </View>
        </ScrollView>
    </KeyboardAvoidingView>     
    )
}

//HomeScreen component
const HomeScreen = ({navigation, route}) => {
    const db = useSQLiteContext();
    const categoryList = [
        {
          id: '1',
          title: 'FECHA DE ULTIMA REGLA',
        },
        {
          id: '2',
          title: 'DATOS DE TU ECOGRAFIA',
        },
        {
          id: '3',
          title: 'FECHA PROBABLE DE PARTO',
        },
      ];
      
      const { user } = route.params;

      const handleNavigation = (id) => {
        switch (id) {
          case '1':
            navigation.navigate('Fur',{user : user});
            break;
          case '2':
            navigation.navigate('Eco',{user : user});
            break;          
          case '3':
            navigation.navigate('Parto',{user : user});
            break;     
          default:
            console.log('Opción no válida');
        }
      };

    //we'll extract the user parameter from route.params
    
    //navigation.navigate('Home', {user : userName});

    const imageMapping = {
        '1': logofur,
        '2': logoeco,
        '3': logofpp,
      };

      //Add 08122024
      /////////////////////////////////////
        const [lat, setLat] = useState('');
        const [lon, setLon] = useState('');
        const [alt, setAlt] = useState('');
        const [dni, setDni] = useState('');
        const [isLoading, setIsLoading] = useState(true); // Indicador de carga
      
        // Cargar datos de la base de datos al montar el componente
        useEffect(() => {
          const fetchData = async () => {
            try {
              const valUser = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [user.id]);
              if (valUser) {
                setLat(valUser.lati || ''); 
                setLon(valUser.longi || ''); 
                setAlt(valUser.altura || ''); 
                setDni(valUser.dni || ''); 
              } else {
                setLat(''); 
                setLon(''); 
                setAlt(''); 
                setDni(''); 
              }
            } catch (error) {
              console.log('Error al consultar la base de datos:', error);
            } finally {
              setIsLoading(false); 
            }
          };
      
          fetchData();
        }, [db, user.id]);
      /////////////////////////////////////
      //Fin Add 08122024
    
    return (
        <View className="mt-3">
        <Text className="bg-violet-100 p-4 text-black m-10 border border-solid border-green-900 rounded font-bold text-[17px] text-center">En base a la informacion que manejes seleciona una opcion para calcular tu edad gestacional</Text>
        <FlatList
          data={categoryList}
          numColumns={1}
          renderItem={({item,index})=>(
            <TouchableOpacity 
            onPress={() => handleNavigation(item.id)}
            className="flex-1 items-center 
            justify-center p-2 border-[1px] border-blue-600 
            m-1 h-[150px] rounded-lg bg-blue-650 ">              
              <Image source={imageMapping[item.id]}
              className="w-[75px] h-[75px] "
              />
             <Text className="text-[14px] mt-1 font-bold">{item.title}</Text>
            </TouchableOpacity>
          )}
        />
    </View>
    )
}

//Para Fur

const FurScreen = ({navigation, route}) => {

    const db = useSQLiteContext();

    //we'll extract the user parameter from route.params
    const { user } = route.params;

    const [focusedInput, setFocusedInput] = useState(null); 
    const selectedDateRef = useRef(null);

    LocaleConfig.locales['fr'] = {
        monthNames: [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Setiembre',
          'Octubre',
          'Noviembre',
          'Diciembre'
        ],
        monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr', 'May', 'Jun', 'Jul.', 'Ago', 'Set.', 'Oct.', 'Nov.', 'Dic.'],
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
        dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mie.', 'Jue.', 'Vie.', 'Sab.'],
        today: "Hoy"
      };
      
      LocaleConfig.defaultLocale = 'fr';

    /////////////////////////////////////
    const [selectedDate, setSelectedDate] = useState('');
    const [isLoading, setIsLoading] = useState(true); 
  
    // Cargar datos de la base de datos al montar el componente
    useEffect(() => {
      const fetchData = async () => {
        try {
          const validUserFur = await db.getFirstAsync('SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?', [user.id]);
          if (validUserFur) {
            setSelectedDate(validUserFur.fur || ''); // Asignar la fecha obtenida de la BD
          } else {
            setSelectedDate(''); // Si no hay datos, dejar vacío
          }
        } catch (error) {
          console.log('Error al consultar la base de datos:', error);
        } finally {
          setIsLoading(false); // Finaliza el estado de carga
        }
      };
  
      fetchData();
    }, [db, user.id]);
    /////////////////////////////////////
     
      //const [selectedDate, setSelectedDate] = useState('');
      //const [selectedDate, setSelectedDate] = useState('2024-12-01');
    
      const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
        console.log('selected day', day);
     };

     useEffect(() => {
      if (selectedDateRef.current) {
        selectedDateRef.current.focus();
        setFocusedInput('selectedDate'); 
      }
    }, []);

     const handleRegiFur = async() => {

        //Alert.alert('Presionaste!', 'Presionaste handleRegiFur!!!');    
                 
            try {   

              if(selectedDate.trim().length === 0) {
                Alert.alert('Atencion!', 'Por favor ingrese una Fecha!.');
                selectedDateRef.current.focus();
                setFocusedInput('selectedDate'); 
                return;
                }

                const valUserFur = await db.getFirstAsync('SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?', [user.id]);
                
                //Alert.alert('AlGrabar : ' + valUserFur.id, valUserFur.fur);  
                    if(valUserFur){
                        const resultudp =   await db.runAsync('UPDATE T_05_ETAPA_GESTACIONAL SET fur = ? WHERE id = ?', [selectedDate,user.id]);  
                        //const resultudp =   await db.runAsync('UPDATE T_05_ETAPA_GESTACIONAL SET fur = ? WHERE id = ?', [user.id,selectedDate]);  
                        Alert.alert('Correcto', 'Registro FUR Actualizado exitosamente!');      
                        
                        //navigation.navigate('TabNavigator', {user:user});
                        //navigation.navigate('Home', {user:user});
                    }else{   
                        const resultins = await db.runAsync('INSERT INTO T_05_ETAPA_GESTACIONAL (id, fur) VALUES (?, ?)', [user.id, selectedDate]);
                        Alert.alert('Correcto', 'Registro FUR Registrado exitosamente!');      
                        //navigation.navigate('TabNavigator', {user:user});
                        //navigation.navigate('Home', {user:user});
                       //const insertedId = resultins.lastInsertRowId;
                        //Alert.alert('Correcto', `Registro FUR Registrado exitosamente! ID: ${insertedId}`);
                                                
                    }  
                    
                    /////////////////Add 10122024 Grabado marker semanas de embarazo para agenda/////////////
                    /*
                    Alert.alert('selectedDate miraxxx : ', selectedDate);
                    const today = new Date(); 
                    const pastDate = new Date(selectedDate);
                    const difference = differenceInDays(today, pastDate);
                    //console.log('Diferencia en días:', difference);
                    const weeks = Math.floor(difference / 7);
                    const remainingDays = difference % 7;
                    //console.log('Diferencia en semanas:', weeks);
                    //console.log('Días restantes:', remainingDays);
                    */

                    //grabando marcadores

                    const datmarkereg = await db.getFirstAsync('SELECT * FROM T_05_AGENDA_GESTACIONAL WHERE id = ?', [user.id]);
                   
                      await db.runAsync('DELETE FROM T_05_AGENDA_GESTACIONAL WHERE id = $id', { $id: user.id });
                      console.log('Remove Agenda:', 'RemoveAgenda');
                                     
                          //const startDate = new Date('2024-06-29'); 
                          const startDate = new Date(selectedDate); 
                          let currentDate = startDate;
                          const weeksGestacion = 40; 
                          //const results = [];
                       
                          for (let i = 1; i <= weeksGestacion; i++) {
                            currentDate = addDays(currentDate, 7); 
                            let sem_marker = format(currentDate, 'yyyy-MM-dd');
                            const resinsagen = await db.runAsync('INSERT INTO T_05_AGENDA_GESTACIONAL (id,nrosem,fec_marker) VALUES (?,?,?)', [user.id, i ,sem_marker]);
                            //results.push(format(currentDate, 'yyyy-MM-dd')); 
                          }
                          //console.log(results);
                          console.log('inserte Agenda:', 'INSAgenda');
                 
                   
                    /////////////////Fin Add 10122024 Grabado marker semanas de embarazo para agenda/////////

                } catch (error) {
                    console.log('Error durante el registro del FUR : ', error);
                }finally {
                  // Aquí puedes realizar acciones que se ejecuten sin importar si ocurrió un error o no.
                  console.log('Proceso FUR terminado, ya sea con éxito o con error.');
                  navigation.navigate('TabNavigator', {user:user});
                  
              }

        }

        const [isPressed, setIsPressed] = useState(false);
    return(
        <>
        <View style={styles.containercalendario}>
            <Text style={styles.title}>FUR</Text>
            <Image source={logofur}
              className="w-[75px] h-[75px] "
              />                
        </View>
        <View style={styles.containerCalendar}>        
        <TextInput 
                ref={selectedDateRef} // Asignar la referencia         
                style={[
                  styles.input,
                  focusedInput === 'selectedDate' && styles.inputFocused,
                ]}
                placeholder='Fecha'     
                editable={false}           
                maxLength={10}
                value={selectedDate}
                onChangeText={setSelectedDate}
                onFocus={() => setFocusedInput('selectedDate')}
                onBlur={() => setFocusedInput(null)}
            />    
        <Calendar
        style={styles.calendar} 
        // Fecha seleccionada y resaltada en forma circular
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#FF6347', // Color del círculo
            textColor: '#FFFFFF', // Color del texto
          },
        }}
        onDayPress={handleDayPress}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#FF6347',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          arrowColor: 'orange',
          monthTextColor: 'blue',
          indicatorColor: 'blue',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 16,
        }}
      />
      
      <TouchableOpacity 
      onPress={handleRegiFur}   
      onPressIn={() => setIsPressed(true)} // Activa el estado "presionado"
      onPressOut={() => setIsPressed(false)} // Desactiva el estado al soltar
      className={`flex-row items-center justify-center rounded-lg ${
        isPressed ? 'bg-blue-700' : 'bg-blue-500'
      }`}
      style={{
        width: '70%', // Ajusta el ancho según la pantalla (un 80% del ancho disponible)
        height: 50, // Altura más estrecha para un diseño estilizado
        paddingVertical: 10, // Ajusta el relleno vertical
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      activeOpacity={0.8} // Reduce la opacidad al presionar
    >
      <Image
        source={iconsave}
        className="w-8 h-8 mr-2" // Reduce el tamaño del ícono para que encaje con la altura del botón
        resizeMode="contain"
      />
      <Text className="text-white font-semibold text-base">Guardar</Text> 
    </TouchableOpacity>
        </View>
    </>
    )   
}

const EcoScreen = ({navigation, route}) => {
    const db = useSQLiteContext();
    const { user } = route.params;

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [open2, setOpen2] = useState(false);
    const [value2, setValue2] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  
    const [errorSemana, setErrorSemana] = useState(false);
    const [errorDias, setErrorDias] = useState(false);

   // Cargar datos de la base de datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const validUserEco = await db.getFirstAsync(
          'SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?',
          [user.id]
        );

        if (validUserEco) {
          setValue(String(validUserEco.eco_nro_sem_emb) || '');
          setValue2(String(validUserEco.eco_nro_dias_emb) || '');
        } else {
          setValue('');
          setValue2('');
        }
      } catch (error) {
        console.log('Error al consultar la base de datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [db, user.id]);

  //Alert.alert('guardadoBD', `Valor: ${value} - value2 : ${value2}`); 

    const [items, setItems] = useState([
      { label: 'Semana 1', value: '1' },
      { label: 'Semana 2', value: '2' },
      { label: 'Semana 3', value: '3' },
      { label: 'Semana 4', value: '4' },
      { label: 'Semana 5', value: '5' },
      { label: 'Semana 6', value: '6' },
      { label: 'Semana 7', value: '7' },
      { label: 'Semana 8', value: '8' },
      { label: 'Semana 9', value: '9' },
      { label: 'Semana 10', value: '10' },
      { label: 'Semana 11', value: '11' },
      { label: 'Semana 12', value: '12' },
      { label: 'Semana 13', value: '13' },
      { label: 'Semana 14', value: '14' },
      { label: 'Semana 15', value: '15' },
      { label: 'Semana 16', value: '16' },
      { label: 'Semana 17', value: '17' },
      { label: 'Semana 18', value: '18' },
      { label: 'Semana 19', value: '19' },
      { label: 'Semana 20', value: '20' },
      { label: 'Semana 21', value: '21' },
      { label: 'Semana 22', value: '22' },
      { label: 'Semana 23', value: '23' },
      { label: 'Semana 24', value: '24' },
      { label: 'Semana 25', value: '25' },
      { label: 'Semana 26', value: '26' },
      { label: 'Semana 27', value: '27' },
      { label: 'Semana 28', value: '28' },
      { label: 'Semana 29', value: '29' },
      { label: 'Semana 30', value: '30' },
      { label: 'Semana 31', value: '31' },
      { label: 'Semana 32', value: '32' },
      { label: 'Semana 33', value: '33' },
      { label: 'Semana 34', value: '34' },
      { label: 'Semana 35', value: '35' },
      { label: 'Semana 36', value: '36' },
      { label: 'Semana 37', value: '37' },
      { label: 'Semana 38', value: '38' },
      { label: 'Semana 39', value: '39' },
      { label: 'Semana 40', value: '40' },
    ]);
  
///////////////////////////////////////////////

const [items2, setItems2] = useState([
  { label: '1 dia', value: '1' },
  { label: '2 dias', value: '2' },
  { label: '3 dias', value: '3' },
  { label: '4 dias', value: '4' },
  { label: '5 dias', value: '5' },
  { label: '6 dias', value: '6' }, 
]);
///////////////////////////////////////////////


const handleButtonPress = async () => {  
  try {

    //Alert.alert('Error combate value :', value);
    if (!value || value == 'null') {
      setErrorSemana(true); // Resalta el combo de semanas
      setErrorDias(false); // Asegura que el otro combo no se marque
      Alert.alert('Error', 'Por favor, selecciona una opción en el numero de semanas.');
      return;
    }
    if (!value2 || value2 == 'null') {
      setErrorDias(true); // Resalta el combo de días
      setErrorSemana(false); // Asegura que el otro combo no se marque
      Alert.alert('Error', 'Por favor, selecciona una opción en el numero de dias.');
      return;
    }

    const valUserEco = await db.getFirstAsync(
      'SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?',
      [user.id]
    );

    if (valUserEco) {
      await db.runAsync(
        'UPDATE T_05_ETAPA_GESTACIONAL SET eco_nro_sem_emb = ?, eco_nro_dias_emb = ? WHERE id = ?',
        [value, value2, user.id]
      );
      //Alert.alert('Correcto', 'Registro de Ecografia Actualizado exitosamente!');      
      //navigation.navigate('Home', {user:user});
    } else {
      await db.runAsync(
        'INSERT INTO T_05_ETAPA_GESTACIONAL (id, eco_nro_sem_emb, eco_nro_dias_emb) VALUES (?, ?, ?)',
        [user.id, value, value2]
      );
      //Alert.alert('Correcto', 'Registro de Ecografia Registrado exitosamente!');      
      //navigation.navigate('Home', {user:user});         
    }
  } catch (error) {
    console.log('Error al guardar los datos:', error);
  }
};
  
  const [isPressed, setIsPressed] = useState(false);
    return (
      <>
        <View className="flex-1 justify-center items-center bg-gray-100 -mt-100">       
          <View style={styles.containercalendario}>
            <Text style={styles.title}>ECOGRAFIA</Text>
            <Image
              source={logoeco}
              className="w-[75px] h-[75px]"
            />
          </View>
  
          <View style={styles.containerCombate}>
            <Text className="text-lg font-bold mb-4 text-center">Número de Semanas</Text>
  
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder="Selecciona una opción"
              style={{
                width: '100%',
                height: 50,
                backgroundColor: errorSemana ? 'yellow' : '#f1f5f9', // Amarillo si hay error
                borderColor: errorSemana ? '#facc15' : '#cbd5e1', // Amarillo si hay error
                borderRadius: 8,                
              }}
              dropDownContainerStyle={{
                width: '100%',
                backgroundColor: 'white',
              }}
              textStyle={{
                fontSize: 16,
                color: '#374151', // Gray-700 de Tailwind
              }}
            />
          </View>

          <View style={styles.containerCombate}>
            <Text className="text-lg font-bold mb-4 text-center">Número de dias</Text>
  
            <DropDownPicker
              open={open2}
              value={value2}
              items={items2}
              setOpen={setOpen2}
              setValue={setValue2}
              setItems={setItems2}
              placeholder="Selecciona una opción"
              style={{
                width: '100%',
                height: 50,
                backgroundColor: errorDias ? 'yellow' : '#f1f5f9', // Amarillo si hay error
                borderColor: errorDias ? '#facc15' : '#cbd5e1', // Amarillo si hay error
                borderRadius: 8,
              }}
              dropDownContainerStyle={{
                width: '100%',
                backgroundColor: 'white',
              }}
              textStyle={{
                fontSize: 16,
                color: '#374151', // Gray-700 de Tailwind
              }}
            />
          </View>
   <View style={styles.containerCombateButton}>
    <TouchableOpacity 
      onPress={handleButtonPress}   
      onPressIn={() => setIsPressed(true)} // Activa el estado "presionado"
      onPressOut={() => setIsPressed(false)} // Desactiva el estado al soltar
      className={`flex-row items-center justify-center rounded-lg ${
        isPressed ? 'bg-blue-700' : 'bg-blue-500'
      }`}
      style={{
        width: '70%', // Ajusta el ancho según la pantalla (un 80% del ancho disponible)
        height: 50, // Altura más estrecha para un diseño estilizado
        paddingVertical: 10, // Ajusta el relleno vertical
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      activeOpacity={0.8} // Reduce la opacidad al presionar
    >
      <Image
        source={iconsave}
        className="w-8 h-8 mr-2" // Reduce el tamaño del ícono para que encaje con la altura del botón
        resizeMode="contain"
      />
      <Text className="text-white font-semibold text-base">Guardar</Text> 
    </TouchableOpacity>
    </View>

        </View>
      </>
    );
  }

const PartoScreen = ({navigation, route}) => {

    const db = useSQLiteContext();

    const [focusedInput, setFocusedInput] = useState(null); 
    const selectedDateRef = useRef(null);

    //we'll extract the user parameter from route.params
    const { user } = route.params;

    LocaleConfig.locales['fr'] = {
        monthNames: [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Setiembre',
          'Octubre',
          'Noviembre',
          'Diciembre'
        ],
        monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr', 'May', 'Jun', 'Jul.', 'Ago', 'Set.', 'Oct.', 'Nov.', 'Dic.'],
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
        dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mie.', 'Jue.', 'Vie.', 'Sab.'],
        today: "Hoy"
      };
      
      LocaleConfig.defaultLocale = 'fr';
 
    const [selectedDate, setSelectedDate] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Indicador de carga
  
    // Cargar datos de la base de datos al montar el componente
    useEffect(() => {
      const fetchData = async () => {
        try {
          const validUserFpp = await db.getFirstAsync('SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?', [user.id]);
          if (validUserFpp) {
            setSelectedDate(validUserFpp.fec_proba_parto || ''); // Asignar la fecha obtenida de la BD
          } else {
            setSelectedDate(''); // Si no hay datos, dejar vacío
          }
        } catch (error) {
          console.log('Error al consultar la base de datos:', error);
        } finally {
          setIsLoading(false); // Finaliza el estado de carga
        }
      };
  
      fetchData();
    }, [db, user.id]);
      
      const handleDayPressfpp = (day) => {
        setSelectedDate(day.dateString);
        console.log('selected day', day);
     };

     useEffect(() => {
      if (selectedDateRef.current) {
        selectedDateRef.current.focus();
        setFocusedInput('selectedDate'); 
      }
    }, []);

     const handleRegiFpp = async() => {

        //Alert.alert('Presionaste!', 'Presionaste handleRegiFpp!!!');    
                 
            try { 
              
              if(selectedDate.trim().length === 0) {
                Alert.alert('Atencion!', 'Por favor ingrese una Fecha!.');
                selectedDateRef.current.focus();
                setFocusedInput('selectedDate'); 
                return;
                }

                const valUserFpp = await db.getFirstAsync('SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?', [user.id]);
                  
                    if(valUserFpp){
                        const resultudp =   await db.runAsync('UPDATE T_05_ETAPA_GESTACIONAL SET fec_proba_parto = ? WHERE id = ?', [selectedDate,user.id]);                          
                        Alert.alert('Correcto', 'Registro FPP Actualizado exitosamente!');      
                        navigation.navigate('Home', {user:user});
                    }else{   
                        const resultins = await db.runAsync('INSERT INTO T_05_ETAPA_GESTACIONAL (id, fec_proba_parto) VALUES (?, ?)', [user.id, selectedDate]);
                        Alert.alert('Correcto', 'Registro FPP Registrado exitosamente!');      
                        navigation.navigate('Home', {user:user});                       
                                                
                    }            

                } catch (error) {
                    console.log('Error durante el registro del FPP : ', error);
                }

        }

        const [isPressed, setIsPressed] = useState(false);
    return(
        <>
        <View style={styles.containercalendario}>
            <Text style={styles.title}>Fecha Probable de Parto</Text>
            <Image source={logofpp}
              className="w-[75px] h-[75px] "
              />                
        </View>
        <View style={styles.containerCalendar}>        
        <TextInput 
                ref={selectedDateRef} // Asignar la referencia         
                style={[
                  styles.input,
                  focusedInput === 'selectedDate' && styles.inputFocused,
                ]}
                placeholder='Fecha'     
                editable={false}           
                maxLength={10}
                value={selectedDate}
                onChangeText={setSelectedDate}
                onFocus={() => setFocusedInput('selectedDate')}
                onBlur={() => setFocusedInput(null)}
            />    
        <Calendar
        style={styles.calendar} 
        // Fecha seleccionada y resaltada en forma circular
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#FF6347', // Color del círculo
            textColor: '#FFFFFF', // Color del texto
          },
        }}
        onDayPress={handleDayPressfpp}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#FF6347',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          arrowColor: 'orange',
          monthTextColor: 'blue',
          indicatorColor: 'blue',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 16,
        }}
      />
      
      <TouchableOpacity 
      onPress={handleRegiFpp}   
      onPressIn={() => setIsPressed(true)} // Activa el estado "presionado"
      onPressOut={() => setIsPressed(false)} // Desactiva el estado al soltar
      className={`flex-row items-center justify-center rounded-lg ${
        isPressed ? 'bg-blue-700' : 'bg-blue-500'
      }`}
      style={{
        width: '70%', // Ajusta el ancho según la pantalla (un 80% del ancho disponible)
        height: 50, // Altura más estrecha para un diseño estilizado
        paddingVertical: 10, // Ajusta el relleno vertical
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      activeOpacity={0.8} // Reduce la opacidad al presionar
    >
      <Image
        source={iconsave}
        className="w-8 h-8 mr-2" // Reduce el tamaño del ícono para que encaje con la altura del botón
        resizeMode="contain"
      />
      <Text className="text-white font-semibold text-base">Guardar</Text> 
    </TouchableOpacity>
        </View>
    </>
    )   
}


const styles = StyleSheet.create({
    containerAdjusted: {
        flex: 1.7,
        justifyContent: 'flex-start', // Alinea los elementos al inicio
        alignItems: 'center',
        paddingTop: 20, // Espacio superior ajustable
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
      }, containercalendario: {
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 60,
      },
      logo: {
        height: 150, // Reducido para ajustar el diseño
        width: 150,
        resizeMode: 'contain',
        marginBottom: 10, // Menos margen inferior
    }, icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 22, // Más pequeño para ahorrar espacio
    fontWeight: 'bold',
    marginBottom: 10, // Menos margen inferior
},
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 5,
  },
  inputFocused: {
    backgroundColor: 'yellow',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    marginVertical: 10,
    width: '80%',
    borderRadius: 5,
},
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
},
  link: {
    marginTop: 5, // Reducido para ahorrar espacio
},
  linkText: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 16,
},
  userText: {
    fontSize: 18,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15, // Espaciado más compacto entre inputs
},
containerCalendar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 100,
  },
  calendar: {
    width: '100%', // Asegura que el calendario ocupe todo el ancho disponible
    borderRadius: 10, // Opcional: redondea los bordes del calendario
    marginBottom: 20,
  },containerCombate: {
    width: '70%', 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 10,
  },containerCombateButton: {
    width: '100%',     
    justifyContent: 'center',
    alignItems: 'center',    
    paddingHorizontal: 10,
    marginBottom: 100,
  },
  
});
