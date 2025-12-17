import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, Dimensions,StyleSheet, Text, View, TextInput, Pressable, Alert, Image,TouchableOpacity,KeyboardAvoidingView,ScrollView,FlatList,ActivityIndicator } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useState, useEffect, useRef } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import logo from './images/logogestanew.png';
import logoeco from './images/icoeco.png';
import logofpp from './images/icofpp.png';
import logofur from './images/icofur.png';
import iconsave from './images/btnsave.png';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import DropDownPicker from 'react-native-dropdown-picker';
import getUserLocation  from './hooks/userLocation';
import TabNavigation from './Apps/Navigations/TabNavigation';
import Iconlogin from 'react-native-vector-icons/MaterialIcons';
import FlotaButton from './Apps/Components/Views/FlotaButton'
import { addDays, format,differenceInDays } from 'date-fns';
import Constants from 'expo-constants';
import * as Notifications from "expo-notifications";
import { setupNotifications, registerBackgroundSync, performSync } from "./Apps/Services/syncTask";
import { NetworkProvider,getCurrentNetworkState } from "./Apps/Context/NetworkContext";
import { NetworkBanner } from "./Apps/Components/Views/NetworkBanner";
import { apiFetch } from './Apps/Services/api';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { syncCenanData } from './Apps/Services/syncGesta';
import { setupAlarmNotifications, registerAlarmBackgroundTask,alarmabbSync  } from "./Apps/Services/alarmaTaskSyncall";
import { setupEventosNotifications, registerEventosBackgroundTask,eventosSync  } from "./Apps/Services/eventTaskSyncall";
import DateTimePicker from "@react-native-community/datetimepicker";
import { setupBackendNotifications } from "./Apps/Components/Notifications/notificationSetup";

//initialize the database
const initializeDatabase = async(db) => {
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username varchar(100) UNIQUE,
                password varchar(10),
                dni varchar(8),
                nombape varchar(150),
                lati varchar(100),
                longi varchar(100),
                altura varchar(100),
                lati_viv varchar(100),
                longi_viv varchar(100),
                altura_viv varchar(100),
                profileImage varchar(100),
                expopushtoken TEXT NULL
            );
        `);

        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS T_05_ETAPA_GESTACIONAL (
                id TEXT PRIMARY KEY NOT NULL,
                opcgesta INT NULL,
                fur varchar(10) NULL,
                fec_proba_parto varchar(10) NULL,
                eco_nro_sem_emb INT NULL,
                eco_nro_dias_emb INT NULL,
                hemoglo varchar(10) NULL,
                calcu_nrosema INT NULL,
                calcu_nrodias INT NULL,
                calcu_nrodias_parto INT NULL,
                calcu_fecaprox_parto varchar(10) NULL,
                eco_fechaori varchar(10) NULL
                );
        `);

        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS T_05_AGENDA_GESTACIONAL (
                id TEXT NOT NULL,                
                nrosem INT NOT NULL,
                fec_marker varchar(10) NULL,
                PRIMARY KEY (id, nrosem)                
                );
        `);

        await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS T_05_DIAS_GESTACION (
            id_diasg INTEGER NOT NULL,
            iduser TEXT NOT NULL,                
            nroseman INT NOT NULL,
            fec_seman varchar(10) NULL,
            fec_diagesta varchar(10) NULL,
            PRIMARY KEY (id_diasg, iduser)               
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
              video_premio_codigoid VARCHAR(100),
              video_group INT,
              video_free1_desc VARCHAR(200),
              video_free1_ruta VARCHAR(100),
              video_free2_desc VARCHAR(200),
              video_free2_ruta VARCHAR(100),
              video_free3_desc VARCHAR(200),
              video_free3_ruta VARCHAR(100)               
                );
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (5, 'imgsemilla.png', 'Tu bebé tiene el tamaño de una semilla de ajonjolí', NULL, '0.2 gramos', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (6, 'imgarroz.png', 'Tu bebé tiene el tamaño de un grano de arroz', '0.3  cm', '0.6 gramos', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (7, 'imgfrijol.png', 'Tu bebé tiene el tamaño de un frijol', '1.1 cm', '1 -2 gramos', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (8, 'imgcereza.png', 'Tu bebé tiene el tamaño de una cereza', '1.7 cm', '2-3 gramos', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (9, 'imgframbuesa.png', 'Tu bebé tiene el tamaño de una frambuesa', '2.4 cm', '3 gramos', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (10, 'imgpallar.png', 'Tu bebé tiene el tamaño de un pallar', '3.4 cm', '4 gramos', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Padres Responsables', 'https://youtu.be/7j6zmLHw2Ug', '7j6zmLHw2Ug', '10', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (11, 'imglimón.png', 'Tu bebé tiene el tamaño de un limón', '4.3 cm', '7 gramos', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cayhua Rellena', 'z5HSfDxoxxE', 'Prevención de anemia en el embarazo', 'https://youtu.be/IKotgJh44wE', 'IKotgJh44wE', '11', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (12, 'imglima.png', 'Tu bebé tiene el tamaño de una lima', '5.7 cm', '14 gramos', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Lentejitas', 'j6CqeYAGcKA', 'Mitos del sulfato ferroso', 'https://youtu.be/gI-okzMcOPw', 'gI-okzMcOPw', '12', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (13, 'imgdurazno.png', 'Tu bebé tiene el tamaño de un durazno', '8 cm', '23 gramos', 'Nutricionales - Semana 13', 'mgUG51404is', 'Obstétricos - Semana 13', 'KuSHrMK_mWQ', 'Estimulación - Semana 13', 'pw2j88RdW1U', 'Mamá y Bebé - Semana 13', 'hFP-qgj84Sg', NULL, NULL, 'Tallarines verdes', 'nTcVbTTfMs4', 'Guia del uso del APP', 'https://youtu.be/gZ_KCjzEIdU', 'gZ_KCjzEIdU', '13', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (14, 'imgkiwi.png', 'Tu bebé tiene el tamaño de un kiwi', '14 cm', '43 gramos', 'Nutricionales - Semana 14', '1TIIo-HEOGc', 'Obstétricos - Semana 14', '2nHgyMHQT0o', 'Estimulación - Semana 14', 'lp_N8FjFcVw', 'Mamá y Bebé - Semana 14', 'pvVqgBnJbWg', NULL, NULL, 'Higado encebollado', 'c46b2s3kPUs', NULL, NULL, NULL, '16', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (15, 'imgmanzana.png', 'Tu bebé tiene el tamaño de una manzana', '15 cm', '70 gramos', 'Nutricionales - Semana 15', 'ELm89TAf4IE', 'Obstétricos - Semana 15', 'nDCkTKecXjY', 'Estimulación - Semana 15', 'w0UwLb_4ke8', 'Mamá y Bebé - Semana 15', 'bic8N4mh-Dg', NULL, NULL, 'Causa de sangresita', '4sh94k24RGY', NULL, NULL, NULL, '16', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (16, 'imgpera.png', 'Tu bebé tiene el tamaño de una pera', '16 cm', '100 gramos', 'Nutricionales - Semana 16', 'hLXJ4QDf6Pc', 'Obstétricos - Semana 16', 'hFJhq5zFslo', 'Estimulación - Semana 16', 'BtpopGqxHsg', 'Mamá y Bebé - Semana 16', 'O9KcQFQ0obw', NULL, NULL, 'Trigo a la jardinera', 'n9K0jbTqiQE', 'Kegel', 'https://youtu.be/aDX8-b1EOYw', 'aDX8-b1EOYw', '16', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (17, 'imgnaranja.png', 'Tu bebé tiene el tamaño de una naranja', '18 cm', '140 gramos', 'Nutricionales - Semana 17', 'yB8AwWz6ezQ', 'Obstétricos - Semana 17', 'zpdOrysFG0I', 'Estimulación - Semana 17', 'ptN0BtUUaEE', 'Mamá y Bebé - Semana 17', 'TgVUGZuHwwA', NULL, NULL, 'Tallarin con pescado', 'gyr1wtjiZr8', NULL, NULL, NULL, '19', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (18, 'imgpalta.png', 'Tu bebé tiene el tamaño de una palta', '20 cm', '190 gramos', 'Nutricionales - Semana 18', 'AqgVl3lyjIw', 'Obstétricos - Semana 18', 'wiiMOsguWko', 'Estimulación - Semana 18', 'EXv7Ik6DWmQ', 'Mamá y Bebé - Semana 18', '4rrvXuGSW-k', NULL, NULL, 'Bofe a la jardinera', 'jdLFZZIknQU', NULL, NULL, NULL, '19', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (19, 'imgmango.png', 'Tu bebé tiene el tamaño de un mango', '22 cm', '240 gramos', 'Nutricionales - Semana 19', 'J09ursg8gjo', 'Obstétricos - Semana 19', '0AXFYF5DCys', 'Estimulación - Semana 19', 'l64NTQdbbjc', 'Mamá y Bebé - Semana 19', '4EniVQ0BjOI', NULL, NULL, 'Sudado con lenteja', 'stX5sFPPSVE', 'Estimulación Prenatal Musical', 'https://youtu.be/2Eet9RPO1pM', '2Eet9RPO1pM', '19', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (20, 'imgrosada.png', 'Tu bebé tiene el tamaño de una toronja rosada', '25 cm', '300 gramos', 'Nutricionales - Semana 20', '_N7ll6komN4', 'Obstétricos - Semana 20', 'zfaLN34-Vpo', 'Estimulación - Semana 20', 'u4B1qUjo91U', 'Mamá y Bebé - Semana 20', 'SgqH2DhUQy0', NULL, NULL, 'Garbanzo con higado', 'ldM144pPcdQ', NULL, NULL, NULL, '22', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (21, 'imgpepinillo.png', 'Tu bebé tiene el tamaño de un pepinillo', '26 cm', '360 gramos', 'Nutricionales - Semana 21', 'bXTV8JqUgoM', 'Obstétricos - Semana 21', 'EoQhjsOFAzA', 'Estimulación - Semana 21', '0HcctM3nNvw', 'Mamá y Bebé - Semana 21', 'G3yfE1FIenQ', NULL, NULL, 'Trigo con carne de res', 'Mi6IJOCVPL0', NULL, NULL, NULL, '22', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (22, 'imgberenjena.png', 'Tu bebé tiene el tamaño de una berenjena', '28 cm', '430 gramos', 'Nutricionales - Semana 22', '7pRxFoL17cY', 'Obstétricos - Semana 22', 'fnd-RR_4bDA', 'Estimulación - Semana 22', 'O-VYstw0hcM', 'Mamá y Bebé - Semana 22', 'E6nr3-5PO2Q', NULL, NULL, 'Arroz Primaveral', 'lStxb_VlYlE', 'Ejercicios Prenatales', 'https://youtu.be/GfY1hqpPTdE', 'GfY1hqpPTdE', '22', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (23, 'imgcoco.png', 'Tu bebé tiene el tamaño de un coco', '29 cm', '500 gramos', 'Nutricionales - Semana 23', 'E9tLIk3u1AA', 'Obstétricos - Semana 23', '1QpuqWjYwQQ', 'Estimulación - Semana 23', 'k5Fujm0rHhE', 'Mamá y Bebé - Semana 23', 'QqVmfVTK9s0', NULL, NULL, 'Olluco con carne seca', 'rWMw8zQlKoE', NULL, NULL, NULL, '25', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (24, 'imgcoliflor.png', 'Tu bebé tiene el tamaño de una coliflor', '30 cm', '600 gramos', 'Nutricionales - Semana 24', 'D2YBdSNlhck', 'Obstétricos - Semana 24', '3RtX5IKmmz8', 'Estimulación - Semana 24', 'fkLudxtbMoY', 'Mamá y Bebé - Semana 24', 'df-vjG7W0Ck', NULL, NULL, 'Mondonguito', 'goUh4wIZk6A', NULL, NULL, NULL, '25', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (25, 'imglechuga.png', 'Tu bebé tiene el tamaño de una lechuga', '36 cm', '660 gramos', 'Nutricionales - Semana 25', 'MknPGvocTd8', 'Obstétricos - Semana 25', '9cJFymGfAE4', 'Estimulación - Semana 25', 'AaB-WrztfEc', 'Mamá y Bebé - Semana 25', 'wyFTM7OVU7M', NULL, NULL, 'Vainita Salteada', '-y_eafxJG4E', 'Estimulación Mixta Motora - Musical', 'https://youtu.be/-I-UqrcDCy8', '-I-UqrcDCy8', '25', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (26, 'imgrepollo.png', 'Tu bebé tiene el tamaño de un repollo', '37 cm', '760 gramos', 'Nutricionales - Semana 26', 'zHSJ1S7NDdc', 'Obstétricos - Semana 26', '0UloY4NHa14', 'Estimulación - Semana 26', 'OsXP01gxcJ0', 'Mamá y Bebé - Semana 26', 'x9BrUQQ24Do', NULL, NULL, 'Higado Primaveral', 'LZESr7VxaW8', NULL, NULL, NULL, '28', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (27, 'imgbrocoli.png', 'Tu bebé tiene el tamaño de un brocoli', '38 cm', '875 gramos', 'Nutricionales - Semana 27', 'CTTaubG2qgY', 'Obstétricos - Semana 27', 'EUaxThLYDxQ', 'Estimulación - Semana 27', 'CXtp5GeTZso', 'Mamá y Bebé - Semana 27', 'S0Obwctb82A', NULL, NULL, 'Escabeche de Bazo', '4ucNLR-xz0s', NULL, NULL, NULL, '28', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (28, 'imgmelon.png', 'Tu bebé tiene el tamaño de un melon ', '39 cm', '1000 gramos', 'Nutricionales - Semana 28', '4QJP7MtaZP8', 'Obstétricos - Semana 28', 'qBXTeQUqUn0', 'Estimulación - Semana 28', '5L9wIedvMyU', 'Mamá y Bebé - Semana 28', 'RwtcUnYPOHs', NULL, NULL, 'Lentejas con pota', 'mx1B8agyCcA', 'Posición de Descanso', 'https://youtu.be/XWoeI37bU1U', 'XWoeI37bU1U', '28', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (29, 'imgtoronja.png', 'Tu bebé tiene el tamaño de una toronja amarilla', '40 cm', '1,100 gramos', 'Nutricionales - Semana 29', 'FydSDFgSw0g', 'Obstétricos - Semana 29', 'RA0cw8crhe0', 'Estimulación - Semana 29', 'c8EhqXKq3hs', 'Mamá y Bebé - Semana 29', 'fuuDRE8jRSU', NULL, NULL, 'Uchu de pallar', 'tbCvkF5V1FQ', NULL, NULL, NULL, '31', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (30, 'imgtoronjagran.png', 'Tu bebé tiene el tamaño de una toronja amarilla', '40 cm', '1,300 gramos', 'Nutricionales - Semana 30', 'Q9oUTRw1TLA', 'Obstétricos - Semana 30', '0YZZR90OgHI', 'Estimulación - Semana 30', 'mhlvBCSMi5I', 'Mamá y Bebé - Semana 30', 'gZ_KCjzEIdU', NULL, NULL, 'Crema de garbanzo', '9LJqoKKha4k', NULL, NULL, NULL, '31', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (31, 'imgloche.png', 'Tu bebé tiene el tamaño de un zapallo loche', '41 cm', '1500 gramos', 'Nutricionales - Semana 31', 'nxELCrBScpw', 'Obstétricos - Semana 31', 'W96WByzsHR4', 'Estimulación - Semana 31', 'st7KUjfDf0c', 'Mamá y Bebé - Semana 31', 'BT3HtVv1coI', NULL, NULL, 'Seco de higado', 'FIzNub6EVU4', 'Baño del Bebe', 'https://youtu.be/Ev6mo1FL8WA', 'Ev6mo1FL8WA', '31', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (32, 'imgpina.png', 'Tu bebé tiene el tamaño de una piña', '42 cm', '1,700 gramos', 'Nutricionales - Semana 32', 'iBG7egtsKLg', 'Obstétricos - Semana 32', 'iYejTOzjbzI', 'Estimulación - Semana 32', 'IyzS_2jgr6g', 'Mamá y Bebé - Semana 32', 'rOUgLY-i-3I', NULL, NULL, 'Higado en jugo de limón', 'BUiZ5vz4NBQ', NULL, NULL, NULL, '34', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (33, 'imgpapaya.png', 'Tu bebé tiene el tamaño de una papaya', '44 cm', '1,900 gramos', 'Nutricionales - Semana 33', '6oJJE7o8vNo', 'Obstétricos - Semana 33', 'WY9fNBHRYvw', 'Estimulación - Semana 33', 'KWDQ9-otk4I', 'Mamá y Bebé - Semana 33', 'zp3x2zLVJd4', NULL, NULL, 'Picante de pallares con relleno', 'syJY9PD5wkA', NULL, NULL, NULL, '34', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (34, 'imgsandia.png', 'Tu bebé tiene el tamaño de una sandia chica', '45 cm', '2,100 gramos', 'Nutricionales - Semana 34', 'gZ_KCjzEIdU', 'Obstétricos - Semana 34', 'gZ_KCjzEIdU', 'Estimulación - Semana 34', 'eN4LB-H3Uw0', 'Mamá y Bebé - Semana 34', 'JUhdxqZXs84', NULL, NULL, 'Tallarin con pescado', '8AlUjHE4HjQ', 'Cambio de Pañal', 'https://youtu.be/v0apoSFp8UA', 'v0apoSFp8UA', '34', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (35, 'imgcalabaza.png', 'Tu bebé tiene el tamaño de una calabaza', '46 cm', '2,400 gramos', 'Nutricionales - Semana 35', 'gZ_KCjzEIdU', 'Obstétricos - Semana 35', 'gZ_KCjzEIdU', 'Estimulación - Semana 35', 'gZ_KCjzEIdU', 'Mamá y Bebé - Semana 35', 'gZ_KCjzEIdU', NULL, NULL, 'Chaufa de quinua y trigo', 'rQPyzwiAi3A', NULL, NULL, NULL, '37', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (36, 'imgzapallo.png', 'Tu bebé tiene el tamaño de un zapallo', '47 cm', '2,600 gramos', 'Nutricionales - Semana 36', 'gZ_KCjzEIdU', 'Obstétricos - Semana 36', 'gZ_KCjzEIdU', 'Estimulación - Semana 36', 'Tf5AgnT4wKg', 'Mamá y Bebé - Semana 36', '2k5XLjho4rs', NULL, NULL, 'Tortilla de sangresita', 'HEn0tnG7w4o', NULL, NULL, NULL, '37', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (37, 'imgsandiamed.png', 'Tu bebé tiene el tamaño de una sandia mediana', '48 cm', '2,800 gramos', 'Nutricionales - Semana 37', 'gZ_KCjzEIdU', 'Obstétricos - Semana 37', '-soRk8JBqGs', 'Estimulación - Semana 37', 'gZ_KCjzEIdU', 'Mamá y Bebé - Semana 37', 'X776clkNQ5c', NULL, NULL, 'Chanfainita con trigo', 'ZL-P6no0qPA', 'Masajes al Bebe', 'https://youtu.be/-ACLBvSZhNE', '-ACLBvSZhNE', '37', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (38, 'imgcalabazag.png', 'Tu bebé tiene el tamaño de una calabaza grande', '49 cm', '3,000 gramos', NULL, NULL, 'Obstétricos - Semana 38', 'J6NRa9Hm-xU', NULL, NULL, NULL, NULL, NULL, NULL, 'Tallarin con chanfainita', '/B5rnyQptZZ4', NULL, NULL, NULL, '40', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (39, 'imgsandiagra.png', 'Tu bebé tiene el tamaño de una sandia grande', '50 cm', '3.100 gramos', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Molleja saltada', '3O1gomcVZUI', NULL, NULL, NULL, '40', NULL, NULL, NULL, NULL, NULL, NULL);
                INSERT INTO T_LECT_SEMANAS (nro_semana,img_bb,desc_img,altura_bb,peso_bb,tips_emb1_desc,tips_emb1_ruta,tips_emb2_desc,tips_emb2_ruta,tips_emb3_desc,tips_emb3_ruta,tips_cons1_desc,tips_cons1_ruta,tips_cons2_desc,tips_cons2_ruta,tips_nutri_desc,tips_nutri_ruta,video_premio_desc,video_premio_ruta,video_premio_codigoid,video_group,video_free1_desc,video_free1_ruta,video_free2_desc,video_free2_ruta,video_free3_desc,video_free3_ruta) VALUES (40, 'imgmacre.png', 'Tu bebé tiene el tamaño de un zapallo macre ', '5 1- 52 cm', '3,200 a 3,400 gramos', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cau cau', 'JpzCQWOkcfA', 'Lactancia', 'https://youtu.be/-l1EakigHiU', '-l1EakigHiU', '40', NULL, NULL, NULL, NULL, NULL, NULL);                        
            `);

          await db.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS T_LECT_EESS (
            id_eess INTEGER NOT NULL PRIMARY KEY,
            nombre_eess VARCHAR(100),
            dir_eess VARCHAR(200),
            img_eess VARCHAR(100),
            gps_lat VARCHAR(100),
            gps_lon VARCHAR(100),
            telf VARCHAR(50),
            distrito VARCHAR(100),
            provincia VARCHAR(100),
            departamento VARCHAR(100),
            institucion VARCHAR(100),
            tipo VARCHAR(100)
            );
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CONDE DE LA VEGA BAJA','Jirón Jr. Conde De La Vega Baja 488','eess_default.png','-12.039118','-77.05043753','(51) 1-7435835','Lima','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HORACIO ZEVALLOS','Avenida J. Zubieta S/N - Aa.Hh Horacio Zevallos N° S/N','eess_default.png','-12.01905526','-76.83841569','3592250','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('JORGE LINGAN','Jirón Jr Los Alhelies S/N - 1Er Sector El Progreso S/N Jr Los Alhelies S/N - 1Er Sector El Progreso Carabayllo Lima Lima ','eess_default.png','-11.8839462','-77.0201549','5473685','Carabayllo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD TUPAC AMARU DE VILLA','Avenida Av. Túpac Amaru Mz. E,Lt.1 ','eess_default.png','-12.1936588','-76.9819614','971063942','Chorrillos','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SANTA ISABEL DE VILLA','Avenida Av. Independencia S/N.Aahh Santa Isabel De Villa N° S/N ','eess_default.png','-12.2005471','-76.9780982','1-7639921','Chorrillos','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD GUSTAVO LANATTA LUJAN','Avenida Av. Defensores Del Morro (Ex Huaylas) Nº556 Av. Defensores Del Morro (Ex Huaylas) Nº556 Chorrillos Lima Lima ','eess_default.png','-12.1692159','-77.0240399','01-2515217','Chorrillos','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO WIÑAY','Jirón Abraham Valdelomar Sn La Pascana Entre La Capilla San Jose Y Parque Modulo La Pascana Comas Lima Lima ','eess_default.png','-11.934511','-77.0456523','015397300','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ANCIETA BAJA','Agrupacion Familiar Los Jardines - Ex Ancieta Baja - Mz G Lote 4 - El Agustino ','eess_default.png','-12.0318744','-77.007416','3853270','El Agustino','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MADRE TERESA  CALCUTA','Avenida Av. Inca Ripac N° 229 ( Alt. 8 Y 9 De Riva Agüero) ','eess_default.png','-12.0511536','-77.0049229','743-9889 ANEXO 3510','El Agustino','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD JOSE OLAYA','Avenida Av 4 De Noviembre S/N,Aahh Jose Olaya - Urb Payet S/N Av 4 De Noviembre S/N,Aahh Jose Olaya - Urb Payet Independencia Lima Lima ','eess_default.png','-11.9674879','-77.03903164','5507215','Independencia','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL DE EMERGENCIAS PEDIATRICAS','Avenida Av Grau 854 - Prolong Jr Huamanga 147 ','eess_default.png','-12.0581708','-77.0217293','2158838; 4749790','La Victoria','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion Especializada');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO MUNICIPAL','Avenida Mariscal Jose La Mar N° 641 ','eess_default.png','-12.0734497','-77.0162899','902062261','La Victoria','Lima','Lima','Municipalidad Distrital','Consultorios Medicos Y De Profesionales De La Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN COSME','Avenida Av. Bauzate Y Meza - Altura De La Cuadra 23 ','eess_default.png','-12.0619424','-77.0067738','01 7435835 ANEXO 311','La Victoria','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POSTA MÉDICA CONSTRUCCIÓN CIVIL','Prolongación Prolongación Cangallo N° 670 ','eess_default.png','-12.0550758','-77.0241856','01-4744389','La Victoria','Lima','Lima','Essalud','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE ATENCION PRIMARIA III ALFREDO PIAZZA ROBERTS-GSPN I Y II-RPA-ESSALUD','Calle Calle Las Lilas 223 San Eugenio -Lince ','eess_default.png','-12.086601','-77.0275266','051-5727941','Lince','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('QHALIKAY (SALUD )','Avenida Zaragosa O-4 22 Pro Los Olivos Lima Lima ','eess_default.png','-11.9430855','-77.0745647','987864278','Los Olivos','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAGRADO CORAZÓN DE JESÚS','Plaza Plaza Civica S/N - Proyecto Integral Cueto Fernandini,3Era Etapa N° S/N ','eess_default.png','-11.9821913','-77.0762076','5239958','Los Olivos','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MOYOPAMPA','Avenida Av.Independencia S/N Cra.5-Aahh. Moyopampa Numero S/N ','eess_default.png','-11.9246888','-76.6847591','7439889 ANEXO 4700','Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('NICOLAS DE PIEROLA','Simon Bolivar Nº 194 Ah Nicolas De Pierola I Zona ','eess_default.png','-11.941713','-76.709975','3603167','Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD CLAS VILLA LIBERTAD','Jirón Huanuco N° S/N ','eess_default.png','-12.2436799','-76.874717','1-2311798,999608015','Lurin','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL VICTOR LARCO HERRERA','Avenida Av.Augusto Perez Aranibar N° 600 ','eess_default.png','-12.098705','-77.065756','2615516','Magdalena Del Mar','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion Especializada');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL CARLOS LANFRANCO LA HOZ','Avenida Av. Saenz Peña - Cuadra 6 S/N S/N Av. Saenz Peña - Cuadra 6 S/N Puente Piedra Lima Lima ','eess_default.png','-11.8631805','-77.079335','01548-2010; 5485334;','Puente Piedra','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL LOS SUREÑOS','Coop.  Vivienda Los Sureños Mz M Lt. 35 ','eess_default.png','-11.8875316','-77.0697014','1-527-1686','Puente Piedra','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN JUAN DE AMANCAES','Aahh San Juan De Amancaes 2Da Zona ','eess_default.png','-12.0168446','-77.0294195','(01) 3819931','Rimac','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO SAN BORJA','Avenida Malachowsky 520 San Borja Lima Lima ','eess_default.png','-12.1088001','-77.0064707','997748397','San Borja','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE ATENCION PRIMARIA-CAP III SAN ISIDRO-ESSALUD','Avenida Av. Perez Aranibar 1551 ','eess_default.png','-12.1083451','-77.053404','4217702','San Isidro','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CAMPOY','Avenida Av. Principal Mz. G Lte. 2-Coop.El Valle Av. Principal Mz. G Lte. 2-Coop.El Valle San Juan De Lurigancho Lima Lima ','eess_default.png','-12.0212961','-76.9601533','3861645','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SAN FERNANDO','Jirón Jr.Las Ortigas 1893 Urb.San Hilarion-Altura Pdo.13 Av. Las Flores Jr.Las Ortigas 1893 Urb.San Hilarion-Altura Pdo.13 Av. Las Flores San Juan De Lurigancho Lima Lima ','eess_default.png','-12.0024575','-77.0105584','4584806','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO NUEVO PERU','Calle Mz E Lote 01 Pueblo Joven Nuevo Peru Manzana E Lote 01 Urbanización Mz E Lote 01 Pueblo Joven Nuevo Peru ','eess_default.png','-12.0027539','-77.0177604','949898207','San Juan De Lurigancho','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('DANIEL ALCIDES CARRION','Jirón Jr. Alfonso Ugarte,Cuadra 3 S/N Cooperativa Daniel Alcides Carrion S/N Jr. Alfonso Ugarte,Cuadra 3 S/N Cooperativa Daniel Alcides Carrion San Juan De Lurigancho Lima Lima ','eess_default.png','-12.0232824','-76.976931','3861646','San Juan De Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO 12 DE NOVIEMBRE','Avenida Las Americas Piso 2 S/N San Juan De Miraflores Lima Lima ','eess_default.png','-12.1376019','-76.96831382','4506060','San Juan De Miraflores','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL DE ESPECIALIDADES QUIRURGICAS CANTA CALLAO','Urbanización Los Huertos De Naranjal Manzana C Lote 4 ','eess_default.png','-11.96990242','-77.08505026','945918707','San Martin De Porres','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion Especializada');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL NACIONAL CAYETANO HEREDIA','Avenida Av. Honorio Delgado 262 Urb. Ingenieria ','eess_default.png','-12.0220216','-77.0544967','4820402','San Martin De Porres','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion Especializada');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD  CERRO CANDELA','Avenida Av Felipe De Las Casas Mz B1 Lt 9 - Aahh Cerro Candela ','eess_default.png','-11.972234','-77.106448','959727577','San Martin De Porres','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SANTA ROSA DE QUIVES','Calle Calle Los Cactus Mz.W1 Lt. 43 Coop. Sta. Rosa De Quives Calle Los Cactus Mz.W1 Lt. 43 Coop. Sta. Rosa De Quives Santa Anita Lima Lima ','eess_default.png','-12.0537232','-76.9822607','3620504','Santa Anita','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SAN CARLOS','Avenida Av.Metropolitana Mz B Lt.7B Asoc. Pro-Viv San Carlos-Santa Anita ','eess_default.png','-12.0395799','-76.9582773','3541738','Santa Anita','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN ATANACIO DE PEDREGAL','Avenida Av Sauce Mz A1 Lote 1 Av Sauce Mz A1 Lote 1 Surquillo Lima Lima ','eess_default.png','-12.1212565','-76.9990462','(51) 1-4493449','Surquillo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD EDILBERTO RAMOS','Avenida Av. Tahuantinsuyo Mz U S/N Sector 10 Aa.Hh. Edilberto Ramos S/N Av. Tahuantinsuyo Mz U S/N Sector 10 Aa.Hh. Edilberto Ramos Villa El Salvador Lima Lima ','eess_default.png','-12.209316','-76.9351638','013927171','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD VIRGEN DE LA ASUNCION','Sector 3 Grupo 3 Manzana P-1 Lote 4 B ','eess_default.png','-12.2174846','-76.9292778','994759330','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE ATENCION DEL ADULTO MAYOR TAYTA WASI','Avenida Av. Primavera Cruze Con Calle Sucre S/N Ppjj Jose Carlos Mariategui N° S/N ','eess_default.png','-12.1416948','-76.9497515','01-42217389','Villa Maria Del Triunfo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('TELEMINSA','Avenida Arequipa Numero 820 Piso 1 ','eess_default.png','-12.0727243','-77.0364541','947 910 913','Lima','Lima','Lima','Minsa','Consultorios Medicos Y De Profesionales De La Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL II RAMON CASTILLA','Jirón Jirón Guillermo Dansey Nº 390 ','eess_default.png','-12.0443408','-77.0440331','01-5282970,5401','Lima','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MICAELA BASTIDAS','Parque Mza. V- Aahh M. Bastidas - Parque Central Mza. V- Aahh M. Bastidas - Parque Central Ate Lima Lima ','eess_default.png','-12.04457','-76.931598','(51) 1-3516107','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('EL BOSQUE','Pj 3 De Mayo 140 -Mz.B Lote 12- Urb. El Bosque ','eess_default.png','-12.063413','-76.987062','3265005','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD LA FLOR','Jirón Jr. Puno S/N Esq. Con Jr. 25 De Febrero S/N N° S/N ','eess_default.png','-11.8961113','-77.0271114','5432209','Carabayllo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CAP III CARABAYLLO','Jirón Moshollacta Y Diego Bermejo N° 184 ','eess_default.png','-11.8967637','-77.0383869','5433333','Carabayllo','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PROGRESO','Avenida Av.Atahualpa Nº 373-Cultura Y Progreso Ñaña-Chaclacayo ','eess_default.png','-11.9863974','-76.8198403','(51) 01 3590048','Chaclacayo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('NUEVA GALES','Avenida Av 2 De Junio Sn Mz C2 Lote 6 Asociación Nueva Gales ','eess_default.png','-12.17177308','-76.86106039','7439889 anexo 5051','Cieneguilla','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD EL ALAMO','Calle Calle G - Mz Y,Lote 1 - Urb El Alamo 1Era Etapa Calle G - Mz Y,Lote 1 - Urb El Alamo 1Era Etapa Comas Lima Lima ','eess_default.png','-11.9347565','-77.0656999','5374499','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CATALINA HUANCA','Calle Calle Gonzáles De Fanning 180 ( Cerca Al Ce 076)El Agustino ','eess_default.png','-12.0512135','-76.9954453','3270971','El Agustino','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MUNISALUD','Avenida Tupac Amaru Km 4.5 Piso 1 ','eess_default.png','-11.9970501','-77.0545257','992546969','Independencia','Lima','Lima','Municipalidad Distrital','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('TUPAC AMARU','Jirón Jr Cajabamba S/N,3Era Cuadra - Urb Popular Tupac Amaru S/N Jr Cajabamba S/N,3Era Cuadra - Urb Popular Tupac Amaru Independencia Lima Lima ','eess_default.png','-11.9722396','-77.045511','5260465','Independencia','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('LA MOLINA','Calle El Haras S/N Cdra.4 Rinconada Baja S/N (Ref: Cost. Cuna Municipal,Esq.Manuel Prado Ugarteche ) La Molina Lima Lima ','eess_default.png','-12.07884185','-76.91693161','51-3680119','La Molina','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD LA VICTORIA','Avenida Manco Capac N° 218 ','eess_default.png','-12.0608683','-77.0297089','(51) 1-2729421','La Victoria','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CONSULTORIO ESPECIALIZADO GINEND MUJER','Jirón General Cordova N° 2006 Piso 2,Departamento 201 Manzana 20 D Lote 01 Urbanización Risso ','eess_default.png','-12.08530198','-77.03810816','999706179','Lince','Lima','Lima','Essalud','Consultorios Medicos Y De Profesionales De La Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE ATENCION PRIMARIA II LURIN','Avenida Av. Antigua Panamericana Sur Km. 36.5 ','eess_default.png','-12.27568943','-76.87133336','430-2139','Lurin','Lima','Lima','Essalud','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PSICOMENT','Avenida Simon Bolivar Numero 309 Piso 1 ','eess_default.png','-12.0736182','-77.0559697','960347156','Pueblo Libre','Lima','Lima','Minsa','Consultorios Medicos Y De Profesionales De La Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO HONORIO DELGADO','Jirón Jj Pasos N° 394 ','eess_default.png','-12.0695625','-77.0579375','013304008','Pueblo Libre','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO SANTA ROSA DE MANCHAY','Calle 20 Sector Portada De Manchay Iii Cpr Huertos De Manchay B5 03 Pachacamac Lima Lima ','eess_default.png','-12.2095337','-76.8538748','941 047 738','Pachacamac','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD HUERTOS DE MANCHAY','Mz T Lote S/N Sector Rinconada Alta S/N Mz T Lote S/N Sector Rinconada Alta Pachacamac Lima Lima ','eess_default.png','-12.1167928','-76.8701936','940010056','Pachacamac','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD PAMPA GRANDE','Avenida 07 De Junio-Cpr Pampa Grande Manzana B Lote S/N ','eess_default.png','-12.239797','-76.870792','987 696 706','Pachacamac','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD PORTADA DE MANCHAY','Calle Calle 7 Esq. Calle 4 Mz F Lt 11 Aahh Portada De Manchay ','eess_default.png','-12.088974','-76.8818267','3456410','Pachacamac','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('FRANCISCO PIZARRO','Avenida Av. Francisco Pizarro 585 ','eess_default.png','-12.0370175','-77.0351271','5313529','Rimac','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('INSTITUTO NACIONAL DE SALUD NIÑO SAN BORJA','Avenida Av La Rosa Toro 1250 Urb Jacaranda Ii ','eess_default.png','-12.0853791','-76.9919372','(01) 2300600','San Borja','Lima','Lima','Minsa','Institutos De Salud Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD GANIMEDES','Avenida El Sol Mz J S/N - Urb. Ganimedes S/N San Juan De Lurigancho Lima Lima ','eess_default.png','-11.9831399','-77.0114007','3872790','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SAN FRANCISCO DE LA CRUZ','Prolongación Canevaro,San Francisco De La Cruz-Pamplona Alta N° S/N ','eess_default.png','-12.1516414','-76.9633651','01-2854219','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SANTA URSULA','Calle Calle Santa Teresa Mz G Lote 17 S/N Cooperativa Santa Ursula N° S/N ','eess_default.png','-12.1809882','-76.9638798','994390322','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD EL BRILLANTE','Prolongación Prolongacion Av. San Juan Con Avda Defensores De Lima S/N Pamplona Alta S/N Prolongacion Av. San Juan Con Avda Defensores De Lima S/N Pamplona Alta San Juan De Miraflores Lima Lima ','eess_default.png','-12.1480219','-76.9691391','01-2674570','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL MARIA AUXILIADORA','Calle Calle Miguel Iglesias N°968 Calle Miguel Iglesias N°968 San Juan De Miraflores Lima Lima ','eess_default.png','-12.1605768','-76.9591024','01-2171818','San Juan De Miraflores','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('LOS LIBERTADORES','Avenida Av Libertador Don Jose De San Martin Nº 1055 - Asoc. De Vivienda Los Libertadores ','eess_default.png','-12.006979','-77.0890663','5312313','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN MARTIN DE PORRES','Calle Calle Los Bomberos S/N St. 2 Gr. 15 S/N Calle Los Bomberos S/N St. 2 Gr. 15 Villa El Salvador Lima Lima ','eess_default.png','-12.2120117','-76.9391561','4930660','Villa El Salvador','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL DE EMERGENCIAS VILLA EL SALVADOR','Avenida Pastor Sevilla N° 000 ','eess_default.png','-12.2326004','-76.9336669','(51) 1 -6409875','Villa El Salvador','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD FERNANDO LUYO SIERRA','Sector 7 Grupo 1  S/N N° S/N ','eess_default.png','-12.2289028','-76.9425767','01-2597924','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL VILLA MARIA DEL TRIUNFO','Avenida Av. Pedro Valle S/N (Altura Cuadra 18 Av.El Triunfo) S/N Av. Pedro Valle S/N (Altura Cuadra 18 Av.El Triunfo) Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.1569104','-76.9365017','01-5933900','Villa Maria Del Triunfo','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD BUENOS AIRES','Buenos Aires S/N San Gabriel Bajo N° S/N ','eess_default.png','-12.1477625','-76.9550396','2672698','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD JUAN CARLOS SOBERON','Prolongación Jose Carlos Mariategui Mz 6 Lote 18 Aahh Virgen De La Candelaria Prolongacion Jose Carlos Mariategui Mz 6 Lote 18 Aahh Virgen De La Candelaria Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.163089','-76.929749','992424518','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('INSTITUTO NACIONAL DE SALUD DEL NIÑO','Avenida Av. Brasil Nº 600 ','eess_default.png','-12.0654786','-77.0459873','(51) 330-0066','Breña','Lima','Lima','Minsa','Institutos De Salud Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('INSTITUTO NACIONAL DE REHABILITACION DRA. ADRIANA REBAZA FLORES - AMISTAD PERU-JAPON','Avenida Prolongación Defensores Del Morro Cuadra 2 S/N Chorrillos Lima Lima ','eess_default.png','-12.1919375','-77.0031875','01-7173200','Chorrillos','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion Especializada');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO JUAN JOSE RODRIGUEZ LAZO','Avenida Av.Guardia Peruana Cuadra 8 S/N Chorrillos N° S/N ','eess_default.png','-12.17834115','-77.00451255','01-4671453','Chorrillos','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HUSARES DE JUNIN','Jirón Jr Husares De Junin S/N - Urb Huaquillay 2Da Etapa S/N Jr Husares De Junin S/N - Urb Huaquillay 2Da Etapa Comas Lima Lima ','eess_default.png','-11.9361947','-77.0518657','5363998','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('KAWSAY ( VIDA )','Calle 7 ','eess_default.png','-11.9775316','-77.051748','990532852','Independencia','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD LOS QUECHUAS','Jirón Jr Los Quechuas Cuadra 2 S/N - 3Er Sector Independencia S/N Jr Los Quechuas Cuadra 2 S/N - 3Er Sector Independencia Independencia Lima Lima ','eess_default.png','-11.99041254','-77.04242329','5218760','Independencia','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MAX ARIAS SCHREIBER','Jirón Jr. Antonio Raymondi 220 Primer Piso Jr. Antonio Raymondi 220 Primer Piso La Victoria Lima Lima ','eess_default.png','-12.0608274','-77.03213','4234865 / 4336213','La Victoria','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ALTO HUAMPANI','Avenida Av.Grau Mz. X,Lote A-C - I Zona Aahh Alto Huampani ','eess_default.png','-11.970689','-76.76848','7439889 ANEXO 4651','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('NIEVERIA DEL PARAISO','Ex Fundo Agricola Nieveria Lote 62-B Lt.1 ','eess_default.png','-11.976816','-76.907971','(51)7173749','Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD CLAS JUAN PABLO II','Manzana K8 Lote 5B,Sector Los Jardines Huertos De Manchay ','eess_default.png','-12.1096968','-76.8624313','01-3574260','Pachacamac','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('P.S. MANCHAY ALTO','Avenida Av Las Casuarinas  Mz E Lt 18 Centro Poblado Rural Manchay Alto ','eess_default.png','-12.1590087','-76.8540268','991664120','Pachacamac','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD BENJAMIN DOIG','Aahh Benjamin Doig Lossio Mz 21 Lt 13 ','eess_default.png','-12.4699143','-76.7507301','013675013','Pucusana','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('JESUS OROPEZA CHONTA','Calle Calle 2 - Mz. E,Lote 9-10 - Aa.Hh. Jesús Oropeza Chonta Calle 2 - Mz. E,Lote 9-10 - Aa.Hh. Jesús Oropeza Chonta Puente Piedra Lima Lima ','eess_default.png','-11.8261347','-77.1123214','5501044','Puente Piedra','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD PUNTA NEGRA','Avenida Av Guayanay Norte - Zona Central Mz  H-1 Lt 6 Av Guayanay Norte - Zona Central Mz  H-1 Lt 6 Punta Negra Lima Lima ','eess_default.png','-12.365408','-76.796185','01-2315156','Punta Negra','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO S. ESPECIALIZ. VACUNACION INTERNACION','Avenida Av Del Ejercito Cuadra 17 ','eess_default.png','-12.1068956','-77.0547621','2646889','San Isidro','Lima','Lima','Minsa','Centros De Vacunacion');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN ISIDRO','Avenida Av. Perez Aranibar (Del Ejército) 1756 ','eess_default.png','-12.1067332','-77.0549116','(51) 1-2643125','San Isidro','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD JOSE CARLOS MARIATEGUI','Jirón Jr. El Cruce Mz. H S/N Aahh Jose Carlos Mariategui N° S/N ','eess_default.png','-11.9450035','-76.9843804','(51) 1-3930646','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL TRABAJADORES HOSPITAL DEL NIÑO','Avenida Av. Republica De Polonia 1504 ','eess_default.png','-11.958086','-76.990394','01 3870490','San Juan De Lurigancho','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('LA LIBERTAD','Jirón Jr. Margaritas 1545  - Urb. Inca Manco Capac ','eess_default.png','-12.0041291','-76.9955817','4584186','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL MANUEL BARRETO','Jirón Manuel Barreto S/N,Cdra. 2,Zona K,Ciudad De Dios ','eess_default.png','-12.1522561','-76.9684425','(51) 1-4663649','San Juan De Miraflores','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD CONDEVILLA','Jirón Jr Jose Maria Cordova 3397 - Urb Condevilla ','eess_default.png','-12.021281','-77.0814067','5861853','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SAN ROQUE','Esteban Camere 378 - Urb San Roque Sn Santiago De Surco Lima Lima ','eess_default.png','-12.1491162','-76.9888038','988889545','Santiago De Surco','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MATERNO INFANTIL SURQUILLO','Jirón Jr. Narciso De La Colina 840 ','eess_default.png','-12.1182384','-77.022067','445-0089','Surquillo','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ULDARICO ROCCA FERNANDEZ','Avenida Av.Separadora Industrial Y Av. Cesar Vallejo ','eess_default.png','-12.2107672','-76.9319845','2875266','Villa El Salvador','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD VILLA MARÍA DEL TRIUNFO','Avenida Av. Salvador Allende Cuadra 16 S/N N° S/N ','eess_default.png','-12.171643','-76.9456715','(51) 1 - 2960128','Villa Maria Del Triunfo','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD MICAELA BASTIDAS','Jirón Jr. Jose Olaya S/N S/N Jr. Jose Olaya S/N Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.1726057','-76.950034','945241719','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SOLIDARIDAD CAMANA','Jirón Jr. Camana 700 ','eess_default.png','-12.0493589','-77.035362','4264619','Lima','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD RESCATE','Jirón Jr Pratt S/N Aahh 11 De Octubre N° S/N ','eess_default.png','-12.0411673','-77.0623558','3366430','Lima','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO SANTA ROSA DE HUAYCAN','Avenida 15 De Julio Zona D,Lote 24 Lote 24 Urbanización Acv Huaycan ','eess_default.png','-12.01673871','-76.82504094','(01) 768-1973','Ate','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('FRATERNIDAD NIÑO JESUS ZONA X','Ucv 236 Zona X Huaycan ','eess_default.png','-12.0315691','-76.8191242','357 – 7586','Ate','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SAN ANTONIO','Calle Calle 7 Esq.Calle 8 S/N - Asoc. Pobladores San Antonio N° S/N ','eess_default.png','-12.0294635','-76.9063862','7439889 ANEXO 4160','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD MATEO PUMACAHUA','Avenida Av. Mateo Pumacahua Mz T S/N Lote 37 Sector 01 N° S/N ','eess_default.png','-12.1886598','-76.9801201','01-5761809','Chorrillos','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL BUENOS AIRES DE VILLA','Avenida Av. Buenos Aires De Villa S/N. N° S/N ','eess_default.png','-12.1887664','-77.0048744','2583948','Chorrillos','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO NANCY REYES BAHAMONDE','Calle San Rodolfo Piso 1 441 Chorrillos Lima Lima ','eess_default.png','-12.19191626','-77.00966007','987768418','Chorrillos','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SAN CARLOS','Jirón Jr. San Mateo Cuadra 3 S/N - Asociacion San Carlos S/N Jr. San Mateo Cuadra 3 S/N - Asociacion San Carlos Comas Lima Lima ','eess_default.png','-11.9086992','-77.041319','5434891','Comas','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CARLOS PHILLIPS','Calle Calle Brasilia Cuadra 1 S/N - Urb El Parral S/N Calle Brasilia Cuadra 1 S/N - Urb El Parral Comas Lima Lima ','eess_default.png','-11.959672','-77.057458','5250769','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('VICTOR RAUL HAYA DE LA TORRE','Calle Calle A Mz 2 Lote 3 - Asoc Viv Victor Raul Haya De La Torre Calle A Mz 2 Lote 3 - Asoc Viv Victor Raul Haya De La Torre Independencia Lima Lima ','eess_default.png','-11.97752131','-77.05723162','2011340 ( 147)','Independencia','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO NACIONAL DE TELEMEDICINA- CENATE','Jirón Domingo Cueto N° 120 Piso 3 ','eess_default.png','-12.0796889','-77.03692643','2656000','Jesus Maria','Lima','Lima','Essalud','Consultorios Medicos Y De Profesionales De La Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MATAZANGO','Calle Camino Real Mz.R S/N Aahh Matazango S/N La Molina Lima Lima ','eess_default.png','-12.0699668','-76.9680629','7439889 anexo 4330','La Molina','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD CARDAL','Centro Poblado Rural Cardal - Pachacamac Centro Poblado Rural Cardal - Pachacamac Pachacamac Lima Lima ','eess_default.png','-12.1811992','-76.8510552','996055626','Pachacamac','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SAGRADO CORAZON DE JESUS','Avenida Av Independencia S/N - Aahh Las Animas N° S/N ','eess_default.png','-11.90822214','-77.07789023','7174945','Puente Piedra','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD AMANCAES','Avenida Prolongación Flor De Amancaes  S/N N° S/N ','eess_default.png','-12.01787727','-77.02879227','(51) 1-2642222','Rimac','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO SAMAY','Calle Virreyes 205 El Manzano Veterinaria Municipal Del Rimac Rimac Lima Lima ','eess_default.png','-12.02941578','-77.02954497','955536706','Rimac','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CIUDAD Y CAMPO','Jirón Jr. Jacinto Benavente Nº 264 - Asociacion Ciudad Y Campo Jr. Jacinto Benavente Nº 264 - Asociacion Ciudad Y Campo Rimac Lima Lima ','eess_default.png','-12.0243191','-77.0282412','3821439','Rimac','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD SAN JUAN DE LURIGANCHO','Avenida Av. Proceres De La Independencia S/N (Dentro Del Parque Zonal Huiracocha) N° S/N ','eess_default.png','-12.0085642','-77.0035429','1-2531186','San Juan De Lurigancho','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL AURELIO DIAZ UFANO Y PERAL','Calle Calle Majes S/N G-11 - Urb. Los Pinos N° S/N ','eess_default.png','-11.9684779','-76.9955667','01-5313469','San Juan De Lurigancho','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('JAIME ZUBIETA','Jirón Jr.Cocharcas Mz. A Lt. 1 - Anexo Mz. K-15,Lote 46 Aahh Jaime Zubieta Jr.Cocharcas Mz. A Lt. 1 - Anexo Mz. K-15,Lote 46 Aahh Jaime Zubieta San Juan De Lurigancho Lima Lima ','eess_default.png','-11.9634978','-76.9888954','3877589','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD BAYOVAR','Avenida Av. 1Ero De Mayo 3Ra Etapa - Aahh Bayovar ','eess_default.png','-11.9521131','-76.9913771','01 7435835 / 3052','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MEXICO','Avenida Av  Diez Canseco Nº 3613 - Urb Condevilla Av  Diez Canseco Nº 3613 - Urb Condevilla San Martin De Porres Lima Lima ','eess_default.png','-11.9814397','-77.0969718','934952104','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SANTIAGO DE SURCO','Jirón Daniel Cornejo N° 182 ','eess_default.png','-12.1473252','-77.0061782','2479043','Santiago De Surco','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD NUEVA ESPERANZA ALTA','Avenida Av. R. Merino Y Tacna Mz 9 Lt 1B Comite 8B Nueva Esperanza Alta ','eess_default.png','-12.1792745','-76.9365452','01-2914478','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD VILLA LIMATAMBO','Mz J1 Lote 2 Aahh Villa Limatambo Mz J1 Lote 2 Aahh Villa Limatambo Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.1345619','-76.9421011','01-2831355','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD MODULO I','Prolongación Prolongacion Lucanas S/N Paradero 12 S/N Prolongacion Lucanas S/N Paradero 12 Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.2245692','-76.9111104','(51) 1-2801351','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('INSTITUTO NACIONAL MATERNO PERINATAL','Jirón Jr. Antonio Miroquesada Nº 941 ','eess_default.png','-12.0529163','-77.0221718','3280988','Lima','Lima','Lima','Minsa','Institutos De Salud Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MATERNO INFANTIL ANCON','Jirón Jr. Loa 595 Ancon Jr. Loa 595 Ancon Ancon Lima Lima ','eess_default.png','-11.77452348','-77.17275823','01-5244151','Ancon','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL DE HUAYCAN','Avenida José C.Mariátegui S/N Zona B - A.H.Huaycán S/N Ate Lima Lima ','eess_default.png','-12.0158889','-76.8201183','3716797','Ate','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('RAUL PORRAS BARRENECHEA','Jirón Jr Arequipa 4Ta Cuadra S/N  - Mz 40 Lote 17,Pj Raul Porras Barrenechea S/N Jr Arequipa 4Ta Cuadra S/N  - Mz 40 Lote 17,Pj Raul Porras Barrenechea Carabayllo Lima Lima ','eess_default.png','-11.8934379','-77.0244019','5430940','Carabayllo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HUAYCAN DE CIENEGUILLA','Centro Poblado Huaycan Mz D,Lote 7 - Cpr Autog.Huaycan Cieneguilla ','eess_default.png','-12.12053123','-76.81454499','7439889 anexo: 4450','Cieneguilla','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('TAMBO VIEJO','Avenida Manco Capac S/N - Zona A - Tambo Viejo-Cieneguilla S/N Cieneguilla Lima Lima ','eess_default.png','-12.1110471','-76.8182673','7439889 anexo 4460','Cieneguilla','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SEÑOR DE LOS MILAGROS','Avenida Av 3 De Octubre Cuadra 4 - Villa Señor De Los Milagros ','eess_default.png','-11.9415104','-77.0452168','5410418','Comas','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL SERGIO E. BERNALES','Avenida Av. Tupac Amaru Km. 14.5 Av. Tupac Amaru Km. 14.5 Comas Lima Lima ','eess_default.png','-11.9138337','-77.0395181','1-5580186','Comas','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CARMEN MEDIO','Jirón Jr. Cahuide S/N Cdra 8 Carmen Medio S/N Jr. Cahuide S/N Cdra 8 Carmen Medio Comas Lima Lima ','eess_default.png','-11.9412286','-77.0401638','5411225','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CAP III EL AGUSTNO-RAA-ESSALUD','Jirón Renan Elias Olivera  145 - Urbanización Popular El Agustino,Mz A,Lote 27 Y Anexo Jirón Polo Jimenez S/N ','eess_default.png','-12.0466731','-76.9990806','5313960','El Agustino','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('INSTITUTO NACIONAL CARDIOVASCULAR CARLOS ALBERTO PESCHIERA CARRILLO – INCOR –ESSALUD','Jirón Jiron Coronel Félix Zegarra Nº.S 397-417-455-465-491-495 ','eess_default.png','-12.0768185','-77.0398868','01-4111560','Jesus Maria','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion Especializada');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PORTADA DEL SOL','Avenida Principal S/N Mz. E- 6 Lt. 3 - 2Da Etapa Urb. Portada Del Sol N° S/N ','eess_default.png','-12.110166','-76.938111','(51) 1-3654263','La Molina','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('EL PORVENIR','Jirón Jr. Sebastián Barranca 977 Jr. Sebastián Barranca 977 La Victoria Lima Lima ','eess_default.png','-12.0676604','-77.0209069','4731100','La Victoria','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL MUNICIPAL LOS OLIVOS','Avenida Av Naranjal 318 Los Olivos Av Naranjal 318 Los Olivos Los Olivos Lima Lima ','eess_default.png','-11.97723','-77.0656159','(51) 1-7485858','Los Olivos','Lima','Lima','Municipalidad Distrital','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('VILLA LETICIA DE CAJAMARQUILLA','Aahh Pampa Los Olivares-Villa Leticia-Mz K1 Lote 9-12 ','eess_default.png','-11.9662957','-76.8833177','7173836','Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO SANTA CRUZ','Avenida Av. Mariscal La Mar 1390 Urb. Santa Cruz N° 1390 Urbanización Santa Cruz ','eess_default.png','-12.109051','-77.0498521','01-2216698','Miraflores','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO LA MEDALLA MILAGROSA','Jirón 12 De Julio Sector 24 De Junio Collanac Pachacamac Lima Lima ','eess_default.png','-12.1281459','-76.87121249','913593975','Pachacamac','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD TAMBO INGA','Avenida Av Victor Malasquez Centro Poblado Rural Tambo Inga - Pachacamac Av Victor Malasquez Centro Poblado Rural Tambo Inga - Pachacamac Pachacamac Lima Lima ','eess_default.png','-12.14736265','-76.84104748','994937167','Pachacamac','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD PACHACAMAC','Avenida Av. Colonial S/N Y Esq. Castilla S/N Av. Colonial S/N Y Esq. Castilla Pachacamac Lima Lima ','eess_default.png','-12.2282504','-76.8581836','+51996487811','Pachacamac','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('JERUSALEN','Avenida Av. San Juan S/N - Aa.Hh. Jerusalen N° S/N ','eess_default.png','-11.8279251','-77.1174256','5569230','Puente Piedra','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL JUAN PABLO II','Calle 16 N° S/N ','eess_default.png','-11.98072274','-76.98412977','(51) 1-3883932','San Juan De Lurigancho','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD ZARATE','Jirón Jr.Los Chasquis Con Yupanquis (Anexo Av. Los Amautas Nº 835) ','eess_default.png','-12.023286','-76.994517','4598400','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('METROPOLITANA','Avenida Av. Los Ruiseñores 873-A Urb.Santa Anita ','eess_default.png','-12.0466129','-76.968737','3625135','Santa Anita','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PROFAM','Avenida Av. Santa Rosa,Manzana O-2 / Asociacion De Vivienda Profam-Peru Av. Santa Rosa,Manzana O-2 / Asociacion De Vivienda Profam-Peru Santa Rosa Lima Lima ','eess_default.png','-11.82039432','-77.1645181','946693542','Santa Rosa','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD LAS FLORES','Calle Ferreñafe 220 - 2Da Cuadra El Polo Urb. Las Flores - Monterrico Santiago De Surco Lima Lima ','eess_default.png','-12.1077139','-76.9749463','962504026','Santiago De Surco','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO PROCERES','Alameda Manuel Perez Tudela Block "D" "B" ','eess_default.png','-12.1507658','-76.9886831','2743391','Santiago De Surco','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD "SEÑOR DE LOS MILAGROS"','St. 1 Gr. 25 Mz D1 Lote 2 ','eess_default.png','-12.202803','-76.951638','01-5607513','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL CESAR LOPEZ SILVA','Sector Iv Mz B1 Lt S/N 1Ra. Etapa Urb.Pachacamac Numero S/N ','eess_default.png','-12.2301776','-76.923745','01-2687738','Villa El Salvador','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD NUEVO PROGRESO','Pueblo Joven Nuevo Progreso Sector I Pueblo Joven Nuevo Progreso Sector I Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.2210199','-76.92037','(51) 1-2931995','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MIRONES','Avenida Luis Brayle Numero 13 ','eess_default.png','-12.0509882','-77.0673543','4253590','Lima','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL DE EMERGENCIAS GRAU','Avenida Avenida Grau N° 351 ','eess_default.png','-12.0589571','-77.0312779','01-5728800','Lima','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD PALERMO','Avenida Mz L Lote 20 Aahh 1° De Setiembre Alt Cuadra 21 Av Materiales ','eess_default.png','-12.0410293','-77.0688186','3366341 - 3672575','Lima','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL EMERGENCIA ATE VITARTE','Avenida Jose Carlos Mariategui 364 A Una Cuadra De La Municipalidad De Ate Ate Lima Lima ','eess_default.png','-12.0104468','-76.8290986','014172923','Ate','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CAP III HUAYCAN-GRPA-ESSALUD','Avenida Av. J.C. Mariategui,Mz. C,Lote 49-50 - Urb. Lucumo,Pariachi ','eess_default.png','-12.009876','-76.8299031','015313976 ANEXO 1635','Ate','Lima','Lima','Essalud','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD ALICIA LASTRES DE LA TORRE','Martínez De Pinillos 124 A Barranco Lima Lima ','eess_default.png','-12.1445771','-77.0224199','012488151','Barranco','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD CHACRA COLORADA','Jirón Jr. Carhuaz 509 Jr. Carhuaz 509 Breña Lima Lima ','eess_default.png','-12.0539769','-77.0480938','(51) 1-7435835','Breña','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISTEMA METROPOLITANO DE LA SOLIDARIDAD CARABAYLLO','Avenida Av San Martin Cuadra Dos S/N Carabayllo N° S/N ','eess_default.png','-11.901217','-77.034336','(51) 1-5433444','Carabayllo','Lima','Lima','Municipalidad,Provincial','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CESAR LOPEZ SILVA','Carretera Las Retamas 300 - Carretera Central Km. 23 ','eess_default.png','-11.97466304','-76.76043017','3582258','Chaclacayo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('Policlinico de Complejidad Creciente El Retablo - Comas','Jirón Jose Maria Pagador N° 137 Urbanización Santa Luzmila ','eess_default.png','-11.95156344','-77.05932385','966716179','Comas','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL LAURA RODRIGUEZ DULANTO DUKSIL','Calle Calle 30 N° 150 (Antes Mz R1 Lote 2- Parcela A) Urb. El Pinar Calle 30 N° 150 (Antes Mz R1 Lote 2- Parcela A) Urb. El Pinar Comas Lima Lima ','eess_default.png','-11.9160503','-77.0553621','01-5574330','Comas','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('EL AGUSTINO','Araceli Catalan - Esq. Independiente (Pie Del Cerro El Agustino) Araceli Catalan - Esq. Independiente (Pie Del Cerro El Agustino) El Agustino Lima Lima ','eess_default.png','-12.0542654','-77.0009781','(51) 1-3277843','El Agustino','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL LAS VIOLETAS','Avenida Av. Los Ficus Cuadra 3 S/N Urb. Las Violetas N° S/N ','eess_default.png','-12.00521897','-77.05255261','01-5345510','Independencia','Lima','Lima','Municipalidad,Provincial','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL NACIONAL EDGARDO REBAGLIATI MARTINS','Jirón Edgardo Rebagliati Numero 490 ','eess_default.png','-12.0798682','-77.0402713','01-2654952','Jesus Maria','Lima','Lima','Essalud','Institutos De Salud Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MUSA','Avenida La Molina Y Cieneguilla Mz 48 ','eess_default.png','-12.0855017','-76.887667','7439889 anexo 4370','La Molina','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO VILLASOL-UBAP LOS OLIVOS','Calle Calle. Cipriano Ruiz Mz. C Lt. 40,Urb. Parques De Villasol ','eess_default.png','-11.9665848','-77.0727503','01-6138282','Los Olivos','Lima','Lima','Municipalidad Distrital','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL LURIN','Jirón Jr. Grau Nº 370 Jr. Grau Nº 370 Lurin Lima Lima ','eess_default.png','-12.2736699','-76.8695747','4301000','Lurin','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD QUEBRADA VERDE','Avenida Av. Roque Saenz Peña Mz. I Lote 13 ','eess_default.png','-12.2103028','-76.8768251','982561343','Pachacamac','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PIEDRA LIZA','Avenida Av. Santa Rosa S/N N° S/N Interior 1 ','eess_default.png','-12.0325307','-77.0129107','4819920','Rimac','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CAQUETA','Avenida Av. Los Proceres 1051 ','eess_default.png','-12.031063','-77.0433946','3821420','Rimac','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SANTA MARIA','Avenida Av.Heroes Del Cenepa Mz D2 - Aahh Santa Maria ','eess_default.png','-11.9653616','-76.975844','(51) 1-3895028','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SANTA ROSA DE LIMA','Avenida Lima Mz. C Lte. 21-22 - Canto Chico N° S/N ','eess_default.png','-12.0053943','-77.016424','3760431','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD LADERAS DE VILLA','Calle Manuel Iglesias Lote A.V. - 2 Ref. Calle Retama - Psje F Manuel Iglesias Lote A.V. - 2 Ref. Calle Retama - Psje F San Juan De Miraflores Lima Lima ','eess_default.png','-12.189694','-76.9574698','012927129','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD  MARIANNE PREUSS DE STARK','Calle Mz 78 Lt5 (Los Laureles) Interseccion Calle Q1 Y Calle 10 Sector Los Angeles Pamplona Alta Mz 78 Lt5 (Los Laureles) Interseccion Calle Q1 Y Calle 10 Sector Los Angeles Pamplona Alta San Juan De Miraflores Lima Lima ','eess_default.png','-12.1467868','-76.9623905','01-2851020','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD HÉROES DEL PACIFICO','Jirón Jr. 1° De Enero S/N Aahh Pacifico I Sjm S/N Jr. 1° De Enero S/N Aahh Pacifico I Sjm San Juan De Miraflores Lima Lima ','eess_default.png','-12.1729488','-76.9572858','01-4500962','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('NUEVA JERUSALEN','Mz. H Lt. 9,Asentamiento Humano Nueva Jerusalen ','eess_default.png','-11.94444191','-77.12464951','963011557','San Martin De Porres','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD DAVID TEJADA DE RIVERO','Asociación Propietariosbrisas De Santa Rosa Primera Etapa Mz M Lote 1 San Martin De Porres Lima Lima ','eess_default.png','-11.98394149','-77.10150671','(51) 1- 6803032','San Martin De Porres','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO SANTA ANITA','Avenida Maria Parado De Bellido N° 1031 Urbanización Cooperativa Universal ','eess_default.png','-12.0450347','-76.975877','(51)1-4078483','Santa Anita','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD CESAR VALLEJO','Cruce Trilce Y Comercio Par 7 Cruce Trilce Y Comercio Par 7 Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.1873045','-76.9371509','3139652','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD PARAISO ALTO','Proyecto Integral Paraíso Alto,Mz F2 ,Lote 1,Sector Paraíso Alto ','eess_default.png','-12.140445','-76.923656','998839993','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD VALLE BAJO','Calle Independencia S/N Calle Independencia Cuadra 1 S/N Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.1496926','-76.9428825','01-2835343','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD DAVID GUERRERO DUARTE','Avenida Av. Los Incas Esq. Jr. Tupac Yupanqui 2Do Sector Av. Los Incas Esq. Jr. Tupac Yupanqui 2Do Sector Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.1843658','-76.9246642','01-2951826','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO ESPECIALIZADO DE REFERENCIA DE ITSS Y VIH/SIDA RAUL PATRUCCO PUIG','Jirón Jr. Huanta 927 Jr. Huanta 927 ','eess_default.png','-12.0531204','-77.0231298','3289053','Lima','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD VILLA MARIA PERPETUO SOCORRO','Jirón Jr. Villa Maria 745 Jr. Villa Maria 745','eess_default.png','-12.0367561','-77.0598619','4337218','Lima','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD HUAYCAN','Calle Calle 11 S/N - Lote 2 - Zona H Costado Del Colegio 1255 - Huaycan N° S/N ','eess_default.png','-12.01837835','-76.81299246','(51) 1-3716497','Ate','Lima','Lima','Municipalidad,Provincial','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SANTA CLARA','Avenida Av. Estrella S/N Santa Clara Cc.Km. 12 N° S/N ','eess_default.png','-12.0162198','-76.88436','3561887','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD BREÑA','Jirón Jr. Napo 1445 Jr. Napo 1445 Breña Lima Lima ','eess_default.png','-12.0569101','-77.05366011','4230432','Breña','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL VIRGEN DEL CARMEN','Calle Calle Leopoldo Arias Nro. 200 Calle Leopoldo Arias Nro. 200 Chorrillos Lima Lima ','eess_default.png','-12.1659155','-77.0202982','01-2513635','Chorrillos','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD DEFENSORES DE LIMA','Aahh Defensores De Lima S/N,Frente A La Mz D S/N Aahh Defensores De Lima S/N,Frente A La Mz D Chorrillos Lima Lima ','eess_default.png','-12.194111','-76.9754912','01-7158608','Chorrillos','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE EMERGENCIAS SAN PEDRO DE LOS CHORRILLOS','Calle Ferrocarril N° S/N ','eess_default.png','-12.166438','-77.0235903','(51) 1-2518442','Chorrillos','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL SANTA LUZMILA II','Avenida Av. 22 De Agosto N° 1001- Urb Santa Luzmila Ii Etapa ','eess_default.png','-11.94712492','-77.05898579','01-','Comas','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD PRIMAVERA','Calle Calle 8 S/N - Esq. Mz. Q,Coop. Primavera Y Mz. Z,Los Chasquis S/N Calle 8 S/N - Esq. Mz. Q,Coop. Primavera Y Mz. Z,Los Chasquis Comas Lima Lima ','eess_default.png','-11.92321026','-77.05634961','5395007','Comas','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CARMEN ALTO','Avenida Av 3 De Octubre 1990 Aahh Carmen Alto Sn Comas Lima Lima ','eess_default.png','-11.945087','-77.0308479','5414107','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD LINCE','Jirón Jr. Manuel Candamo 495 Jr. Manuel Candamo 495 Lince Lima Lima ','eess_default.png','-12.0820795','-77.0318652','4712588','Lince','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD ENRIQUE MILLA OCHOA','Mz 124,Lt S/N - Comité 8,Aahh Enrique Milla Ochoa N° S/N ','eess_default.png','-11.9565532','-77.0822282','5444868','Los Olivos','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO LAS COLINAS','Calle Mazedonia Mz T Lote 1 Aa. Hh. Las Colinas ','eess_default.png','-11.9697941','-76.7783753','944238611','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CHACRASANA','Avenida Av.La Bajada Mz E Lote S/N - Asoc.Viv. Chacrasana N° S/N ','eess_default.png','-11.9645419','-76.7507037','3601629','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD MAGDALENA','Jirón Jr. Bolognesi 260 ','eess_default.png','-12.0925599','-77.0700289','(51) 1-2636103','Magdalena Del Mar','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO CENTRAL DE PREVENCION LARCO','Avenida Av. Jose A. Larco 670 Av. Jose A. Larco 670 Miraflores Lima Lima ','eess_default.png','-12.1241585','-77.0293361','2413142','Miraflores','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD DE PUNTA HERMOSA','Jirón Jr Pimentel Nº 248 Mz G Lt 9 ','eess_default.png','-12.3379295','-76.82609','(51) 2307054','Punta Hermosa','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SAN JUAN MASIAS','Jirón Jr De La Historia Mz C Lote 19 Aahh San Juan Masias ','eess_default.png','-12.0843101','-77.0023224','(51) 1-2248718','San Borja','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CESAR VALLEJO','Mz. P Lote Nº3 - Aahh Cesar Vallejo Mz. P Lote Nº3 - Aahh Cesar Vallejo San Juan De Lurigancho Lima Lima ','eess_default.png','-11.94722','-77.00766','3383038','San Juan De Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('COOPERATIVA UNIVERSAL','Avenida Av. J.C. Mariategui Cdra. 5 - 2Da Etapa - Espalda De Delegación Policial Av. J.C. Mariategui Cdra. 5 - 2Da Etapa - Espalda De Delegación Policial Santa Anita Lima Lima ','eess_default.png','-12.0437743','-76.9757381','743 9889 ANEXO 3710','Santa Anita','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CLINICA MUNICIPAL SANTA ANITA','Jirón Jr. San Pablo,Calle 8,S/N - Urb. Los Productores N° S/N ','eess_default.png','-12.0356084','-76.95175923','6371438','Santa Anita','Lima','Lima','Municipalidad Distrital','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD VILLA MERCEDES','Avenida Av. Manco Capac Mz H Lt 01 ','eess_default.png','-12.392389','-76.773827','998062049','Santa Maria Del Mar','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD PACHACAMAC','Avenida Av. 200 Millas Barrio 2,Sector 1,Iv Etapa-Pachacamac Av. 200 Millas Barrio 2,Sector 1,Iv Etapa-Pachacamac Villa El Salvador Lima Lima ','eess_default.png','-12.2241138','-76.9215566','2880509','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL SAN JOSE','Avenida Av. Los Ángeles S/N,Sector 1,Grupo 15 N° S/N ','eess_default.png','-12.1982974','-76.9463104','01-2920104','Villa El Salvador','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SANTA ROSA DE BELEN','Avenida Av. Bolivar Cuadra 6 Con Jose Olaya S/N S/N Av. Bolivar Cuadra 6 Con Jose Olaya S/N Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.1579964','-76.9503419','012672117','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL JOSE CARLOS MARIATEGUI','Avenida Simón Bolívar Esquina Jr. Mariano Necochea S/N ','eess_default.png','-12.147521','-76.950802','01-2835782','Villa Maria Del Triunfo','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL NACIONAL ARZOBISPO LOAYZA','Avenida Av. Alfonso Ugarte 848 Av. Alfonso Ugarte 848','eess_default.png','-12.0498454','-77.0425597','015094800','Lima','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD VILLAS DE ANCON','Mz X Asociacion Pro-Vivienda Villas De Ancon Mz X Asociacion Pro-Vivienda Villas De Ancon Ancon Lima Lima ','eess_default.png','-11.7339705','-77.1459659','7240051','Ancon','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SALAMANCA','Jirón Los Abetos N° 115 Urbanización Salamanca ','eess_default.png','-12.0819084','-76.98252','(51) 1-4360962','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SAN JUAN DE LA LIBERTAD','Avenida Av. 11 S/N Aa.Hh. San Juan De La Libertad S/N Av. 11 S/N Aa.Hh. San Juan De La Libertad Chorrillos Lima Lima ','eess_default.png','-12.1909476','-76.9867202','01-2585665','Chorrillos','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO SAN COSME','Avenida Bauzate Y Meza 2526 La Victoria Lima Lima ','eess_default.png','-12.0623816','-77.0052973','997746795','La Victoria','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ISIS CENTRO DE MEDICINA ESTETICA Y OZONOTERAPIA','Avenida Arenales N?Ero 1898 Piso 9,Departamento 903 ','eess_default.png','-12.084661','-77.0423757','965792379','Lince','Lima','Lima','Municipalidad Distrital','Centros De Medicina Alternativa');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD LINCE','Avenida Av. Canevaro Nº 550 ','eess_default.png','-12.0839839','-77.0394842','(51) 1-4716069','Lince','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD LOS OLIVOS','Avenida Universitaria Norte N?Ero 3514 Manzana E-1 Lote 14 Urbanizaci? El Parque El Naranjal ','eess_default.png','-11.97944402','-77.07706667','(51) 1-2642112','Los Olivos','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO EL TREBOL-UBAP LOS OLIVOS','Jirón Jr. Las Guayabas 2068,Mz. K Lt. 15,Urb. El Trebol Iii Etapa ','eess_default.png','-12.0079352','-77.0725491','01-6138282 (4114)','Los Olivos','Lima','Lima','Municipalidad Distrital','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD RIO SANTA','Calle Calle 11 S/N - Asociacion De  Vivienda Rio Santa N° S/N ','eess_default.png','-11.94818503','-77.0727773','5288305','Los Olivos','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD CARLOS CUETO FERNANDINI','Avenida Av. Las Palmeras,Cuadra 45 S/N N° S/N ','eess_default.png','-11.9816226','-77.0716913','015219194;015239304','Los Olivos','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO PRO - LIMA UBAP LOS OLIVOS','Calle Calle 4/ Mz C / Lte 16 / Urbanizacion Pro - Lima / Tercera Etapa ','eess_default.png','-11.9271375','-77.074471','01 - 6138282 (8103)','Los Olivos','Lima','Lima','Municipalidad Distrital','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CASA HUERTA LA CAMPIÑA','Sector A  Aahh Casa Huerta La Campiña Manzana F Lote 1 ','eess_default.png','-11.982111','-76.916833','7439889','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ALTO PERU','Aahh Santa Cruz De Huachipa Mz B Lt.1 - Lurigancho ','eess_default.png','-12.0014312','-76.930551','7439889 anexo 4930','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL DE MEDIANA COMPLEJIDAD JOSE AGURTO TELLO','Jirón Jr. Arequipa 214-218 Jr. Arequipa 214-218 Lurigancho Lima Lima ','eess_default.png','-11.93419549','-76.69349468','(51) 1-4183232','Lurigancho','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD VILLA ALEJANDRO','Mz L- Lote 31- Aahh  Villa Alejandro Mz L- Lote 31- Aahh  Villa Alejandro Lurin Lima Lima ','eess_default.png','-12.2361611','-76.9098255','987 785 354','Lurin','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MATERNO INFANTIL MAGDALENA','Jirón Jr. Junín 322 ','eess_default.png','-12.0886944','-77.0686271','4615630 / 0514620139','Magdalena Del Mar','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD PUCUSANA','Avenida Av Lima 559 ','eess_default.png','-12.48301','-76.7962243','3676079','Pucusana','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL PUENTE PIEDRA','Kilometro 30 De La Panamericana Norte ','eess_default.png','-11.86836383','-77.07169957','(01) 5480573','Puente Piedra','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD JOSE CARLOS MARIATEGUI','Avenida Av. Continuacion S/N Aahh Jose Carlos Mariategui N° S/N ','eess_default.png','-11.938192','-76.989895','(51) 1-3922128','San Juan De Lurigancho','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('TUPAC AMARU II','Mz.A - Lote S/N Aahh Javier Perez De Cuellar S/N Mz.A - Lote S/N Aahh Javier Perez De Cuellar San Juan De Lurigancho Lima Lima ','eess_default.png','-11.9719013','-77.0041423','3925650','San Juan De Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HUASCAR XV','Avenida Av.Rio Grande S/N Altura Paradero 9 Av.J.C.Mariategui-Huascar Grupo Xv S/N Av.Rio Grande S/N Altura Paradero 9 Av.J.C.Mariategui-Huascar Grupo Xv San Juan De Lurigancho Lima Lima ','eess_default.png','-11.9557782','-77.0026526','3922530','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MEDALLA MILAGROSA','Avenida Av. El Parque S/N -Urb. San Rafael S/N Av. El Parque S/N -Urb. San Rafael San Juan De Lurigancho Lima Lima ','eess_default.png','-11.9767362','-77.0058047','3882503/3891227','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD PARAISO','Calle Calle L,Lte. 6 Y 7 Mz. H,Aahh- Paraiso Calle L,Lte. 6 Y 7 Mz. H,Aahh- Paraiso San Juan De Miraflores Lima Lima ','eess_default.png','-12.1838934','-76.9574804','997312692','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD LEONOR SAAVEDRA','Avenida Torres Paz Cdra. 1 Esq. Cdra. 4 Av. Los Héroes Sn San Juan De Miraflores Lima Lima ','eess_default.png','-12.1535138','-76.9724131','01-4503113','San Juan De Miraflores','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD DESIDERIO MOSCOSO CASTILLO','Aa.Hh. Virgen Del Guadalupe Sn Mz E Lt 1 Urb Pamplona Alta San Juan De Miraflores Lima Lima ','eess_default.png','-12.1245598','-76.9511306','992953129','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD PERU III ZONA','Avenida Av Universitaria 181 Urb Condevilla ','eess_default.png','-12.028589','-77.0764106','5678777','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO FIORI','0','eess_default.png','-12.0099265','-77.0592689','962975968','San Martin De Porres','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD VALDIVIEZO','Calle Calle Las Dalias Nº 171 - Urb. Valdiviezo Calle Las Dalias Nº 171 - Urb. Valdiviezo San Martin De Porres Lima Lima ','eess_default.png','-12.0233352','-77.0660911','5693375','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('INFANTAS','Calle Calle Santa Marina 107 - Urb Jose De San Martin Calle Santa Marina 107 - Urb Jose De San Martin San Martin De Porres Lima Lima ','eess_default.png','-11.947907','-77.068188','5369197','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SANTA ANITA','Calle Calle Los Mochicas S/N Parque Lampa De Oro  Coop.Chancas De Andahuaylas-Santa Anita S/N Calle Los Mochicas S/N Parque Lampa De Oro  Coop.Chancas De Andahuaylas-Santa Anita Santa Anita Lima Lima ','eess_default.png','-12.0413621','-76.9691707','4430119','Santa Anita','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD BRISAS DE PACHACAMAC','Avenida Av. Reiche S/N Mz K Aa.Hh. Brisas De Pachacamac S/N Av. Reiche S/N Mz K Aa.Hh. Brisas De Pachacamac Villa El Salvador Lima Lima ','eess_default.png','-12.2013856','-76.9480428','6873995','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD 12 DE JUNIO','Calle Calle Amancaes S/N,Intersección Con Pasaje Las Flores,Mz. J,Lote 4,Aahh. 12 De Junio S/N Calle Amancaes S/N,Intersección Con Pasaje Las Flores,Mz. J,Lote 4,Aahh. 12 De Junio Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.1568','-76.94996','989458686','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SANTA ROSA LAS CONCHITAS','Aahh Santa Rosa De Las Conchitas Mz L Lote 18 ','eess_default.png','-12.2062001','-76.9256064','01 2671457','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('INSTITUTO NACIONAL DE CIENCIAS NEUROLOGICAS','Jirón Jr. Ancash 1271','eess_default.png','-12.0462295','-77.0156898','4117700','Lima','Lima','Lima','Minsa','Institutos De Salud Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ALFA Y OMEGA','Avenida Av. Central S/N Mz.W - Mz.H Programa De Vivienda Alfa Y Omega N° S/N ','eess_default.png','-12.014028','-76.8537496','(51) 5833215','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISTEMA METROPOLITANO DE LA SOLIDARIDAD ATE','Avenida Bernardino Rivadavia N° S/N ','eess_default.png','-12.02896849','-76.92612772','3520798','Ate','Lima','Lima','Municipalidad,Provincial','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO BARRANCO','Avenida Surco Numero 431 ','eess_default.png','-12.146948','-77.0157362','972632265','Barranco','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('TRES DE OCTUBRE','Pasaje Esq.Hoyos Rubio Con Pasaje Jose Carlos Mariategui S/N N° S/N ','eess_default.png','-11.9755017','-76.749976','(51)1-3580949','Chaclacayo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISTEMA METROPOLITANO DE LA SOLIDARIDAD / SISOL SALUD SAN RAMON','Calle Aa.Hh. Inca Huasi Calle Micaela Bastidas 193 ','eess_default.png','-11.9330819','-77.050237','01542-6404','Comas','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SANTIAGO APOSTOL','Jirón Jr Dos De Mayo Cuadra 7 S/N S/N Jr Dos De Mayo Cuadra 7 S/N Comas Lima Lima ','eess_default.png','-11.9569237','-77.0433316','5428235','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO DAVID TEJADA DE RIVERO','Jirón Mariano Baladarrago N° S/N ','eess_default.png','-12.05124091','-76.99732016','7439889','El Agustino','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CERRO EL AGUSTINO','Avenida Av. El Agustino S/N Parte Alta Cerro El Agustino Alt. Cdra.  De La Av. Riva Aguero N° S/N ','eess_default.png','-12.057135','-77.001847','(51) 439-8260','El Agustino','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ERMITAÑO ALTO','Avenida Av Los Jazmines S/N,Paradero 8 - Ermitaño Alto S/N Av Los Jazmines S/N,Paradero 8 - Ermitaño Alto Independencia Lima Lima ','eess_default.png','-11.9992218','-77.0449556','5222582','Independencia','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('EL CARMEN','Jirón Jr 23 De Diciembre S/N - Aahh Villa El Carmen S/N Jr 23 De Diciembre S/N - Aahh Villa El Carmen Independencia Lima Lima ','eess_default.png','-12.0171219','-77.0476186','3817299','Independencia','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('OFERTA MÓVIL TIPO  EMT 2 N° 01','Avenida San Felipe N° 1126 ','eess_default.png','-12.08213879','-77.04707812','6119930','Jesus Maria','Lima','Lima','Minsa','Centro De Atención Ambulatoria');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('OFERTA MÓVIL TIPO  EMT 2 N° 02','Avenida San Felipe N° 1126 ','eess_default.png','-12.08213879','-77.04707812','6119930','Jesus Maria','Lima','Lima','Minsa','Centro De Atención Ambulatoria');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD PRIMAVERA','Mz F Lote 11 Urb Primavera Mz F Lote 11 Urb Primavera Los Olivos Lima Lima ','eess_default.png','-12.0092839','-77.07378','5328435','Los Olivos','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('VILLA MERCEDES','Aahh El Paraiso De Cajamarquilla,Mz. L,Lote 20 - Lurigancho-Chosica ','eess_default.png','-11.9880775','-76.8987606','4079329','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PABLO PATRON','Calle Aahh Pablo Patron - Calle 14 Mz. V Lote 7 ','eess_default.png','-11.930408','-76.686205','3610835','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CHOSICA','Avenida Av.Lima Norte 422 - Chosica ','eess_default.png','-11.9358106','-76.69714449','3610302','Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('VIRGEN DEL CARMEN - LA ERA','Mz D Lote 2 C.Pob. Virgen Del Carmen La Era-Lurigancho-Chosica ','eess_default.png','-11.9846891','-76.8374379','(01) 7439889 - 4630','Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD NUEVO LURIN','Avenida Av. 28 Julio  Mz 18 Lt 20  Nuevo Lurin - Km 40 Antigua Panamericana Sur ','eess_default.png','-12.2955058','-76.85438963','01-2795683','Lurin','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD MARTHA MILAGROS BAJA','Avenida Av. Los Cipreces Mz B,Lote 01,Martha Milagros Baja Av. Los Cipreces Mz B,Lote 01,Martha Milagros Baja Lurin Lima Lima ','eess_default.png','-12.233266','-76.903259','2682343','Lurin','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('LA ENSENADA','Jirón Jr. Jacarandá S/N - Aa.Hh. La Ensenada N° S/N ','eess_default.png','-11.9316287','-77.095554','5259486','Puente Piedra','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD VILLA LOS ANGELES','Avenida Av. Las Mercedes Nº 209 - Pp.Jj. Los Angeles Av. Las Mercedes Nº 209 - Pp.Jj. Los Angeles Rimac Lima Lima ','eess_default.png','-12.02349538','-77.02419715','4810310','Rimac','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD SEÑOR DE LOS MILAGROS','Calle Calle Las Margaritas S/N. Aahh Señor De Los Milagros N° S/N ','eess_default.png','-11.96820077','-76.98618735','3884478','San Juan De Lurigancho','Lima','Lima','Municipalidad,Provincial','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD CRUZ DE MOTUPE','Avenida Av.Central S/N-Grupo 5 - Aahh Cruz De Motupe (Alt Pdo 8 Av.Wiesse) S/N Av.Central S/N-Grupo 5 - Aahh Cruz De Motupe (Alt Pdo 8 Av.Wiesse) San Juan De Lurigancho Lima Lima ','eess_default.png','-11.9408268','-76.9749709','3920678','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD LA HUAYRONA','Calle Calle Las Gemas S/ -  El Parque -Coop.La Huayrona ','eess_default.png','-11.9942159','-77.0065573','3877400','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('EX FUNDO NARANJAL','Jirón Jr Jircan 604 Mz I Lt 24 Coop De Viv Ex Hacienda Naranjal Jr Jircan 604 Mz I Lt 24 Coop De Viv Ex Hacienda Naranjal San Martin De Porres Lima Lima ','eess_default.png','-11.9669636','-77.0873748','5298143','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL HERMILIO VALDIZAN','Carretera Carretera Central Km 3.5 Santa Anita Carretera Central Km 3.5 Santa Anita Santa Anita Lima Lima ','eess_default.png','-12.0468271','-76.9454975','(51) 1-4942410','Santa Anita','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion Especializada');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('NOCHETO','Calle Calle Javier Heraud S/N Urb. Ah Nocheto S/N Calle Javier Heraud S/N Urb. Ah Nocheto Santa Anita Lima Lima ','eess_default.png','-12.046338','-76.9843438','(51) 3620584','Santa Anita','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD VIRGEN DE LAS MERCEDES','Asoc. Viv. Santa Rosa Mz. B Lt. 09 ','eess_default.png','-11.7848464','-77.15687595','015245142','Santa Rosa','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISTEMA METROPOLITANO DE LA SOLIDARIDAD  SISOL VILLA EL SALVADOR','Avenida Av. Pastor Sevilla S/N Ovalo Cocharcas N° S/N ','eess_default.png','-12.06819767','-77.02039159','(51) 1-2642222','Villa El Salvador','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SASBI','Parque Sector 6 - Grupo 01 -S/N Parque Central S/N Sector 6 - Grupo 01 -S/N Parque Central Villa El Salvador Lima Lima ','eess_default.png','-12.2083922','-76.9544531','1-5708505','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL TABLADA DE LURIN','Avenida Av. Republica Y Billingurst S/N 2Do Sector S/N Av. Republica Y Billingurst S/N 2Do Sector Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.1910331','-76.9274519','01-3565414','Villa Maria Del Triunfo','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD CIUDAD DE GOSEN','Divino Maestro Mz D Lt 11 Divino Maestro Mz D Lt 11 Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.213772','-76.920566','01-2932193','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL DANIEL ALCIDES CARRION','Avenida Av. Pachacutec Nº 3470 Av. Pachacutec Nº 3470 Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.1776988','-76.94539','01-4505684','Villa Maria Del Triunfo','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD TORRES DE MELGAR','Mz. Spco Lote Pm Aahh Torres De Melgar Mz. Spco Lote Pm Aahh Torres De Melgar Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.178746','-76.951232','01-2929682','Villa Maria Del Triunfo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD VIRGEN DE LOURDES','Avenida Av. Condebamba S/N N° S/N ','eess_default.png','-12.1672291','-76.9189534','987469118','Villa Maria Del Triunfo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MEDICO ANCIJE','Jirón Jr. Chota Nº 1449 - Cercado De Lima ','eess_default.png','-12.0590926','-77.0401513','01-5727781','Lima','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('TUPAC AMARU','Mz. D Lote N° 50 Zona 2° - Aahh Tupac Amaru Mz. D Lote N° 50 Zona 2° - Aahh Tupac Amaru Ate Lima Lima ','eess_default.png','-12.05160743','-76.92909335','7176624','Ate','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD GAUDENCIO BERNASCONI','Avenida Grau 198 Av. Grau Nº198 Barranco Lima Lima ','eess_default.png','-12.1504676','-77.0204924','01-4773699','Barranco','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUNCHAUCA','Carretera Carretera Canta Km 25.5 - Aa.Hh. Punchauca ','eess_default.png','-11.8345612','-77.000102','01 -7193585','Carabayllo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD CHORRILLOS','Avenida Avenida Fernando Terán 990 ','eess_default.png','-12.1673499','-77.0189828','(51)1-4671684','Chorrillos','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO CRL. SAN. WILELMO PEDRO ZORILLA HUAMAN','Jirón General Buendia 503 Villa Militar Oeste Chorrillos Lima Lima ','eess_default.png','-12.15926994','-77.0200131','014793341','Chorrillos','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SANTA LUZMILA I','Avenida Av Guillermo De La Fuente Cuadra 2 S/N - Urb Santa Luzmila 1° Etapa N° S/N ','eess_default.png','-11.9416876','-77.0636501','No Disponible','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL NACIONAL HIPOLITO UNANUE','Avenida Av. César Vallejo 1390 - El Agustino Av. César Vallejo 1390 - El Agustino El Agustino Lima Lima ','eess_default.png','-12.03996905','-76.99258174','3625700 / 3627777','El Agustino','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE ATENCION PRIMARIA III INDEPENDENCIA - RPA - ESSALUD','Calle Calle "A"  Mz "D" Lote 13 Y 14 - Urb. Panamericana ','eess_default.png','-11.9926724','-77.0617451','01-5727925 1501','Independencia','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD PARQUES DE MANCHAY','Carretera Carretera Cieneguilla Km 21-Mz 1 Lt 12-13 Aahh Paul Poblet Lind ','eess_default.png','-12.0849835','-76.8770521','977478442','Pachacamac','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL DR. ENRIQUE MARTIN ALTUNA','Asoc Viv E Industrias Virgen De Las Nieves Urb Leoncio Prado Mz B Lt. 18A Km 35.5 Panam. Norte Asoc Viv E Industrias Virgen De Las Nieves Urb Leoncio Prado Mz B Lt. 18A Km 35.5 Panam. Norte Puente Piedra Lima Lima ','eess_default.png','-11.8376114','-77.1090997','01-5274340','Puente Piedra','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN BARTOLO','Avenida San Bartolo Mz A Lt 1 Y Av. El Gofl N° S/N ','eess_default.png','-12.3873605','-76.7770243','4307843','San Bartolo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SAN HILARION','Jirón Jr. Los Silicios S/N Urb. San Hilarion S/N Jr. Los Silicios S/N Urb. San Hilarion San Juan De Lurigancho Lima Lima ','eess_default.png','-11.9957864','-77.0158637','3882500','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD 6 DE JULIO','Asociacion De Vicienda 6 De Julio,Pamplona Baja L 14-A Espalda De Puesto De Fiscalizacion Del Surco. San Juan De Miraflores Lima Lima ','eess_default.png','-12.1589058','-76.9751756','945339283','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL OLLANTAY','Avenida Av. Prolongacion Gabriel Torres S/N. Pamplona Alta S/N Av. Prolongacion Gabriel Torres S/N. Pamplona Alta San Juan De Miraflores Lima Lima ','eess_default.png','-12.1358082','-76.9635479','01-2851295','San Juan De Miraflores','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD VILLA SAN LUIS','Avenida Villa Solidaridad O10 1 Sector Villa San Luis Y José C. Mariátegui  Villa San Luis San Juan De Miraflores Lima Lima ','eess_default.png','-12.1426786','-76.9708795','01-2674616','San Juan De Miraflores','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MESA REDONDA','Jirón Jr Sanchez Cerro 295 - Urb Mesa Redonda Jr Sanchez Cerro 295 - Urb Mesa Redonda San Martin De Porres Lima Lima ','eess_default.png','-12.0043022','-77.0575097','5337976','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO EXCELENCIA SAN MIGUEL','Avenida Av La Paz 2008 1 San Miguel Lima Lima ','eess_default.png','-12.08178235','-77.10132729','966411209','San Miguel','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('VIÑA SAN FRANCISCO','Urbanizacion Productores Mz A Lt 14 Urbanizacion Productores Mz A Lt 14 Santa Anita Lima Lima ','eess_default.png','-12.033188','-76.951488','5963478','Santa Anita','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD LAS DUNAS','Calle Calle Los Herrerillos Mza F Lte 1 S/N - Las Dunas N° S/N ','eess_default.png','-12.1665881','-76.984405','(51) 1-7150925','Santiago De Surco','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD LOS VIÑEDOS DE SURCO','Mz F Lote 12 Aahh Viñedos De Surco ','eess_default.png','-12.162636','-76.9903538','01 2579543','Santiago De Surco','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD OASIS DE VILLA','St 10 Gr 2 Mz P Lt 15 Aa.Hh. Oasis De Villa St 10 Gr 2 Mz P Lt 15 Aa.Hh. Oasis De Villa Villa El Salvador Lima Lima ','eess_default.png','-12.2107913','-76.9346408','999450507','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SARITA COLONIA','Parque St. 2 Gr. 24Parque Central St. 2 Gr. 24Parque Central Villa El Salvador Lima Lima ','eess_default.png','-12.2132707','-76.9444683','012880014','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL JOSE GALVEZ','Calle Cruce Calle Arica Con Agricultura S/N Numero S/N ','eess_default.png','-12.2105625','-76.9072151','01-2932609','Villa Maria Del Triunfo','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO CHINCHA','Jirón Jr. Chincha 226 ','eess_default.png','-12.06264167','-77.03923833','4333742','Lima','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL NACIONAL DOCENTE MADRE NIÑO SAN BARTOLOME','Avenida Av Alfonso Ugarte Nº 825 Lima Cercado','eess_default.png','-12.0499179','-77.0423608','(01) 2010400','Lima','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion Especializada');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('EL EXITO','Mz. F - Lote 1 - Urb. El Éxito ','eess_default.png','-12.0238043','-76.9011921','3562531','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD CHOCAS','Carretera Km 34 De La Carretera A Canta (Av Tupac Amaru Km 38) ','eess_default.png','-11.7667755','-76.9771577','995899566','Carabayllo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SANTA TERESA DE CHORRILLOS','Prolongación Av.El Sol N° S/N ','eess_default.png','-12.1870476','-77.0176748','978778249','Chorrillos','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO CIENEGUILLA','Avenida Pachacutec Manzana 1 Lote 5 - Zona B Urbanización Tambo Viejo ','eess_default.png','-12.1122117','-76.816773','7439889 anexo 4391','Cieneguilla','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SANGARARA','Jirón Jr La Union (Con Calle Cuzco) Cuadra 6 S/N  - Asoc. Vivienda Pablo Vi S/N Jr La Union (Con Calle Cuzco) Cuadra 6 S/N  - Asoc. Vivienda Pablo Vi Comas Lima Lima ','eess_default.png','-11.91876401','-77.04373564','5421829','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('LOS GERANIOS','Jirón Jr. Mariano Condorcanqui S/N N° S/N ','eess_default.png','-11.8961278','-77.0434893','1-5440442','Comas','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('BETHANIA','Los Artesanos 166 Asoc.Viv. Bethania (Cerca Del Cei) ','eess_default.png','-12.0277035','-76.99271243','3851197','El Agustino','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO EL AGUSTINO','Calle San Jose N° 175 Urbanización San Jose ','eess_default.png','-12.03286184','-77.00244761','(01) 762-9653','El Agustino','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SANTA MAGDALENA SOFIA','Avenida Av. Garcilazo De La Vega Cdra. 3 - San Pedro ','eess_default.png','-12.0606209','-77.0036943','1-3236296','El Agustino','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('TAHUANTINSUYO ALTO','Avenida Av Hermanos Ayar 2Da Cuadra S/N - Tahuantinsuyo Alto 3Era Zona S/N Av Hermanos Ayar 2Da Cuadra S/N - Tahuantinsuyo Alto 3Era Zona Independencia Lima Lima ','eess_default.png','-11.979306','-77.0396598','5263956','Independencia','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL I CARLOS ALCANTARA BUTTERFIELD','Avenida Av. Los Constructores 1201 - Urb. Covima ','eess_default.png','-12.062131','-76.9455439','013492288','La Molina','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CONSULTORIOS DE ESPECIALIDADES MEDICAS UYARI','Jirón Sinchi Roca N° 2437 Piso 1 ','eess_default.png','-12.0864978','-77.0445961','(51) 981848945','Lince','Lima','Lima','Minsa','Consultorios Medicos Y De Profesionales De La Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD VILLA DEL NORTE','Mz V Lote 05 - Urb.Villa Del Norte ','eess_default.png','-11.9710213','-77.0694925','(51)15298907','Los Olivos','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SEÑOR DE LOS MILAGROS','Avenida Av.Precursores S/N Aahh Nicolas De Pierola  /  Lurigancho-Chosica S/N Av.Precursores S/N Aahh Nicolas De Pierola  /  Lurigancho-Chosica Lurigancho Lima Lima ','eess_default.png','-11.9358566','-76.714793','3600928','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL DE EMERGENCIAS JOSÉ CASIMIRO ULLOA','Avenida Av. Roosvelt N° 6355 (Ex Av. Republica De Panama) ','eess_default.png','-12.12810608','-77.01773784','2040900','Miraflores','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion Especializada');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD COLLANAC','Avenida Av. Victor Malasquez  Km 5.5 Sector 24 De Junio -Collanac Av. Victor Malasquez  Km 5.5 Sector 24 De Junio -Collanac Pachacamac Lima Lima ','eess_default.png','-12.1168591','-76.8701889','997425471','Pachacamac','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL SANTA ROSA','Avenida Aa.Hh. Santa Rosa,Mz. 50,Lote Pm - Av. Santa Rosa Aa.Hh. Santa Rosa,Mz. 50,Lote Pm - Av. Santa Rosa Puente Piedra Lima Lima ','eess_default.png','-11.87466466','-77.08173075','01-52271664','Puente Piedra','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD PUNTA HERMOSA','Antigua Panamericana Sur Km 43 ','eess_default.png','-12.3267536','-76.825051','012641769 anexo 231','Punta Hermosa','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISTEMA METROPOLITANO DE LA SOLIDARIDAD METRO UNI','Avenida Av Gerardo Unger Cuadra 16 S/N N° S/N ','eess_default.png','-12.01288243','-77.05216177','(51) 1-5348556','Rimac','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD TODOS LOS SANTOS SAN BORJA','Jirón Jr Franz Schubert S/N Esquina Con Jr Bozovich N° S/N ','eess_default.png','-12.1020977','-76.9934694','(51) 1-4752908','San Borja','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO JAIME ZUBIETA','Avenida El Periodista N° 279 Piso 1 Urbanización Canto Sol ','eess_default.png','-11.9731706','-77.0123932','(51) 997745207','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('10 DE OCTUBRE','Mz. F 5 S/N Aahh 10 De Octubre N° S/N ','eess_default.png','-11.9452166','-76.9877759','017435835','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SAGRADA FAMILIA','Avenida Mz. I Lt. 8 Av. El Parque Coop. Sagrada Familia ','eess_default.png','-11.9765576','-76.9888845','3886661','San Juan De Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL SAN JUAN DE LURIGANCHO','Avenida Entre Paradero 10 Y 11 De Av. Canto Grande (Huascar) ','eess_default.png','-11.9665774','-77.0030573','933879000','San Juan De Lurigancho','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('AZCARRUNZ ALTO','Avenida Av.Lurigancho Cdra.9 S/N Mz.B Lote 49 - Urb.Azcarrunz Alto N° S/N ','eess_default.png','-12.0064933','-77.0038652','4596890','San Juan De Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE ATENCIÓN PRIMARIA III SAN JUAN DE MIRAFLORES','Avenida Av. Canevaro Con Av. Vargas Machuca S/N N° S/N ','eess_default.png','-12.1643037','-76.9692522','01-2760812','San Juan De Miraflores','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD RICARDO PALMA','Mz. F Lote 1 Asociacion De Vivienda Tradiciones Ricardo Palma ','eess_default.png','-12.1843422','-76.961124','2800377','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SAN MARTIN DE PORRES','Pasaje Pasaje Leones Nº 115 - Asoc. Pedregal Pasaje Leones Nº 115 - Asoc. Pedregal San Martin De Porres Lima Lima ','eess_default.png','-12.0345295','-77.0549341','3821643','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD JUAN PEREZ CARRANZA','Jirón Jr. Cuzco 925 ','eess_default.png','-12.0537765','-77.022701','(51) 1-3287304','Lima','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD UNIDAD VECINAL Nº 3','Block Nº 1 Unidad Vecinal Nº 3 ','eess_default.png','-12.0512449','-77.0821925','4648455','Lima','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MANYLSA','Mz. F - Lote 1 - Coop. Manylsa - Ate ','eess_default.png','-12.0326573','-76.8887157','3561672','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('GUSTAVO LANATTA','Jirón Jr.Puerto España Mz F2 Lote 02 - Sicuani Jr.Puerto España Mz F2 Lote 02 - Sicuani Ate Lima Lima ','eess_default.png','-12.0694803','-76.9789165','(51) 1-3265943','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SAN PEDRO DE CARABAYLLO','Calle Loma Blanca S/N A 1Cuadra De La Avenida 3 Carabayllo Lima Lima ','eess_default.png','-11.8539382','-77.0378808','942694503','Carabayllo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD LOS INCAS','Calle Calle Islas Guyanas Mz I-6 Lote 30 Urb. Los Cedros De Villa Calle Islas Guyanas Mz I-6 Lote 30 Urb. Los Cedros De Villa Chorrillos Lima Lima ','eess_default.png','-12.2023962','-77.013183','01-2497673','Chorrillos','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('COLCA','Calle Calle Galilea,Mz. N,Lote 4 - Cpr Villa Toledo - Colca ','eess_default.png','-12.10193731','-76.80206875','(51) 1-4798751','Cieneguilla','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('GUSTAVO LANATTA','Calle Calle Arequipa S/N Cuadra 2 - Collique 5Ta Zona S/N Calle Arequipa S/N Cuadra 2 - Collique 5Ta Zona Comas Lima Lima ','eess_default.png','-11.9146878','-77.0113278','5580204','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CONSULTORIOS DE ATENCIÓN INTEGRAL DE DIABETES E HIPERTENSION - ESSALUD','Avenida Arenales N° 1402 Piso 1 ','eess_default.png','-12.0781849','-77.0367809','2656000','Jesus Maria','Lima','Lima','Essalud','Consultorios Medicos Y De Profesionales De La Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO PABLO BERMUDEZ','Jirón Pablo Bermudez N° 226 ','eess_default.png','-12.0726176','-77.0383011','3303596 / 3303806','Jesus Maria','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO LA FLORIDA','Asociación De Vivienda La Florida De Cajamarquilla Mz D,Lt 1 B ','eess_default.png','-11.9300576','-76.6887331','7439889','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('VIRGEN DEL ROSARIO CARAPONGO','Urb.San Antonio Mz Y Lt 19 ','eess_default.png','-12.0021766','-76.8756992','(51) 7173750','Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO CHOSICA - ESSALUD','Jirón Jr.Trujillo Sur 800 ','eess_default.png','-11.9391839','-76.6995494','(51) 1-5313560','Lurigancho','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SANTA MARIA DE HUACHIPA','Los  Canarios Mz O2 Lote 5 - Lurigancho Chosica Los  Canarios Mz O2 Lote 5 - Lurigancho Chosica Lurigancho Lima Lima ','eess_default.png','-11.9513258','-76.7318135','(51) 3711793','Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MARISCAL CASTILLA','Calle Calle Santa Rosa Mz O S/N - Aahh Mariscal Castilla N° S/N ','eess_default.png','-11.933911','-76.685491','3613184','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO RENATO CASTRO DE LA MATA','Avenida Jacarandá N° S/N Piso 1 Urbanización Aahh Ensenada ','eess_default.png','-11.93531354','-77.09345572','975053026','Puente Piedra','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CLÍNICA DE FAMILIA','Avenida Malachowsky N° 520 ','eess_default.png','-12.1088001','-77.0064707','680-5555','San Borja','Lima','Lima','Municipalidad Distrital','Consultorios Medicos Y De Profesionales De La Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD AMAKELLA','Jirón Jr. Fermín Nacario Nº 112,Coop. Amakella 2Da. Etapa Jr. Fermín Nacario Nº 112,Coop. Amakella 2Da. Etapa San Martin De Porres Lima Lima ','eess_default.png','-12.0179051','-77.0785731','569-0786','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD PERU IV ZONA','Avenida Av  Peru Nº 3595 - Urb. Peru Av  Peru Nº 3595 - Urb. Peru San Martin De Porres Lima Lima ','eess_default.png','-12.030943','-77.0861791','(51)1-965376965','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN MIGUEL','Avenida Av Libertad  Av Los Mochicas S/N S/N Av Libertad  Av Los Mochicas S/N San Miguel Lima Lima ','eess_default.png','-12.0813992','-77.0987145','5782718','San Miguel','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD HUACA PANDO','Los Sauces Mz B-Ii Novena Etapa ','eess_default.png','-12.061614','-77.083277','017435835 ANEXO 3148','San Miguel','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ESSALUD - HOSPITAL IIE SAN ISIDRO LABRADOR','Avenida Av. Carretera Central 1345,Km. 3.5 ','eess_default.png','-12.04757833','-76.947995','(01) 5160409','Santa Anita','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion Especializada');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('VILLA VICTORIA PORVENIR','Avenida Av. Martin Luther King S/N°,Urb. Villa Victoria N° S/N ','eess_default.png','-12.1088569','-77.0120429','2254253','Surquillo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD  SURQUILLO','Avenida Av. Angamos 714-734 ','eess_default.png','-12.11349791','-77.02400451','(51) 1-2431120','Surquillo','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL JUAN PABLO II','Avenida Av. Mariano Pastor  Sevilla S/N ,Sector 6,Grupo 6 Numero S/N ','eess_default.png','-12.2191614','-76.9452898','014931881','Villa El Salvador','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO VILLA EL SALVADOR','Sector 6 Grupo  5 I 19 Av Pastor Sevilla Ruta C Paradero Policlinico Villa El Salvador Lima Lima ','eess_default.png','-12.21787811','-76.9492093','(51) 1-6949688','Villa El Salvador','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SAGRADA FAMILIA','Sector 2,Grupo 18,Parque Central St. 2 Gr. 18 Villa El Salvador Lima Lima ','eess_default.png','-12.2091999','-76.9437139','991283112','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO LUZ DE ESPERANZA','Avenida San Alfonso Mz B Lt 1 Niño Jesus 1Era Etapa - Santa Clara ','eess_default.png','-12.02030225','-76.88602169','923476795','Ate','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL VITARTE','Avenida Av. Nicolas Ayllon 5880-Carretera Central Av. Nicolas Ayllon 5880-Carretera Central Ate Lima Lima ','eess_default.png','-12.0260421','-76.9199038','3514484 / 3516059','Ate','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL II VITARTE - ESSALUD','Jirón Jr. San Martin De Portes 265 ','eess_default.png','-12.02704336','-76.92369527','4942971','Ate','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('AMAUTA','Zona A - Mz. V3 Lote 3  Aahh El Amauta Zona A - Mz. V3 Lote 3  Aahh El Amauta Ate Lima Lima ','eess_default.png','-12.04277623','-76.89800245','995384583','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('VILLA ESPERANZA','Jirón Jr 9 De Octubre Cuadra 2 S/N - Ppjj Villa Esperanza N° S/N ','eess_default.png','-11.88612425','-77.02200976','5470600','Carabayllo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO CARABAYLLO','Avenida Av. San Martín Cda. 5 S/N- Urb. Santa Isabel S/N Carabayllo Lima Lima ','eess_default.png','-11.90138924','-77.03373058','920016327','Carabayllo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO ASIRI (SONRISA)','Asentamiento Humano Sol Naciente L3 1 Frente A La Iep 8190 Carabayllo Lima Lima ','eess_default.png','-11.88022536','-76.99734605','987811641','Carabayllo','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD LUIS ENRIQUE','Avenida Av Manuel Prado Cuadra 7 S/N - El Progreso 4To Sector N° S/N ','eess_default.png','-11.8770066','-77.0095277','5473601','Carabayllo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL EL PROGRESO','Avenida Av. Tupac Amaru Nº 2950 (Km 22) ','eess_default.png','-11.87520403','-77.01699612','5473485','Carabayllo','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SU MAJESTAD HIROITO','Calle Calle Tokio Mz D Lt 10 Aahh Su Majestad Hiroito Calle Tokio Mz D Lt 10 Aahh Su Majestad Hiroito Carabayllo Lima Lima ','eess_default.png','-11.88112828','-77.00366802','5295798','Carabayllo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MORON','Ct.7,Lote 19-20 C. Central Km. 22.7 Aahh Virgen De Fatima ','eess_default.png','-11.9797934','-76.7889201','3582072','Chaclacayo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PERLA DEL SOL','Avenida Av.Peru Lt.49 Perla Del Sol ','eess_default.png','-12.0130237','-76.7600498','3580347','Chaclacayo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('VILLA RICA','Asoc. Pro Vivienda Villa Rica Mz R Lt. 04 ','eess_default.png','-11.9931429','-76.8258265','3590299','Chaclacayo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD NUEVA CALEDONIA','Avenida Av. Huancavelica Mz.E,Lt.1 Aahh Nueva Caledonia Av. Huancavelica Mz.E,Lt.1 Aahh Nueva Caledonia Chorrillos Lima Lima ','eess_default.png','-12.1970405','-77.0260851','01-2551787','Chorrillos','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN GENARO DE VILLA','Avenida Av. Principal (Altura De La Calle 12) Aahh San Genaro ','eess_default.png','-12.19397088','-77.02094701','01-7662919','Chorrillos','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('Hospital I Marino Molina Scippa - EsSalud','Avenida Guillermo De La Fuente N° 515 Piso 3 Urbanización Santa Luzmila I Etapa ','eess_default.png','-11.943567','-77.057848','5374552 Anexo 5503','Comas','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISTEMA METROPOLITANO DE LA SOLIDARIDAD / SINCHI ROCA','Jirón Jr Wiracocha Cdra. 2 S/N Urb. San Agustin 2Da Etapa. S/N Jr Wiracocha Cdra. 2 S/N Urb. San Agustin 2Da Etapa. Comas Lima Lima ','eess_default.png','-11.9304536','-77.0485308','01 5365999','Comas','Lima','Lima','Municipalidad,Provincial','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD AÑO NUEVO','Avenida Av Francisco Bolognesi Cuadra 6 S/N - Ppjj Año Nuevo N° S/N ','eess_default.png','-11.9231023','-77.0401525','(51) 5473133','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD MILAGRO DE JESUS','Avenida Av. Santo Toribio De Mogrovejo,Mz L,Lote 10 - Aahh Milagro De Jesus ','eess_default.png','-11.9186782','-77.0258283','5582656','Comas','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('OFERTA MOVIL TIPO EMT 3 N° 01','Avenida San Felipe N° 1126 ','eess_default.png','-12.0820595','-77.0463824','6119930','Jesus Maria','Lima','Lima','Minsa','Centro De Atención Ambulatoria');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO LA MOLINA','Avenida Raul Ferrero Cuadra 5 ','eess_default.png','-12.08729942','-76.94220124','7439889 anexo 4471','La Molina','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL NACIONAL GUILLERMO ALMENARA IRIGOYEN','Avenida Av. Grau Nº 800 ','eess_default.png','-12.0582734','-77.022538','1-3242983','La Victoria','Lima','Lima','Essalud','Institutos De Salud Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO ILLARIMUN (AMANECER)','Avenida Naranjal 1379 A Una Cuadra De La Avenida Universitaria,Cuadra 49 Los Olivos Lima Lima ','eess_default.png','-11.9773149','-77.0810609','999555886','Los Olivos','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN MARTIN DE PORRES CONFRATERNIDAD','Avenida Mz 143-A S/N,Av Betancourt - Aahh San Martin De Porres S/N Mz 143-A S/N,Av Betancourt - Aahh San Martin De Porres Los Olivos Lima Lima ','eess_default.png','-11.9597024','-77.0802984','5444536','Los Olivos','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO REFERENCIAL ESPECIALIZADO EN REHABILITACION Y TERAPIA FISICA DE CHOSICA','Avenida Av. 28 De Julio S/N Chosica N° S/N ','eess_default.png','-11.9383224','-76.6961291','3614161','Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD JULIO C TELLO','Avenida Av. Las Acasias Mz B Lt 12  St 1 Julio C. Tello ','eess_default.png','-12.251321','-76.8992625','988764576','Lurin','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD BUENA VISTA','Prolongación Prolong. Alfonso Ugarte Buena Vista Baja S/N N° S/N ','eess_default.png','-12.2569375','-76.8746335','3673271','Lurin','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO PUENTE PIEDRA','Avenida Av. Buenos Aires 652 ','eess_default.png','-11.8628584','-77.0801408','5485800','Puente Piedra','Lima','Lima','Essalud','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL SALUD LA ENSENADA','Aa.Hh.Valle Chillon S/N N° S/N ','eess_default.png','-11.93166844','-77.09564795','(51) 1-5510534','Puente Piedra','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL RÍMAC','Pasaje Pasaje San German Nº 270 Urb. Villacampa – Rimac Pasaje San German Nº 270 Urb. Villacampa – Rimac Rimac Lima Lima ','eess_default.png','-12.0343399','-77.0336606','(51) 7131002','Rimac','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('centro de salud mental comunitario javier mariategui chiappe','Avenida Lurigancho S/N 1 1 1 B 9 Azcarrunz Alto A Espalda Del Puesto De Salud Azcarrunz Alto San Juan De Lurigancho Lima Lima ','eess_default.png','-12.01734472','-77.00097776','4584112','San Juan De Lurigancho','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD PROYECTOS ESPECIALES','Avenida Cruce De Av. José Carlos Mariátegui S/N Con Av. Bayovar Numero S/N ','eess_default.png','-11.9558652','-76.9924377','3875550','San Juan De Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HUASCAR II','Grupo Ii Mz 23 Ltes. 101-107-108 - Aahh Huascar ','eess_default.png','-11.9667218','-77.0109956','(51) 1 - 2533222','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SANTA FE DE TOTORITA','Jirón Jr. Cantuta S/N  Aahh. Santa Fe De Totorita N° S/N ','eess_default.png','-11.9840322','-77.093019','993658950','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL DE ESPECIALIDADES QUIRÚRGICAS DE SAN JUAN DE MIRAFLORES','Avenida Cesar Canevaro N° 481 Piso 1 ','eess_default.png','-12.1636311','-76.9692559','987704368','San Juan De Miraflores','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion Especializada');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD "VILLA SOLIDARIDAD"','Calle 9 Sn Mz F-A Lote 3 Asentamiento Humano Villa Solidaridad San Juan De Miraflores Lima Lima ','eess_default.png','-12.1705961','-76.9606937','012767961','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD TRÉBOL AZUL','Avenida Av. Miguel Grau Mz. L,Lote. 15 - Alt. Cdra 9 Av. Prolong. Canevaro Aahh Trébol Azul ','eess_default.png','-12.1775527','-76.9659123','01-2762502','San Juan De Miraflores','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD JOSE MARIA ARGUEDAS','Pasaje Pasaje A,Mz F,Lote 01,Sector Jose Maria Arguedas,Pamplona Alta Pasaje A,Mz F,Lote 01,Sector Jose Maria Arguedas,Pamplona Alta San Juan De Miraflores Lima Lima ','eess_default.png','-12.1327613','-76.9556678','(51) 1-2674606','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN LUIS','Calle Calle Raúl Villarán 332 Calle Raúl Villarán 332 San Luis Lima Lima ','eess_default.png','-12.0756274','-76.9972532','4743865','San Luis','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('VIRGEN DEL PILAR DE NARANJAL','Avenida Av. Los Alisos Nº 397 - Urb. Naranjal Av. Los Alisos Nº 397 - Urb. Naranjal San Martin De Porres Lima Lima ','eess_default.png','-11.9838236','-77.062838','5239973','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('INSTITUTO NACIONAL DE ENFERMEDADES NEOPLASICAS','Avenida Av.  Angamos Este Nº 2520,Urb. Calera De La Merced ','eess_default.png','-12.1117911','-76.9991488','051-2016500','Surquillo','Lima','Lima','Minsa','Institutos De Salud Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD LLANAVILLA','Calle Calle La Paz Mz F Lte 05 Sector 8 Calle La Paz Mz F Lte 05 Sector 8 Villa El Salvador Lima Lima ','eess_default.png','-12.191279','-76.9418801','01-2914507','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO VIRGEN DE LA MERCED','Edilberto Ramos,Grupo 1,Mz. M,Prima,Sector 10,Media Cuadra De Av. Universitaria Con Pastor Sevilla ','eess_default.png','-12.2431532','-76.9294507','997892091','Villa El Salvador','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO SAN GABRIEL ALTO','Pueblo Joven Jose Carlos Mariategui Mz Spco Lote Tpa Etapa Sexta Sector San Gabriel ','eess_default.png','-12.1418352','-76.9492584','01-2830482','Villa Maria Del Triunfo','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO  MONSEÑOR JOSE RAMON GURRUCHAGA','Avenida Santa Rosa 900 Al Costado Del Albergue De Los Ancianos Villa Marina Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.161575','-76.9382139','947273819','Villa Maria Del Triunfo','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISTEMA METROPOLITANO DE LA SOLIDARIDAD /SOLIDARIDAD SALUD VILLALIMATAMBO','Entre Mz H/I  San Gabriel Alto ','eess_default.png','-12.134076','-76.942213','01-2834040','Villa Maria Del Triunfo','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD NUEVA ESPERANZA','Avenida Av. 26 De Noviembre 835 Nva. Esperanza Av. 26 De Noviembre 835 Nva. Esperanza Villa Maria Del Triunfo Lima Lima ','eess_default.png','-12.1733468','-76.9338322','(51) 1-2913152','Villa Maria Del Triunfo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MIRONES BAJO','Jirón Jr. Bruno Terreros 144 Jr. Bruno Terreros 144','eess_default.png','-12.0359928','-77.0722189','3360243','Lima','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SISOL Mirones','Avenida Colonial N° 2001 ','eess_default.png','-12.04905784','-77.06740059','01 5006186','Lima','Lima','Lima','Municipalidad,Provincial','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD VILLA ESTELA','Proyecto Integral Municipal Panamericana Norte Sector I - Aa.Hh. Villa Estela Mz. B-5 Lt. 13 Proyecto Integral Municipal Panamericana Norte Sector I - Aa.Hh. Villa Estela Mz. B-5 Lt. 13 Ancon Lima Lima ','eess_default.png','-11.81520897','-77.13210448','550-2116','Ancon','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN JOSE','Calle Esq. Calle Nº 17 Y Calle Nº 9 Urb. De Interes Social San Jose De Ancon Lote Pmed Esq. Calle Nº 17 Y Calle Nº 9 Urb. De Interes Social San Jose De Ancon Lote Pmed Ancon Lima Lima ','eess_default.png','-11.7782373','-77.162575','5245156','Ancon','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ATE','Jirón Jr. Paruro 138 Coop. 27 De Abril Jr. Paruro 138 Coop. 27 De Abril Ate Lima Lima ','eess_default.png','-12.0560161','-76.9571572','3491297','Ate','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MIGUEL GRAU','Carretera Carretera Central Kilometro 19.5 - Coop.Viv. Miguel Grau ','eess_default.png','-11.9870514','-76.8136381','7439889','Chaclacayo','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD ARMATAMBO','Calle Calle Lucanas Mz 1 Lote 1 Aahh Armatambo Calle Lucanas Mz 1 Lote 1 Aahh Armatambo Chorrillos Lima Lima ','eess_default.png','-12.1769749','-77.0217643','012518251','Chorrillos','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('Puesto de Salud 11 de Julio','Asentamiento Humano 11 De Julio S/N N° S/N ','eess_default.png','-11.930841','-77.037336','000000000','Comas','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ERMITAÑO BAJO','Jirón Jr. Los Pinos S/N S/N Jr. Los Pinos S/N Independencia Lima Lima ','eess_default.png','-11.9977277','-77.0546443','7194094','Independencia','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('Centro de Salud Mental Comunitario La Victoria','Jirón Antonio Bazo Cdra. 12 N° S/N ','eess_default.png','-12.071416','-77.01337496','(51) 1-7662447','La Victoria','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD LAURA CALLER','Calle Mz 10-A Lote S/N - Zona 5 Aahh Laura Caller N° S/N ','eess_default.png','-11.970078','-77.0776032','(01)6413900','Los Olivos','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL JUAN PABLO II','Calle Calle 28 S/N Aa.Hh. Juan Pablo Ii N° S/N ','eess_default.png','-11.95309937','-77.07798163','01-5298901','Los Olivos','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SAN ANTONIO DE PEDREGAL','Avenida Av Alfonso Ugarte S/N - San Antonio De Pedregal N° S/N ','eess_default.png','-11.9214709','-76.7128534','3602765','Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO SAN PEDRO DE LURIN','Prolongación Bolívar Y San Pedro Mz A-1 Lte 01 ','eess_default.png','-12.27200166','-76.87129156','935682670','Lurin','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MANGOMARCA','Avenida Av. El Santuario S/N(Cdra. 24 S/N) Urb. Mangomarca N° S/N ','eess_default.png','-12.0105371','-76.9792263','3790380','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ENRIQUE MONTENEGRO','Avenida Av.Wiesse S/N Enrique Montenegro (Costado Colegio Nestor Escudero - Cruce Calle 10) S/N Av.Wiesse S/N Enrique Montenegro (Costado Colegio Nestor Escudero - Cruce Calle 10) San Juan De Lurigancho Lima Lima ','eess_default.png','-11.9370395','-76.9709422','3924729','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CHACARILLA DE OTERO','Jirón Jr. Jose Antonio Encinas Nº 155 - Urb.Chacarilla De Otero ','eess_default.png','-12.02099045','-77.0068781','01-7435835 #3001','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN JUAN DE MIRAFLORES','Pasaje Psje. San Juan S/N Zona A (Junto Comisaría Sjm) S/N Psje. San Juan S/N Zona A (Junto Comisaría Sjm) San Juan De Miraflores Lima Lima ','eess_default.png','-12.1574558','-76.9751522','980059494','San Juan De Miraflores','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO JOSEPH GERARD RUYS','Sector A  Brisas De Santa Rosa 1Ra Etapa  Mz. M Lte. 01 ','eess_default.png','-11.9640658','-77.0801899','936347053','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('INSTITUTO NACIONAL DE SALUD MENTAL "HONORIO DELGADO - HIDEYO NOGUCHI"','Jirón Jr. Eloy Espinoza Saldaña 709 - Urb. Palao ','eess_default.png','-12.0199185','-77.0554348','7485600','San Martin De Porres','Lima','Lima','Minsa','Institutos De Salud Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL I OCTAVIO MONGRUT MUÑOZ','Avenida Parque De Las Leyendas 255 San Miguel Lima Lima ','eess_default.png','-12.0659612','-77.0945832','3198060','San Miguel','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ESSALUD - HOSPITAL I JORGE VOTO BERNALES CORPANCHO','Carretera Carretera Central Km. 3.5 Nº 1351 Carretera Central Km. 3.5 Nº 1351 Santa Anita Lima Lima ','eess_default.png','-12.04742267','-76.94735173','3544747','Santa Anita','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HUASCAR','Avenida Av. María Parado De Bellido S/N ( Alt. Cdra. 20 De César Vallejo) S/N Av. María Parado De Bellido S/N ( Alt. Cdra. 20 De César Vallejo) Santa Anita Lima Lima ','eess_default.png','-12.0404476','-76.9841798','3620170','Santa Anita','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CHANCAS DE ANDAHUAYLAS','Parque Cl Viru S/N Parque 4-Coop. Chancas De Andahuaylas - Santa Anita S/N Cl Viru S/N Parque 4-Coop. Chancas De Andahuaylas - Santa Anita Santa Anita Lima Lima ','eess_default.png','-12.0356921','-76.9640255','743 9889 ANEXO 3790','Santa Anita','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD LA ARBOLEDA','Calle 13 S/N E1 Unico La Arboleda Frente Del Colegio Iep Inka´S College Peru Santa Rosa Lima Lima ','eess_default.png','-11.80573511','-77.15830005','991186681','Santa Rosa','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD SAN CARLOS','Jirón Jr. Mariscal Santa Cruz S/N Aahh San Carlos S/N Jr. Mariscal Santa Cruz S/N Aahh San Carlos Santiago De Surco Lima Lima ','eess_default.png','-12.1529437','-77.0163502','01-2473112','Santiago De Surco','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE ATENCION PRIMARIA III SURQUILLO','Avenida Av Los Halcones 414 Urb Limatambo Av Los Halcones 414 Urb Limatambo Surquillo Lima Lima ','eess_default.png','-12.1042369','-77.020628','2223113','Surquillo','Lima','Lima','Essalud','Policlinicos,Consultorios Medicos Y De Profesionales De La Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO EL SOL DE VILLA','Sector 2 Grupo 6 Mz R Lote 1 Al 4 ','eess_default.png','-12.2013211','-76.9423404','982081932','Villa El Salvador','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD PRINCIPE DE ASTURIAS','Aa.Hh. Principe De Asturias S/N Lt 17-Iv Etapa De Pachacamac N° S/N ','eess_default.png','-12.2303369','-76.9112117','2933917','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN SEBASTIAN','Jirón Jr. Ica 774-778 Jr. Ica 774-778','eess_default.png','-12.0428657','-77.0387974','4251830','Lima','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('LA FRATERNIDAD','Nucleo De Serv. Zona S - Huaycan Nucleo De Serv. Zona S - Huaycan Ate Lima Lima ','eess_default.png','-12.0225134','-76.8076659','5849027','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SAN FERNANDO','Jirón Jr.Jose Santos Chocano Cdra.01 S/N - Urb.Valdiviezo S/N Jr.Jose Santos Chocano Cdra.01 S/N - Urb.Valdiviezo Ate Lima Lima ','eess_default.png','-12.0600611','-76.9964076','1-3263383','Ate','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SAN BENITO','Mz W1 Lote 2 - San Benito 4Ta Etapa Mz W1 Lote 2 - San Benito 4Ta Etapa Carabayllo Lima Lima ','eess_default.png','-11.8184648','-77.0471714','01-7174338','Carabayllo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD JUAN PABLO II','Jirón Jr. San Fernando Mz N Lt. 11 - Aahh Juan Pablo Ii Jr. San Fernando Mz N Lt. 11 - Aahh Juan Pablo Ii Carabayllo Lima Lima ','eess_default.png','-11.82843292','-77.06889366','01-550-2689','Carabayllo','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO SAN SEBASTIAN','Avenida Independencia S/N Santa Isabel De Villa Chorrillos Lima Lima ','eess_default.png','-12.20101238','-76.97877609','972185015','Chorrillos','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CLORINDA MALAGA','Pasaje Psje. Atahualpa S/N - Villa Clorinda N° S/N ','eess_default.png','-11.9661638','-77.0541862','5258070','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('JESUS MARIA','Avenida Av. Arnaldo Márquez 1750 ','eess_default.png','-12.0779014','-77.0530192','2624778 / 4637799','Jesus Maria','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD LOS OLIVOS','Jirón Jr Santa Cruz De Pachacutec,2Da Cuadra S/N - Urb Panamericana Norte S/N Jr Santa Cruz De Pachacutec,2Da Cuadra S/N - Urb Panamericana Norte Los Olivos Lima Lima ','eess_default.png','-11.99289373','-77.06562916','522-2309','Los Olivos','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('LOS OLIVOS DE PRO','Mz H1 Lote S/N,Sector A - Aahh Los Olivos De Pro N° S/N ','eess_default.png','-11.9510556','-77.0843759','5298364','Los Olivos','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('JICAMARCA','Avenida Av.13 De Junio Mz Ñ Lote 2-Ovalo Central Jicamarca Anexo 8 Av.13 De Junio Mz Ñ Lote 2-Ovalo Central Jicamarca Anexo 8 Lurigancho Lima Lima ','eess_default.png','-11.9807667','-76.9427212','(01) 7439889','Lurigancho','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SANTA CRUZ DE MIRAFLORES','Avenida Av. Jose Pardo N° 796 ','eess_default.png','-12.1189648','-77.0366847','01 - 4466746','Miraflores','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('ESSALUD - HOSPITAL III SUÁREZ ANGAMOS','Avenida Av. Angamos Este Nº 261 ','eess_default.png','-12.11346867','-77.02809522','(51) 1-2411950','Miraflores','Lima','Lima','Essalud','Hospitales O Clinicas De Atencion General');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD PICAPIEDRA','Avenida Av Real Mz J Lt 8 Centro Poblado Rural Picapiedra-Pachacamac Av Real Mz J Lt 8 Centro Poblado Rural Picapiedra-Pachacamac Pachacamac Lima Lima ','eess_default.png','-12.1874984','-76.867652','(51) 993272360','Pachacamac','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO BALNEARIOS DEL SUR','Calle Bartolome Herrera N° 100-102 Mz A Lote  10  De La Agrupacion De Familias Santa Cruz A Una Cuadra De La Municipalidad De Punta Hermosa Punta Hermosa Lima Lima ','eess_default.png','-12.33387783','-76.82315354','998952044','Punta Hermosa','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD LEONCIO PRADO','Avenida Av Alcazar Cuadra 3 - Urb Leoncio Prado ','eess_default.png','-12.0316958','-77.0302538','3821532','Rimac','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('POLICLINICO MUNICIPAL DE SAN ISIDRO','Calle Calle Paul Harris 205 ','eess_default.png','-12.1074758','-77.05116189','(51)1-5139000 (4002)','San Isidro','Lima','Lima','Municipalidad Distrital','Policlinicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MARISCAL CACERES','Avenida Mz. N8 Lt. 4 Urb. Mariscal Caceres (Alt. Pdo. 5 Av. El Muro) Mz. N8 Lt. 4 Urb. Mariscal Caceres (Alt. Pdo. 5 Av. El Muro) San Juan De Lurigancho Lima Lima ','eess_default.png','-11.9493125','-76.9812579','3927352','San Juan De Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('JOSE CARLOS MARIATEGUI V ETAPA','Mz. X1 Lote 1 Programa Mariscal Cáceres Sector Ii Mz. X1 Lote 1 Programa Mariscal Cáceres Sector Ii San Juan De Lurigancho Lima Lima ','eess_default.png','-11.931421','-76.990361','3926601','San Juan De Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CAJA DE AGUA','Jirón Urb Caja De Agua Jr. Moquegua 202 ','eess_default.png','-12.0268025','-77.015351','4583445','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SU SANTIDAD JUAN PABLO II','Jirón Esquina Jiron El Paso Y Jiron El Paralelo S/N - Aahh Juan Pablo Ii S/N Esquina Jiron El Paso Y Jiron El Paralelo S/N - Aahh Juan Pablo Ii San Juan De Lurigancho Lima Lima ','eess_default.png','-11.9448193','-76.9905243','2863419','San Juan De Lurigancho','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD JESUS PODEROSO','Pueblo Joven Jesus Poderoso Lote C Mz T S/N Pamplona Baja N° S/N ','eess_default.png','-12.1305597','-76.951192','01-2768398','San Juan De Miraflores','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD VALLE SHARON','Esq. De Los Alelís Y Cipreces S/N. Valle Sharon S/N Esq. De Los Alelís Y Cipreces S/N. Valle Sharon San Juan De Miraflores Lima Lima ','eess_default.png','-12.1710773','-76.9660961','014552291','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD LA RINCONADA','Mz T2 Lote 15 Aahh La Rinconada -Pamplona Alta Mz T2 Lote 15 Aahh La Rinconada -Pamplona Alta San Juan De Miraflores Lima Lima ','eess_default.png','-12.1265218','-76.9592706','1-2854570','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD HEROES DEL CENEPA','Jirón Jr. Heroes Del Cenepa Mz C Lt 20,Alt De Panam.Sur Km 24 Jr. Heroes Del Cenepa Mz C Lt 20,Alt De Panam.Sur Km 24 Villa El Salvador Lima Lima ','eess_default.png','-12.2486993','-76.9306076','7838778','Villa El Salvador','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD CRISTO SALVADOR','Parque St. 9 Gr. 2 Parque Central St. 9 Gr. 2 Parque Central Villa El Salvador Lima Lima ','eess_default.png','-12.2289642','-76.9194511','920070800','Villa El Salvador','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO KUYANAKUSUN','Parque Hernan Velarde 52 1 1 Santa Beatriz Altura De La Cuadra 2 De La Avenida Petit Thouars','eess_default.png','-12.0663367','-77.03560374','997748646','Lima','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO UNIVERSITARIO SAN MARCOS','Jirón German Amezaga 375 Al Lado De La Clinica Universitaria Unmsm','eess_default.png','-12.0556519','-77.08246864','(51) 997748302','Lima','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('INO DR. FRANCISCO CONTRERAS C.','Avenida Tingo María 398','eess_default.png','-12.0518041','-77.0550192','202-9060','Lima','Lima','Lima','Minsa','Institutos De Salud Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO RIJCHARIY (DESPIERTA)','Calle 37 N° S/N ','eess_default.png','-11.8142111','-77.1336228','(01) 7613936','Ancon','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HOSPITAL DE LIMA ESTE -VITARTE','Asociacion -  La Estrella .Avenida - Jose Carlos Mariategui 364 Ate Lima Lima ','eess_default.png','-12.0261339','-76.9173085','4172923','Ate','Lima','Lima','Minsa','Hospitales O Clinicas De Atencion Especializada');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO SANTISIMA VIRGEN DE LA CRUZ','Mz A Lote 1 Asociacion De Vivienda Nuestra Señora De La Santisima Cruz ','eess_default.png','-12.0558075','-76.9528728','7439889 anexo 4070','Ate','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('SEÑOR DE LOS MILAGROS','Avenida Av. 15 De Julio S/N Área De Serv. Zona K Huaycan Numero S/N ','eess_default.png','-12.0265333','-76.8226607','3716119','Ate','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('HUASCATA','Mz N Lote 05 Aahh Cerro Vecino Huascata-Chaclacayo ','eess_default.png','-11.993645','-76.819316','(51)3591080','Chaclacayo','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD VILLA VENTURO','Calle Calle Jauja S/N. N° S/N ','eess_default.png','-12.1875226','-77.0126753','941826069','Chorrillos','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD VISTA ALEGRE DE VILLA','Calle Calle Jose Carlos Mariategui S/N S/N Calle Jose Carlos Mariategui S/N Chorrillos Lima Lima ','eess_default.png','-12.1870541','-76.9926975','01-2485774','Chorrillos','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('COLLIQUE III ZONA','Avenida Av Santa Rosa Cuadra 9 S/N - Collique 3Era Zona S/N Av Santa Rosa Cuadra 9 S/N - Collique 3Era Zona Comas Lima Lima ','eess_default.png','-11.9147365','-77.026223','8329543','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD CARLOS A. PROTZEL','Avenida Av Belaunde Este - 2Da Cuadra S/N N° S/N ','eess_default.png','-11.9402602','-77.0471573','5412433','Comas','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('7 DE OCTUBRE','Avenida Av.Santa Rosa S/N Vi Zona - Aahh 7 De Octubre S/N Av.Santa Rosa S/N Vi Zona - Aahh 7 De Octubre El Agustino Lima Lima ','eess_default.png','-12.055972','-76.994256','3264766','El Agustino','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PRIMAVERA','Calle Urb. Primavera Calle 23 De Setiembre S/N N° S/N ','eess_default.png','-12.0344562','-77.0055986','(51) 1-3853072','El Agustino','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO MATERNO INFANTIL TAHUANTINSUYO BAJO','Avenida Av. Chinchaysuyo Cuadra 4 - Urb. Tahuantinsuyo Av. Chinchaysuyo Cuadra 4 - Urb. Tahuantinsuyo Independencia Lima Lima ','eess_default.png','-11.9784658','-77.0529828','526-1100','Independencia','Lima','Lima','Minsa','Centros De Salud Con Camas De Internamiento');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO SOL DE CHOSICA','Jirón Trujillo Norte 305 Moyopampa A 3 Cuadras Del Parque Echenique Lurigancho Lima Lima ','eess_default.png','-11.9337634','-76.6933049','991452804','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('VILLA  DEL SOL','Mz. J,Lote 4 Coop. Villa Del Sol Mz. J,Lote 4 Coop. Villa Del Sol Lurigancho Lima Lima ','eess_default.png','-11.96432','-76.9343332','3600044','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('YANACOTO','Avenida Av.Lima Mz. F - Lote 14 - Aahh Yanacoto 2Da Zona ','eess_default.png','-11.948348','-76.729942','(51) 1-3644238','Lurigancho','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD GUAYABO','Avenida Av San Juan Mz H Lt 2 Centro Poblado Rural Guayabo-Pachacamac Av San Juan Mz H Lt 2 Centro Poblado Rural Guayabo-Pachacamac Pachacamac Lima Lima ','eess_default.png','-12.1989006','-76.8730961','947144437','Pachacamac','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD LADERAS DE CHILLON','Avenida Av Vía De Integracion S/N - Mz C1 Lt 3A,1Era. Explanada Aahh Laderas De Chillon S/N Av Vía De Integracion S/N - Mz C1 Lt 3A,1Era. Explanada Aahh Laderas De Chillon Puente Piedra Lima Lima ','eess_default.png','-11.92118965','-77.08441957','551-0159','Puente Piedra','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MARISCAL CASTILLA','Prolongación Prolong. Sancho Davila S/N (Jr Pedro Arzola S/N) - Aa.Hh. Mariscal Castilla / Urb. El Bosque S/N Prolong. Sancho Davila S/N (Jr Pedro Arzola S/N) - Aa.Hh. Mariscal Castilla / Urb. El Bosque Rimac Lima Lima ','eess_default.png','-12.0178541','-77.0320255','3816345','Rimac','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD MENTAL COMUNITARIO RICARDO PALMA','Asociacion De Vivienda Tradiciones Ricardo Palma  Mz G Lte 17 ','eess_default.png','-12.1851036','-76.9615319','987600170','San Juan De Miraflores','Lima','Lima','Minsa','Centros Medicos Especializados');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD LEONCIO PRADO','Mz I-10 Lote 6- Sector Leoncio Prado Mz I-10 Lote 6- Sector Leoncio Prado San Juan De Miraflores Lima Lima ','eess_default.png','-12.136654','-76.961406','(51) 1-2857156','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD 5 DE MAYO','Jirón Jr. Libertad Mz.A6-Lote 28-Sector 5 De Mayo-Pamplona Alta ','eess_default.png','-12.132473','-76.9625893','01-2853628','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('PUESTO DE SALUD PAMPAS DE SAN JUAN','Avenida Av. Pedro Silva Cdra. 10 S/N Zona C S/N Av. Pedro Silva Cdra. 10 S/N Zona C San Juan De Miraflores Lima Lima ','eess_default.png','-12.166744','-76.967681','01-4508370','San Juan De Miraflores','Lima','Lima','Minsa','Puestos De Salud O Postas De Salud');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('MUNAY KAWAY ( VIVIR EN ARMONIA )','Avenida Carlos Izaguirre N° 1320 Manzana C Lote 04 Urbanización Las Margaritas ','eess_default.png','-11.9814397','-77.0969718','986174030','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD SAN JUAN DE SALINAS','Jirón Jr. Turquesas S/N°,Parque 8,Asociacion De Vivienda El Rosario Del Norte S/N Jr. Turquesas S/N°,Parque 8,Asociacion De Vivienda El Rosario Del Norte San Martin De Porres Lima Lima ','eess_default.png','-11.9841531','-77.0853237','5850023','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');
            INSERT INTO T_LECT_EESS (nombre_eess,dir_eess,img_eess,gps_lat,gps_lon,telf,distrito,provincia,departamento,institucion,tipo) VALUES ('CENTRO DE SALUD GUSTAVO LANATTA LUJAN','Jirón Jr Felix De Valle 505 - Urb Condevilla 2Da Etapa Jr Felix De Valle 505 - Urb Condevilla 2Da Etapa San Martin De Porres Lima Lima ','eess_default.png','-12.0242216','-77.0732396','5861881','San Martin De Porres','Lima','Lima','Minsa','Centros De Salud O Centros Medicos');              
          `);
          
          await db.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS T_05_REGISTRO_EVENTOS (
              ideven INTEGER NOT NULL,
              iduser TEXT NOT NULL,
              tipo INT NULL,
              fecha varchar(10),
              hora varchar(10),
              descrip varchar(2000),
              alarma INT NULL,
              estado INT NULL,
              PRIMARY KEY (ideven, iduser)
              );
          `);
-
          await db.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS T_05_REGISTRO_SUPLEMENTOS (
              idsuple INTEGER NOT NULL,
              iduser TEXT NOT NULL,              
              fecha varchar(10) NOT NULL,
              tipo_suple INT NULL,
              foto varchar(100) NULL,
              nro_sema INT NULL,
              destinationUri varchar(200) NULL,
              PRIMARY KEY (idsuple, iduser)
              );
          `);
        
          await db.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS T_05_REELS_VIDEO (
            idreel INTEGER NOT NULL PRIMARY KEY,                                 
            descrip varchar(200) NULL,              
            rutavideo varchar(100) NULL,
            obs varchar(500) NULL 
            );      
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (1, 'Cayhua Rellena', 'z5HSfDxoxxE', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (2, 'Lentejitas', 'j6CqeYAGcKA', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (3, 'Tallarines verdes', 'nTcVbTTfMs4', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (4, 'Higado encebollado', 'c46b2s3kPUs', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (5, 'Causa de sangresita', '4sh94k24RGY', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (6, 'Trigo a la jardinera', 'n9K0jbTqiQE', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (7, 'Tallarin con pescado', 'gyr1wtjiZr8', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (8, 'Bofe a la jardinera', 'jdLFZZIknQU', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (9, 'Sudado con lenteja', 'stX5sFPPSVE', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (10, 'Garbanzo con higado', 'ldM144pPcdQ', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (11, 'Trigo con carne de res', 'Mi6IJOCVPL0', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (12, 'Arroz Primaveral', 'lStxb_VlYlE', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (13, 'Olluco con carne seca', 'rWMw8zQlKoE', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (14, 'Mondonguito', 'goUh4wIZk6A', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (15, 'Vainita Salteada', '-y_eafxJG4E', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (16, 'Higado Primaveral', 'LZESr7VxaW8', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (17, 'Escabeche de Bazo', '4ucNLR-xz0s', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (18, 'Lentejas con pota', 'mx1B8agyCcA', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (19, 'Uchu de pallar', 'tbCvkF5V1FQ', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (20, 'Crema de garbanzo', '9LJqoKKha4k', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (21, 'Seco de higado', 'FIzNub6EVU4', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (22, 'Higado en jugo de limón', 'BUiZ5vz4NBQ', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (23, 'Picante de pallares con relleno', 'syJY9PD5wkA', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (24, 'Tallarin con pescado', '8AlUjHE4HjQ', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (25, 'Chaufa de quinua y trigo', 'rQPyzwiAi3A', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (26, 'Tortilla de sangresita', 'HEn0tnG7w4o', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (27, 'Chanfainita con trigo', 'ZL-P6no0qPA', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (28, 'Tallarin con chanfainita', 'B5rnyQptZZ4', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (29, 'Molleja saltada', '3O1gomcVZUI', NULL);
        INSERT INTO T_05_REELS_VIDEO (idreel,descrip,rutavideo,obs) VALUES (30, 'Cau cau', 'JpzCQWOkcfA', NULL);      
        `);

        await db.execAsync(`
        DROP VIEW IF EXISTS vista_gesta;
        CREATE VIEW IF NOT EXISTS vista_gesta AS
        SELECT 
            G.iduser,
            SUM(IFNULL(G.score_gesta, 0)) AS total_score_sumado,
            G.nrosemas_actual,
            G.hemoglo
        FROM (			
            SELECT
                T.iduser, T.semanita_actual AS nro_sema,
                (CASE WHEN T.hemoglo < 11 THEN (total_pictu * 5) ELSE (total_pictu * 10) END) AS score_gesta,
                M.nroseman AS nrosemas_actual, T.fecha, T.hemoglo
            FROM (								
                SELECT
                    X.iduser, CAST(Y.hemoglo AS FLOAT) AS hemoglo, X.fecha,
                    COUNT(DISTINCT (X.idsuple || X.iduser)) AS total_pictu, X.nro_sema,
                    (CASE WHEN Y.calcu_nrodias > 0 THEN (Y.calcu_nrosema + 1) ELSE Y.calcu_nrosema END)
                    AS nrosemas_actual,
                    MAX(D.nroseman) AS semanita_actual
                FROM T_05_REGISTRO_SUPLEMENTOS X
                JOIN T_05_ETAPA_GESTACIONAL Y ON Y.id = X.iduser
                JOIN T_05_DIAS_GESTACION D ON D.iduser = X.iduser AND D.fec_diagesta = X.fecha
                GROUP BY X.iduser,X.fecha
            ) AS T  
            LEFT JOIN (
                SELECT A.iduser, A.nroseman
                FROM T_05_DIAS_GESTACION A
                JOIN (
                    SELECT iduser, MAX(fecha) AS fecha
                    FROM T_05_REGISTRO_SUPLEMENTOS  
                    GROUP BY iduser
                ) B ON B.iduser = A.iduser AND B.fecha = A.fec_diagesta
                
            ) M ON M.iduser = T.iduser					
        ) AS G
        WHERE G.nro_sema = G.nrosemas_actual
        GROUP BY G.iduser;
      `); 
      
      await db.execAsync(`
        DROP VIEW IF EXISTS vista_gesta_first;
        CREATE VIEW IF NOT EXISTS vista_gesta_first AS
        SELECT 
        R.id,
        0 as total_score_sumado,
        R.calcu_nrosema as nrosemas_actual,
        R.hemoglo,
        CASE
          WHEN R.hemoglo < 11 AND R.calcu_nrosema BETWEEN 8 AND 10 THEN 'Valiente guerrera'
          WHEN R.hemoglo < 11 AND R.calcu_nrosema BETWEEN 11 AND 13 THEN 'Despierta guerrera'
          WHEN R.hemoglo >= 11 AND R.calcu_nrosema BETWEEN 14 AND 16 THEN 'Iniciadora del hierro'
          WHEN R.hemoglo >= 11 AND R.calcu_nrosema BETWEEN 17 AND 19 THEN 'Aspirante del hierro'
          WHEN R.hemoglo >= 11 AND R.calcu_nrosema BETWEEN 20 AND 22 THEN 'Exploradora del hierro'
          WHEN R.hemoglo >= 11 AND R.calcu_nrosema BETWEEN 23 AND 25 THEN 'Guerrera del hierro'
          WHEN R.hemoglo >= 11 AND R.calcu_nrosema BETWEEN 26 AND 28 THEN 'Defensora del hierro'
          WHEN R.hemoglo >= 11 AND R.calcu_nrosema BETWEEN 29 AND 31 THEN 'Dama de hierro'
          WHEN R.hemoglo >= 11 AND R.calcu_nrosema BETWEEN 32 AND 34 THEN 'Princesa de hierro'
          WHEN R.hemoglo >= 11 AND R.calcu_nrosema BETWEEN 35 AND 37 THEN 'Reina de hierro'
          WHEN R.hemoglo >= 11 AND R.calcu_nrosema BETWEEN 38 AND 40 THEN 'Emperatriz de hierro'
          ELSE 'Iniciadora del hierro'
        END AS level_gesta
      FROM T_05_ETAPA_GESTACIONAL R;
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
  useEffect(() => {
    (async () => {

      setupBackendNotifications();

      // 1️⃣ Configurar notificaciones de ambos módulos
      await setupNotifications();          // Canal sync
      await setupAlarmNotifications();     // Canal alarmas
      await setupEventosNotifications();

      // 2️⃣ Registrar tareas BackgroundFetch
      await registerBackgroundSync();       // Cada 3 min
      await registerAlarmBackgroundTask();  // Cada 1 min
      await registerEventosBackgroundTask();  // Cada 1 min

      // 3️⃣ Mantener tarea en foreground (opcional)
      const interval = setInterval(async () => {
        console.log("⏱️ Ejecutando SYNC en foreground cada 3 minutos...");
        await performSync(); // Solo para syncTask
      }, 180 * 1000);

         // 4️⃣ Ejecutar ALARMA cada 1 minuto en foreground
         const alarmInterval = setInterval(async () => {
          console.log("⏰ Ejecutando ALARMA en foreground cada 1 minuto...");
          await alarmabbSync(); // Tu función de la segunda tarea
        }, 50 * 1000); // 1 minuto

         // 5 Ejecutar EVENTOS cada 1 minuto en foreground
         const eventsInterval = setInterval(async () => {
          console.log("⏰ Ejecutando EVENTOS en foreground cada 1 minuto...");
          await eventosSync(); // Tu función de la tercera tarea
        }, 40 * 1000); // 1 minuto

        return () => {
          clearInterval(interval);
          clearInterval(alarmInterval);
          clearInterval(eventsInterval);
        };
      })();
    }, []);
  return (
    <NetworkProvider>
      <NetworkBanner />
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
                  options={{ title: ''
                  ,
                    headerStyle: {
                        backgroundColor: '#fff', // Color de fondo de la barra de navegación
                        height: 20, // Ajusta la altura
                    },
                    headerLeft: () => null,                    
                   }}
                />

                <Stack.Screen name='Hemoglo' component={HemoScreen} options={{
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

            </Stack.Navigator>
        </NavigationContainer>
      </SQLiteProvider>
    </NetworkProvider>
  );
}

//LoginScreen component
const LoginScreen = ({navigation}) => {
  const { isConnected, isInternetReachable } = getCurrentNetworkState();
    const db = useSQLiteContext();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null); // Estado para rastrear qué TextInput está activo
    const userEmailRef = useRef(null);
    const userpasswordRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    useEffect(() => {
      if (userEmailRef.current) {
        userEmailRef.current.focus();
        setFocusedInput('userName'); // Aplicar el estilo resaltado
      }
    }, []);

    const syncAllData = async(users) => {
      try {
        const sync_datagesta = await apiFetch(
          "/getalldatauser",
          { method: "POST", body: JSON.stringify(users) },
          true
        );
    
        console.log("📦 Datos recibidos:", JSON.stringify(sync_datagesta, null, 2));
    
        // Pasar el JSON a la función de sincronización
        await syncCenanData(sync_datagesta.CENAN2025,users.username);
        
        await SecureStore.deleteItemAsync('syncfirstdata');
        await SecureStore.setItemAsync('syncfirstdata', 'ok');

        console.log("✅ Todos los datos sincronizados con SQLite");
      } catch (err) {
        console.error("❌ Error sincronizando datos:", err);
      }
    }
    
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
          
          //Add descarga de info gesta
          if (isConnected || isInternetReachable) {
          const syncfirst = await SecureStore.getItemAsync('syncfirstdata');
          if(syncfirst!='ok'){
            const usersrv = await apiFetch('/signin', {
              method: 'POST',
              body: JSON.stringify({
                username: userName.toLowerCase(),
                password: password,
              }),
            });           
            console.log(usersrv);
            if (usersrv?.token) {
              await SecureStore.deleteItemAsync('authToken');
              await SecureStore.setItemAsync('authToken', usersrv.token);
              console.log('✅ Token guardado con éxito si existe en el servidor este usuario');
              setLoading(true);
              setLoadingMessage("📡 Importando datos del servidor...");
              await syncAllData({username: userName.toLowerCase()});
              setLoading(false);
              setLoadingMessage("");
            }

            if(!usersrv || usersrv==null){
              console.log('salio error en api la llamada');              
            }
          }
        }

          //Fin Add descarga de info gesta

            const user = await db.getFirstAsync('SELECT id,LOWER(username) as username,password,dni,nombape,lati,longi,altura,lati_viv,longi_viv,altura_viv,profileImage FROM users WHERE LOWER(username) = ?', [userName.toLowerCase()]);
            //Alert.alert('Error', `Usuario no Existe! ${user.username}`);
            if (!user) {
                Alert.alert('Error', 'Usuario no Existe!');
                //Alert.alert('Error', `Usuario no Existe! ${user.username}`);
                userEmailRef.current.focus(); // Enfocar automáticamente
                setFocusedInput('userName'); // Resaltar el campo
                navigation.navigate('Register');
                return;
            }
            const validUser = await db.getFirstAsync('SELECT id,LOWER(username) as username,password,dni,nombape,lati,longi,altura,lati_viv,longi_viv,altura_viv,profileImage FROM users WHERE LOWER(username) = ? AND password = ?', [userName.toLowerCase(), password]);
            
      if(validUser) {
                           
              if (isConnected || isInternetReachable) {
              console.log('Conectado a Internet :'); 
                              
              const cleanData = Object.fromEntries(
                Object.entries(validUser).filter(([_, v]) => v != null && v !== '')
              );

              const { status } = await Notifications.requestPermissionsAsync();
              cleanData.expopushtoken =
                status === "granted"
                  ? (await Notifications.getExpoPushTokenAsync()).data
                  : null;
             console.log('expopushtoken mira1 : ',cleanData.expopushtoken);                   
			  
              const result = await apiFetch('/newuserfirstsign', {
                                method: 'POST',
                                body: JSON.stringify(cleanData),
                              });	
            console.log('mira loguio resultzzzz cayo : ',result);
            let responselogi;                              	
            if (result?.status === 'OK' && result?.data?.createdPerson) {
              console.log('Usuario logueado se guardo en postgres :',validUser);
                responselogi = await apiFetch('/signin', {
                method: 'POST',
                body: JSON.stringify({
                  username: userName.toLowerCase(),
                  password: password,
                }),
              });
            }

              if (responselogi?.token) {
                await SecureStore.deleteItemAsync('authToken');
                await SecureStore.setItemAsync('authToken', responselogi.token);
                console.log('✅ Token guardado con éxito');
              }

        }

        //Add 04112025
        //console.log('validUser');
        //console.log(validUser);
        const infogesta = await db.getFirstAsync('SELECT id,opcgesta,fur,fec_proba_parto,eco_nro_sem_emb,eco_nro_dias_emb,hemoglo,calcu_nrosema,calcu_nrodias,calcu_nrodias_parto,calcu_fecaprox_parto FROM T_05_ETAPA_GESTACIONAL WHERE id = ?', [validUser.id]);
        const opcgesta = infogesta?.opcgesta || null;        
        const fur = infogesta?.fur || null;    
        const fec_proba_parto = infogesta?.fec_proba_parto || null;        
        const eco_nro_sem_emb = infogesta?.eco_nro_sem_emb || null; 
        const eco_nro_dias_emb = infogesta?.eco_nro_dias_emb || null;        
        const hemoglo = infogesta?.hemoglo || null;
        
        //ADD 12112025
        await SecureStore.deleteItemAsync('userlogintask');              
        await SecureStore.setItemAsync('userlogintask', validUser.id);
        //
        if(opcgesta!=null && hemoglo!=null && (fur !=null || fec_proba_parto !=null || (eco_nro_sem_emb !=null || eco_nro_dias_emb !=null) ) ){
          Alert.alert('Correcto', `Login Exitoso`);  
          console.log('Ingrese!! TabNavigator');
          navigation.navigate('TabNavigator', { user:validUser });
        }else{
          console.log('Ingrese!! Home');
          Alert.alert('Correcto', `Login Exitoso`);
          navigation.navigate('Home', {user:validUser});
        }
       
        //

                //Alert.alert('Correcto', `Login Exitoso ${validUser.id}`);
                //Alert.alert('Correcto', `Login Exitoso`);
                //navigation.navigate('Home', {user:validUser});
                setUserName('');
                setPassword('');
      } else {
                Alert.alert('Error', 'Password Incorrecto');
            }
  } catch (error) {
            console.log('Error durante el Login : ', error);
        }
    }

    const showDateLogin = new Date(); 
    const formatDateLogin = format(showDateLogin, 'dd/MM/yyyy');

    return (  
      <>
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar backgroundColor="#fff" barStyle="light-content" />
        <KeyboardAvoidingView>
          <ScrollView>
            <View className="flex-1 bg-gray-100">
              <View className="p-8 bg-fuchsia-800 rounded-t-3xl shadow-md w-full">
                <Text className="text-[35px] font-bold text-white text-center mt-6">
                  Bienvenidas
                </Text>                               
              </View>
            </View>
            <View style={styles.containerAdjusted}>
              <Image source={logo} style={styles.logo} />
              <Text className="text-center mt-2 text-fuchsia-500 font-bold">
                  Versión: {Constants.expoConfig?.version || 'Desconocida'} - {formatDateLogin} 
              </Text>
              <View style={styles.inputContainer}>
                <Icon name="mail-outline" size={25} style={styles.icon} />
                <TextInput
                  ref={userEmailRef}
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
                  returnKeyType="next"
                  onSubmitEditing={() => userpasswordRef.current.focus()}
                />
              </View>
              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={25} style={styles.icon} />
                <TextInput
                  ref={userpasswordRef}
                  style={[
                    styles.input,
                    focusedInput === 'password' && styles.inputFocused,
                  ]}
                  placeholder="Password"
                  secureTextEntry={!showPassword} // Cambia según el estado de visibilidad
                  value={password}
                  maxLength={10}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                {/* Botón para mostrar/ocultar contraseña */}
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Icon
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={25}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              <Pressable style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </Pressable>
              <Pressable
                style={styles.link}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.linkText}>No tienes una cuenta? Registrate</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {loading && (
  <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex justify-center items-center z-50">
    <View className="bg-white p-6 rounded-2xl shadow-lg items-center w-64">
      <ActivityIndicator size="large" color="#9333ea" />
      <Text className="text-gray-800 text-base font-semibold mt-4 text-center">
        {loadingMessage || "Importando datos..."}
      </Text>
    </View>
  </View>
)}
    </>
    )
}

//RegisterScreenComponent
const RegisterScreen = ({navigation}) => {
  const { isConnected, isInternetReachable } = getCurrentNetworkState();

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

            const existingUser = await db.getFirstAsync('SELECT * FROM users WHERE username = ?', [userName.toLowerCase()]);
            if (existingUser) {
                Alert.alert('Error', 'Usuario ya existe.');
                emailRef.current.focus(); // Enfocar automáticamente
                setFocusedInput('userName'); // Resaltar el campo
                navigation.navigate('Login');
                return;             
            }
         
            /*
            const vid = await Crypto.randomUUID();
            console.log('vid generado :',vid);
            const result = await db.runAsync('INSERT INTO users (id,username, password,dni,nombape,lati,longi,altura) VALUES (?,?, ?,?, ?, ?,?, ?)', [vid,userName.toLowerCase(), password,userDni,userNomb,latitude,longitude,altitude]);
            */

            //add nuevo  grabado a postgres 21102025
            // 1️⃣ Generar ID único
            const vid = await Crypto.randomUUID();
            console.log('vid generado:', vid);

            // 2️⃣ Construir objeto de usuario
            const userData = {
              id: vid,
              username: userName.toLowerCase(),
              password,
              dni: userDni,
              nombape: userNomb,
              lati: latitude?.toString() || null,
              longi: longitude?.toString() || null,
              altura: altitude?.toString() || null,
              lati_viv: '',
              longi_viv: '',
              altura_viv: '',
              profileimage: '',
            };

            const cleanData = Object.fromEntries(
              Object.entries(userData).filter(([_, v]) => v != null && v !== '')
            );

            const columns = Object.keys(cleanData).join(', ');
            const placeholders = Object.keys(cleanData).map(() => '?').join(', ');
            const values = Object.values(cleanData);
            
            let resultuser;
            try {
            resultuser = await db.runAsync(`INSERT INTO users (${columns}) VALUES (${placeholders})`, values);
            console.log('Usuario guardado localmente:', cleanData);
          } catch (err) {
            console.log('❌ Error al guardar usuario bdlocal:', err);
            console.error('❌ Error al sincronizar usuario:', err);
            Alert.alert('Error', `columns : ${columns} - placeholders : ${placeholders} - resultuser : ${resultuser}`);
            return;
          }

                                 
          if (isConnected || isInternetReachable) {
            console.log('Conectado a Internet :');                     
                try {

                  const { status } = await Notifications.requestPermissionsAsync();
                  cleanData.expopushtoken =
                    status === "granted"
                      ? (await Notifications.getExpoPushTokenAsync()).data
                      : null;
                 console.log('expopushtoken mira2 : ',cleanData.expopushtoken);

                  const result = await apiFetch('/newuserfirstsign', {
                    method: 'POST',
                    body: JSON.stringify(cleanData),
                  });

                  console.log('✅ Usuario sincronizado con el servidor:', result);
                } catch (err) {
                  console.log('❌ Error al sincronizar usuario:', err);
                  //console.error('❌ Error al sincronizar usuario:', err);
                  //Alert.alert('Error', 'No se pudo sincronizar con el servidor.');
                  return;
                }              
          }

            //fin add nuevo  grabado a postgres 21102025
            
            Alert.alert('Correcto', 'Registro Completado exitosamente!');
            //const insertedId = result.lastInsertRowId;
            //Alert.alert('Correcto', `Registro completado exitosamente! ID: ${insertedId}`);
            //navigation.navigate('Home', {user : userName});
            console.log('Pase a Minuscula a Grabar User : ', userNomb.toLowerCase());
            navigation.navigate('Login');
           
        } catch (error) {
            console.log('Error durante el registro : ', error);
        }
   
      
    }

    return (
      <SafeAreaView className="flex-1 bg-gray-100">
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
    </SafeAreaView> 
    )
}

//HomeScreen component
const HomeScreen = ({navigation, route}) => {
    const db = useSQLiteContext();
    const { user } = route.params;
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
      
      const [opcgesta, setOpcgesta] = useState(''); // Estado para el valor de hemoglobina
      
      useEffect(() => {
        const loadOpcgesta = async () => {
          try {
            const result = await db.getFirstAsync(
              'SELECT opcgesta FROM T_05_ETAPA_GESTACIONAL WHERE id = ?',
              [user.id]
            );
            if (result?.opcgesta) {
              setOpcgesta(result.opcgesta.toString());
            }
          } catch (error) {
            console.log('Error al cargar la opcgesta:', error);
          }
        };
    
        loadOpcgesta();
      }, [db, user.id]);

      console.log('loadOpcgesta xxx: : ',opcgesta);
      let filteredList;      
      if (!opcgesta || isNaN(opcgesta) || opcgesta=='') {
        filteredList = categoryList;
      }else{
        filteredList = categoryList.filter(item => item.id === opcgesta);
      }
      

      const handleNavigation = (id) => {
        switch (id) {
          case '1':
            navigation.navigate('Fur',{user : user});
            handleOpcionGesta('1');
            break;
          case '2':
            navigation.navigate('Eco',{user : user});
            handleOpcionGesta('2');
            break;          
          case '3':
            navigation.navigate('Parto',{user : user});
            handleOpcionGesta('3');
            break;     
          default:
            console.log('Opción no válida');
        }
      };

    //we'll extract the user parameter from route.params
    const handleOpcionGesta = async(opc) => {   
          try {
            console.log('handleOpcionGesta pa grabar miraa : ',opc);
           
            const existsgesta = await db.getFirstAsync(
              'SELECT opcgesta FROM T_05_ETAPA_GESTACIONAL WHERE id = ?',
              [user.id]
            );

            if (existsgesta) {
              await db.runAsync(
                'UPDATE T_05_ETAPA_GESTACIONAL SET opcgesta = ? WHERE id = ?',
                [opc, user.id]
              );             
            } else {
              await db.runAsync(
                'INSERT INTO T_05_ETAPA_GESTACIONAL (id, opcgesta) VALUES (?, ?)',
                [user.id, opc]
              );             
            }
          
          } catch (error) {
            console.log('Error durante el registro de handleOpcionGesta:', error);
          }
        }
    
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
      const screenWidth = Dimensions.get('window').width;
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 justify-start items-center px-4">
        {/* Título */}
        <Text className="mb-4 font-extrabold text-center text-[17px] bg-gradient-to-r from-purple-100 to-violet-200 p-2 text-blue-800 border border-green-700 rounded-xl shadow-lg" style={{ marginTop: 40 }}>
          <Text className="text-purple-700">
            En base a la información que manejes selecciona una opción para calcular tu edad gestacional
          </Text>
        </Text>

        {/* Lista de botones */}
        <FlatList
          data={filteredList}
          numColumns={1}
          contentContainerStyle={{
            paddingVertical: 10, // Espaciado vertical dentro del contenedor
            alignItems: 'center', // Centrar botones horizontalmente
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleNavigation(item.id)}
              className="my-2 rounded-lg bg-blue-650"
              style={{
                width: screenWidth - 60, // El ancho de cada botón es el 100% del ancho de la pantalla menos 40px (margen)
                height: 100, // Altura fija para todos los botones
                borderWidth: 1, // Borde
                borderColor: '#1E3A8A', // Color del borde (azul oscuro)
                alignItems: 'center', // Centrar contenido horizontalmente
                justifyContent: 'center', // Centrar contenido verticalmente
                marginHorizontal: 0, // Márgenes laterales
                marginBottom: 10, // Espaciado entre botones
              }}
            >
              {/* Imagen */}
              <Image
                source={imageMapping[item.id]}
                style={{
                  width: 60, // Ancho fijo para todas las imágenes
                  height: 60, // Altura fija para todas las imágenes
                  marginBottom: 10, // Espacio entre imagen y texto
                  resizeMode: 'contain',
                }}
              />
              {/* Título */}
              <Text className="text-[14px] font-bold text-center text-black">{item.title}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
      <FlotaButton />
    </SafeAreaView>
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

                //calculo semanas y dias de embarazo add 11122024
                    const today = new Date(); 
                    const pastDate = new Date(selectedDate);
                    const difference = differenceInDays(today, addDays(pastDate, -2) );
                    console.log('Diferencia en días:', difference);
                    const weeks = Math.floor(difference / 7);
                    const remainingDays = difference % 7;
                    console.log('Diferencia en semanas:', weeks);
                    console.log('Días restantes:', remainingDays);
                    const nrodiasaprox_parto = 280 - difference;
                    console.log('Nro Días Aprox parto:', nrodiasaprox_parto);
                    //const newDate = addDays(today, 280);
                    const newDate = addDays(selectedDate, 279);
                    const cal_fecaprox_parto = format(newDate, 'dd/MM/yyyy');
                    console.log('Fecha calculada Aprox parto:', cal_fecaprox_parto);

                //Fin calculo semanas y dias de embarazo add 11122024

                const valUserFur = await db.getFirstAsync('SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?', [user.id]);
                
                //Alert.alert('AlGrabar : ' + valUserFur.id, valUserFur.fur);  
                    if(valUserFur){
                        const resultudp =   await db.runAsync('UPDATE T_05_ETAPA_GESTACIONAL SET fur = ?,calcu_nrosema = ?,calcu_nrodias = ?,calcu_nrodias_parto = ?,calcu_fecaprox_parto = ? WHERE id = ?', [selectedDate,weeks,remainingDays,nrodiasaprox_parto,cal_fecaprox_parto,user.id]);  
                        //const resultudp =   await db.runAsync('UPDATE T_05_ETAPA_GESTACIONAL SET fur = ? WHERE id = ?', [user.id,selectedDate]);  
                        Alert.alert('Correcto', 'Registro FUR Actualizado exitosamente!');      
                        
                        //navigation.navigate('TabNavigator', {user:user});
                        //navigation.navigate('Home', {user:user});
                    }else{   
                        const resultins = await db.runAsync('INSERT INTO T_05_ETAPA_GESTACIONAL (id, fur,calcu_nrosema,calcu_nrodias,calcu_nrodias_parto,calcu_fecaprox_parto) VALUES (?,?,?,?,?,?)', [user.id, selectedDate,weeks,remainingDays,nrodiasaprox_parto,cal_fecaprox_parto]);
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
                    console.log('Diferencia en días:', difference);
                    const weeks = Math.floor(difference / 7);
                    const remainingDays = difference % 7;
                    console.log('Diferencia en semanas:', weeks);
                    console.log('Días restantes:', remainingDays);
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

                    insertAllDaysGestacion(db, selectedDate, user.id);
                                    
                    /////////////////Fin Add 10122024 Grabado marker semanas de embarazo para agenda/////////
                    //navigation.navigate('TabNavigator', {user:user});//comment for add hemoglobina 15122024
                    navigation.navigate('Hemoglo', {user:user});                             

                } catch (error) {
                    console.log('Error durante el registro del FUR : ', error);
                }finally {
                  // Aquí puedes realizar acciones que se ejecuten sin importar si ocurrió un error o no.
                  console.log('Proceso FUR terminado, ya sea con éxito o con error.');
                  //navigation.navigate('TabNavigator', {user:user});
                  
              }

        }

        /*const insertAllDaysGestacion = async (db, startDate, userId) => {
          const daysGestacion = 40 * 7; // 40 semanas equivalen a 280 días
          let currentDate = new Date(startDate); // Fecha inicial
          
          try {
            await db.runAsync('DELETE FROM T_05_DIAS_GESTACION WHERE iduser = $iduser', { $iduser: userId });
            console.log('entree insertAllDaysGestacion : ',currentDate);
            for (let i = 0; i < daysGestacion; i++) {
              // Formatear la fecha actual
              let fec_diagesta = format(currentDate, 'yyyy-MM-dd');
        
              // Calcular la semana de gestación actual
              let nroseman = Math.ceil((i + 1) / 7); // Cada 7 días se incrementa la semana
              //console.log('entree Grabar fec_diagesta : ',nroseman + ' - ' +  fec_diagesta);
              //console.log(`insert into T_05_DIAS_GESTACION(iduser,nroseman,fec_diagesta) values(`,user.id + `,'` + nroseman + `','` +  fec_diagesta + `');`);
              // Insertar en la tabla
              await db.runAsync(
                'INSERT INTO T_05_DIAS_GESTACION (iduser, nroseman, fec_seman, fec_diagesta) VALUES (?, ?, ?, ?)',
                [userId, nroseman, fec_diagesta, fec_diagesta]
              );
        
              // Avanzar al siguiente día
              currentDate = addDays(currentDate, 1);
            }
            console.log('Días registrados exitosamente');
          } catch (error) {
            console.error('Error al insertar días de gestación:', error);
          }
        };
        */

        const [isPressed, setIsPressed] = useState(false);
    return(
        <>
        <SafeAreaView className="flex-1 bg-gray-100">
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
          monthTextColor: '#85268d',
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
        isPressed ? 'bg-fuchsia-800' : 'bg-fuchsia-600'
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
        <FlotaButton />
        </SafeAreaView>        
    </>
    )   
}

const insertAllDaysGestacion = async (db, startDate, userId) => {
  const daysGestacion = 40 * 7; // 40 semanas equivalen a 280 días
  let currentDate = new Date(startDate); // Fecha inicial
  
  try {
    await db.runAsync('DELETE FROM T_05_DIAS_GESTACION WHERE iduser = $iduser', { $iduser: userId });
    console.log('entree insertAllDaysGestacion : ',currentDate);
    for (let i = 0; i < daysGestacion; i++) {
      // Formatear la fecha actual
      let fec_diagesta = format(currentDate, 'yyyy-MM-dd');

      // Calcular la semana de gestación actual
      let nroseman = Math.ceil((i + 1) / 7); // Cada 7 días se incrementa la semana
      //console.log('entree Grabar fec_diagesta : ',nroseman + ' - ' +  fec_diagesta);
      //console.log(`insert into T_05_DIAS_GESTACION(iduser,nroseman,fec_diagesta) values(`,user.id + `,'` + nroseman + `','` +  fec_diagesta + `');`);
      console.log(`insert into T_05_DIAS_GESTACION(iduser,nroseman,fec_diagesta) values(`,userId + `,'` + nroseman + `','` +  fec_diagesta + `');`);
      // Insertar en la tabla
      const result = await db.getFirstAsync(
        "SELECT COALESCE(MAX(id_diasg), 0) + 1 AS nextId FROM T_05_DIAS_GESTACION WHERE iduser = ?",
        [userId]
      );
      const nextId_diasg = result.nextId;

      await db.runAsync(
        'INSERT INTO T_05_DIAS_GESTACION (id_diasg,iduser, nroseman, fec_seman, fec_diagesta) VALUES (?,?, ?, ?, ?)',
        [nextId_diasg,userId, nroseman, fec_diagesta, fec_diagesta]
      );

      // Avanzar al siguiente día
      currentDate = addDays(currentDate, 1);
    }
    console.log('Días registrados exitosamente');
  } catch (error) {
    console.error('Error al insertar días de gestación:', error);
  }
};

const EcoScreen = ({navigation, route}) => {
    const db = useSQLiteContext();
    const { user } = route.params;
    const [selectedDate, setSelectedDate] = useState("");

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [open2, setOpen2] = useState(false);
    const [value2, setValue2] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  
    const [errorSemana, setErrorSemana] = useState(false);
    const [errorDias, setErrorDias] = useState(false);
    const [errorFec, setErrorFec] = useState(false);

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
          if (validUserEco.eco_fechaori) {
            setSelectedDate(validUserEco.eco_fechaori); // Debe venir como 'yyyy-MM-dd'
          }
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
    
    if (!selectedDate) {
      setErrorFec(true); 
      setErrorSemana(false); 
      setErrorDias(false);        
      Alert.alert("Error", "Por favor, completar el valor de Fecha.");
      return;
    }

    console.log('mira mi fechita ecoxxx',selectedDate);
    const wwww = new Date(selectedDate + "T00:00:00Z").toISOString();
    console.log('gaby2711 today wwww:', wwww);

    //Alert.alert('Error combate value :', value,value2);
    if (!value || value == 'null') {
      setErrorSemana(true); // Resalta el combo de semanas
      setErrorDias(false); // Asegura que el otro combo no se marque
      setErrorFec(false);      
      Alert.alert('Error', 'Por favor, selecciona una opción en el numero de semanas.');
      return;
    }
    if (!value2 || value2 == 'null') {
      setErrorDias(true); // Resalta el combo de días
      setErrorSemana(false); // Asegura que el otro combo no se marque
      setErrorFec(false);     
      Alert.alert('Error', 'Por favor, selecciona una opción en el numero de dias.');
      return;
    }

    //calculo semanas y dias de embarazo add 16122024
    //const today = new Date(); 
    const today = new Date(selectedDate + "T00:00:00Z").toISOString();
    console.log('gaby2711 today:', today);
   /*const pastDate = new Date(selectedDate);
    const difference = differenceInDays(pastDate,today);
    console.log('Diferencia en días:', difference);
 
    const nrodiasaprox_parto = 280 - difference;
    console.log('Nro Días Aprox parto:', nrodiasaprox_parto);
    */
    const weeks = value;
    const remainingDays = value2;
    console.log('Diferencia en semanas:', weeks);
    console.log('Días restantes:', remainingDays);
    console.log('guardadoBD calgesta: ', `Valor: ${value} - value2 : ${value2}`); 
    let nrosem = parseInt(value)*7;
    let nrodays = parseInt(value2);
    const totaldias = nrosem + nrodays;
    console.log('totaldias:', totaldias);  

    const fecinigesta = addDays(today, -(totaldias-1)); // Restar los días
    const fecsema1 = format(fecinigesta, 'yyyy-MM-dd');
    console.log('Fecha inicio Gestacion Semana1 :', fecsema1);

    const nrodiasaprox_parto = 279 - (totaldias-1);
    console.log('Nro Días Aprox parto:', nrodiasaprox_parto);

    
    const newDate = addDays(fecinigesta, 279);
    const cal_fecaprox_parto = format(newDate, 'dd/MM/yyyy');
    console.log('Fecha calculada Aprox parto:', cal_fecaprox_parto);  

    /*const fecinigesta = addDays(newDate, -280);
    const fecsema1 = format(fecinigesta, 'yyyy-MM-dd');
    console.log('Fecha inicio Gestacion Semana1 :', fecsema1); 
    */ 
    //Fin calculo semanas y dias de embarazo add 11122024

    const valUserEco = await db.getFirstAsync(
      'SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?',
      [user.id]
    );

    if (valUserEco) {
      await db.runAsync(
        'UPDATE T_05_ETAPA_GESTACIONAL SET eco_nro_sem_emb = ?, eco_nro_dias_emb = ?,calcu_nrosema = ?,calcu_nrodias = ?,calcu_nrodias_parto = ?,calcu_fecaprox_parto = ?,eco_fechaori = ? WHERE id = ?',
        [value, value2,value, value2,nrodiasaprox_parto,cal_fecaprox_parto,selectedDate, user.id]
      );
      Alert.alert('Correcto', 'Registro de Ecografia Actualizado exitosamente!');      
      //navigation.navigate('Home', {user:user});
    } else {
      await db.runAsync(
        'INSERT INTO T_05_ETAPA_GESTACIONAL (id, eco_nro_sem_emb, eco_nro_dias_emb,calcu_nrosema,calcu_nrodias,calcu_nrodias_parto,calcu_fecaprox_parto,eco_fechaori) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.id, value, value2,value, value2,nrodiasaprox_parto,cal_fecaprox_parto,selectedDate]
      );
      Alert.alert('Correcto', 'Registro de Ecografia Registrado exitosamente!');      
      //navigation.navigate('Home', {user:user});         
    }

    //grabando marcadores
    const datmarkereg = await db.getFirstAsync('SELECT * FROM T_05_AGENDA_GESTACIONAL WHERE id = ?', [user.id]);
                   
    await db.runAsync('DELETE FROM T_05_AGENDA_GESTACIONAL WHERE id = $id', { $id: user.id });
    console.log('Remove Agenda FPP:', 'RemoveAgenda FPP');
          
        const startDate = new Date(fecsema1); 
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
        console.log('inserte Agenda FPP:', 'INSAgenda FPP');

        const fechfurrest = addDays(today, -(totaldias-2)); // Restar los días
        const fechfur = format(fechfurrest, 'yyyy-MM-dd');

        console.log('Fecha inicio Gestacion FUR :', fechfur);

        insertAllDaysGestacion(db, fechfur, user.id); 
                 
  /////////////////Fin Add 16122024 Grabado marker semanas de embarazo para agenda/////////  
  navigation.navigate('Hemoglo', {user:user});  

  } catch (error) {
    console.log('Error al guardar los datos:', error);
  }


};

  const [isPressed, setIsPressed] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
    return (
      <>
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center bg-gray-100 -mt-100">       
          <View style={styles.containercalendario}>
            <Text style={styles.title}>ECOGRAFIA</Text>
            <Image
              source={logoeco}
              className="w-[75px] h-[75px]"
            />
          </View>

          <View style={styles.containerCombate}>
  <Text style={styles.label}>Fecha:</Text>

  <TouchableOpacity
    style={[
      styles.dateInput,
      {
        backgroundColor: errorFec ? 'yellow' : '#f1f5f9',
        borderColor: errorFec ? '#facc15' : '#cbd5e1',
        borderWidth: 1,
        borderRadius: 8,
      }
    ]}
    onPress={() => setShowDatePicker(true)}
  >
    <Text style={{ color: selectedDate ? '#000' : '#777' }}>
      {selectedDate ? selectedDate : "Selecciona una fecha"}
    </Text>
  </TouchableOpacity>

  {showDatePicker && (
    <DateTimePicker
      value={selectedDate ? new Date(selectedDate) : new Date()}
      mode="date"
      display="default"
      onChange={(event, date) => {
        setShowDatePicker(false);
        if (date) {
          const formatted = format(date, "yyyy-MM-dd");
          setSelectedDate(formatted);
          setErrorFec(false);   // ⬅️ Limpia el error al escoger fecha
        }
      }}
    />
  )}
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
  listMode="MODAL"              // <-- importante: abre en modal (no se corta)
  modalProps={{
    animationType: "slide",
  }}
  style={{
    width: '100%',
    height: 50,
    backgroundColor: errorSemana ? 'yellow' : '#f1f5f9',
    borderColor: errorSemana ? '#facc15' : '#cbd5e1',
    borderRadius: 8,
  }}
  dropDownContainerStyle={{
    backgroundColor: 'white',
    // puedes conservar zIndex/elevation si quieres
  }}
  textStyle={{
    fontSize: 16,
    color: '#374151',
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
        <FlotaButton />
        </SafeAreaView>
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

                //calculo semanas y dias de embarazo add 16122024
                const today = new Date(); 
                const pastDate = new Date(selectedDate);
                const difference = differenceInDays(pastDate,today) + 1;
                console.log('Diferencia en días:', difference);
             
                const nrodiasaprox_parto = 279 - difference;
                //console.log('Nro Días Aprox parto:', nrodiasaprox_parto);

                const nrodiasaprox_partodias = 280 - nrodiasaprox_parto;
                console.log('Nro Días Aprox parto:', nrodiasaprox_partodias);

                const weeks = Math.floor(nrodiasaprox_parto / 7);
                const remainingDays = nrodiasaprox_parto % 7;
                console.log('Diferencia en semanas:', weeks);
                console.log('Días restantes:', remainingDays);
                             
                const fecrest = addDays(today, -nrodiasaprox_parto); // Restar los días

                const newDate = addDays(fecrest, 281);
                const newDate2 = addDays(fecrest, 280);
                const cal_fecaprox_parto = format(newDate2, 'dd/MM/yyyy');
                console.log('Fecha calculada Aprox parto:', cal_fecaprox_parto);               
                const fecinigesta = addDays(newDate, -280);
                const fecsema1 = format(fecinigesta, 'yyyy-MM-dd');
                console.log('Fecha inicio Gestacion Semana1 :', fecsema1);  
                //Fin calculo semanas y dias de embarazo add 11122024

                const valUserFpp = await db.getFirstAsync('SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?', [user.id]);
                  
                    if(valUserFpp){
                        const resultudp =   await db.runAsync('UPDATE T_05_ETAPA_GESTACIONAL SET fec_proba_parto = ?,calcu_nrosema = ?,calcu_nrodias = ?,calcu_nrodias_parto = ?,calcu_fecaprox_parto = ? WHERE id = ?', [selectedDate,weeks,remainingDays,nrodiasaprox_partodias,cal_fecaprox_parto,user.id]);                          
                        Alert.alert('Correcto', 'Registro FPP Actualizado exitosamente!');      
                        //navigation.navigate('Home', {user:user});
                    }else{   
                        const resultins = await db.runAsync('INSERT INTO T_05_ETAPA_GESTACIONAL (id, fec_proba_parto,calcu_nrosema,calcu_nrodias,calcu_nrodias_parto,calcu_fecaprox_parto) VALUES (?,?,?,?,?,?)', [user.id, selectedDate,weeks,remainingDays,nrodiasaprox_partodias,cal_fecaprox_parto]);
                        Alert.alert('Correcto', 'Registro FPP Registrado exitosamente!');      
                        //navigation.navigate('Home', {user:user});                       
                                                
                    } 
                    
                //grabando marcadores
                const datmarkereg = await db.getFirstAsync('SELECT * FROM T_05_AGENDA_GESTACIONAL WHERE id = ?', [user.id]);
                   
                await db.runAsync('DELETE FROM T_05_AGENDA_GESTACIONAL WHERE id = $id', { $id: user.id });
                console.log('Remove Agenda FPP:', 'RemoveAgenda FPP');
                               
                    //const startDate = new Date('2024-06-29'); 
                    const startDate = new Date(fecsema1); 
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
                    console.log('inserte Agenda FPP:', 'INSAgenda FPP'); 
                    
                    const fechfurrest = addDays(newDate, -279);
                    const fechfur = format(fechfurrest, 'yyyy-MM-dd');

                    console.log('Fecha inicio Gestacion FUR :', fechfur);
            
                    insertAllDaysGestacion(db, fechfur, user.id);     
                              
              /////////////////Fin Add 10122024 Grabado marker semanas de embarazo para agenda/////////
              //navigation.navigate('TabNavigator', {user:user});//comment for add hemoglobina 15122024
              navigation.navigate('Hemoglo', {user:user});                 

                } catch (error) {
                    console.log('Error durante el registro del FPP : ', error);
                }

        }

        const [isPressed, setIsPressed] = useState(false);
    return(
        <>
        <SafeAreaView className="flex-1 bg-gray-100">
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
        <FlotaButton />
        </SafeAreaView>
    </>
    )   
}

const HemoScreen = ({ navigation, route }) => {
  const db = useSQLiteContext();
  const { user } = route.params;

  const [hemoglo, setHemoglo] = useState(''); // Estado para el valor de hemoglobina
  const [isPressed, setIsPressed] = useState(false);

  // Cargar el valor de hemoglobina al entrar a la pantalla
  useEffect(() => {
    const loadHemoglo = async () => {
      try {
        const result = await db.getFirstAsync(
          'SELECT hemoglo FROM T_05_ETAPA_GESTACIONAL WHERE id = ?',
          [user.id]
        );
        if (result?.hemoglo) {
          setHemoglo(result.hemoglo.toString());
        }
      } catch (error) {
        console.log('Error al cargar la hemoglobina:', error);
      }
    };

    loadHemoglo();
  }, [db, user.id]);

  useEffect(() => {
    if (hemogloref.current) {
      hemogloref.current.focus();
      setFocusedInput('hemoglo'); 
    }
  }, []);

  // Guardar o actualizar el valor de hemoglobina
  const handleRegiHemo = async () => {
    if (!hemoglo || isNaN(parseFloat(hemoglo))) {
      Alert.alert('Error', 'Por favor, ingrese un valor válido para la hemoglobina.');
      hemogloref.current.focus();
      setFocusedInput('hemoglo'); 
      return;
    }
  
    try {
      const existingRecord = await db.getFirstAsync(
        'SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?',
        [user.id]
      );

      if (existingRecord) {
        await db.runAsync(
          'UPDATE T_05_ETAPA_GESTACIONAL SET hemoglo = ? WHERE id = ?',
          [parseFloat(hemoglo), user.id]
        );
        Alert.alert('Correcto', 'Registro de hemoglobina actualizado exitosamente.');
      } else {
        await db.runAsync(
          'INSERT INTO T_05_ETAPA_GESTACIONAL (id, hemoglo) VALUES (?, ?)',
          [user.id, parseFloat(hemoglo)]
        );
        Alert.alert('Correcto', 'Registro de hemoglobina guardado exitosamente.');
      }

      navigation.navigate('TabNavigator', { user });
    } catch (error) {
      console.log('Error durante el registro de hemoglobina:', error);
    }
  };

  const [focusedInput, setFocusedInput] = useState(null); 
  const hemogloref = useRef(null);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
    <View style={styles.containerhemoglo}>
      <Text className="mb-4 font-extrabold text-center text-[17px] bg-gradient-to-r from-purple-100 to-violet-200 p-2 text-blue-800 border border-green-700 rounded-xl shadow-lg">
        <Text className="text-purple-700">
          Ingresa el valor de su hemoglobina {"\n"}
          (sin ajuste por su altitud) {"\n"}
          brindado por su obstetra en su última cita.
        </Text>
      </Text>

      <TextInput
          className="w-3/4 p-3 border border-gray-300 rounded-lg text-center text-lg"
          ref={hemogloref} // Asignar la referencia         
                style={[
                  styles.input,
                  focusedInput === 'hemoglo' && styles.inputFocused,
                ]}
          placeholder="Ejemplo: 12.5"
          keyboardType="decimal-pad"
          value={hemoglo}
          onChangeText={(text) => {
            // Validar y formatear el texto ingresado
            const formattedText = text
              .replace(/[^0-9.]/g, '') // Permitir solo números y un punto decimal
              .replace(/(\..*?)\..*/g, '$1'); // Evitar más de un punto decimal

            // Limitar a dos decimales
            const [integer, decimal] = formattedText.split('.');
            if (decimal?.length > 2) {
              setHemoglo(`${integer}.${decimal.slice(0, 2)}`);
            } else {
              setHemoglo(formattedText);
            }
          }}
          onFocus={() => setFocusedInput('hemoglo')}
          onBlur={() => setFocusedInput(null)}
        />

      <TouchableOpacity
        onPress={handleRegiHemo}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        className={`flex-row items-center justify-center rounded-lg ${
          isPressed ? 'bg-fuchsia-800' : 'bg-fuchsia-600'
        }`}
        style={{
          width: '70%',
          height: 50,
          marginTop: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        activeOpacity={0.8}
      >
        <Image
          source={iconsave}
          className="w-8 h-8 mr-2"
          resizeMode="contain"
        />
        <Text className="text-white font-semibold text-base">Guardar</Text>
      </TouchableOpacity>
    </View>
    <FlotaButton />
    </SafeAreaView>
  );
};

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
    color: '#85268d', // Color personalizado para el título
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
    backgroundColor: '#85268d',
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
    color: '#85268d',
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
    backgroundColor: '#fff',
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
  }, containerhemoglo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 200,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  controlContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  rowControl: {
    flexDirection: "row",
    alignItems: "center",
    width: "70%",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  
  dateInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    width: "60%",
  },
});
