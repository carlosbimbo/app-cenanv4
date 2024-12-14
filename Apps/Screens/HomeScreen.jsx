import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity,FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '../Components/HomeScreen/Header';
import Slider from '../Components/HomeScreen/Slider';
import Categories from '../Components/HomeScreen/Categories';
import LatestItemList from '../Components/HomeScreen/LatestItemList';

import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { Agenda } from 'react-native-calendars';
import { calendarTheme } from 'react-native-calendars'; // Import the default calendar theme
import { useNavigation } from '@react-navigation/native'
import logosizebb1 from '../../images/sizeweekbb/sizelogobebe1.png';
import logosizebb5 from '../../images/sizeweekbb/sizelogobebe5.png';
import logosizebb6 from '../../images/sizeweekbb/sizelogobebe6.png';
import logosizebb7 from '../../images/sizeweekbb/sizelogobebe7.png';
import logosizebb8 from '../../images/sizeweekbb/sizelogobebe8.png';
import logosizebb9 from '../../images/sizeweekbb/sizelogobebe9.png';
import logosizebb10 from '../../images/sizeweekbb/sizelogobebe10.png';
import logosizebb11 from '../../images/sizeweekbb/sizelogobebe11.png';
import logosizebb12 from '../../images/sizeweekbb/sizelogobebe12.png';
import logosizebb13 from '../../images/sizeweekbb/sizelogobebe13.png';
import logosizebb14 from '../../images/sizeweekbb/sizelogobebe14.png';
import logosizebb15 from '../../images/sizeweekbb/sizelogobebe15.png';
import logosizebb16 from '../../images/sizeweekbb/sizelogobebe16.png';
import logosizebb17 from '../../images/sizeweekbb/sizelogobebe17.png';
import logosizebb18 from '../../images/sizeweekbb/sizelogobebe18.png';
import logosizebb19 from '../../images/sizeweekbb/sizelogobebe19.png';
import logosizebb20 from '../../images/sizeweekbb/sizelogobebe20.png';
import logosizebb21 from '../../images/sizeweekbb/sizelogobebe21.png';
import logosizebb22 from '../../images/sizeweekbb/sizelogobebe22.png';
import logosizebb23 from '../../images/sizeweekbb/sizelogobebe23.png';
import logosizebb24 from '../../images/sizeweekbb/sizelogobebe24.png';
import logosizebb25 from '../../images/sizeweekbb/sizelogobebe25.png';
import logosizebb26 from '../../images/sizeweekbb/sizelogobebe26.png';
import logosizebb27 from '../../images/sizeweekbb/sizelogobebe27.png';
import logosizebb28 from '../../images/sizeweekbb/sizelogobebe28.png';
import logosizebb29 from '../../images/sizeweekbb/sizelogobebe29.png';
import logosizebb30 from '../../images/sizeweekbb/sizelogobebe30.png';
import logosizebb31 from '../../images/sizeweekbb/sizelogobebe31.png';
import logosizebb32 from '../../images/sizeweekbb/sizelogobebe32.png';
import logosizebb33 from '../../images/sizeweekbb/sizelogobebe33.png';
import logosizebb34 from '../../images/sizeweekbb/sizelogobebe34.png';
import logosizebb35 from '../../images/sizeweekbb/sizelogobebe35.png';
import logosizebb36 from '../../images/sizeweekbb/sizelogobebe36.png';
import logosizebb37 from '../../images/sizeweekbb/sizelogobebe37.png';
import logosizebb38 from '../../images/sizeweekbb/sizelogobebe38.png';
import logosizebb39 from '../../images/sizeweekbb/sizelogobebe39.png';
import logosizebb40 from '../../images/sizeweekbb/sizelogobebe40.png';

import icotomas from '../../images/icotomas.png';
import reompensas from '../../images/reompensas.png';
import icotips from '../../images/icotips.png';
import icomaps from '../../images/icomaps.png';


export default function HomeScreen({ route }) {
  const db = useSQLiteContext();
  const { user } = route.params;
  const navigation=useNavigation();

  const [agendaItems, setAgendaItems] = useState([]);
  const [formattedAgenda, setFormattedAgenda] = useState({});
  const [markedDates, setMarkedDates] = useState({});

  const imageMapping = {
    '1': logosizebb1,'2': logosizebb1,'3': logosizebb1,'4': logosizebb1,'5': logosizebb5,'6': logosizebb6,'7': logosizebb7,'8': logosizebb8,'9': logosizebb9,'10': logosizebb10,
    '11': logosizebb11,'12': logosizebb12,'13': logosizebb13,'14': logosizebb14,'15': logosizebb15,'16': logosizebb16,'17': logosizebb17,'18': logosizebb18,'19': logosizebb19,'20': logosizebb20,
    '21': logosizebb21,'22': logosizebb22,'23': logosizebb23,'24': logosizebb24,'25': logosizebb25,'26': logosizebb26,'27': logosizebb27,'28': logosizebb28,'29': logosizebb29,'30': logosizebb30,
    '31': logosizebb31,'32': logosizebb32,'33': logosizebb33,'34': logosizebb34,'35': logosizebb35,'36': logosizebb36,'37': logosizebb37,'38': logosizebb38,'39': logosizebb39,'40': logosizebb40,
  };

  // Función para obtener el primer evento de la semana actual (aunque esté en el futuro)
  const getFinalEventOfWeek = (agenda) => {
    const today = new Date().toISOString().split('T')[0]; // Fecha actual en formato 'YYYY-MM-DD'
    const currentDate = new Date();
    const currentWeekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())); // Inicio de la semana actual
    const currentWeekEnd = new Date(currentDate.setDate(currentDate.getDate() + (6 - currentDate.getDay()))); // Fin de la semana actual

    const currentWeekStartStr = currentWeekStart.toISOString().split('T')[0];
    const currentWeekEndStr = currentWeekEnd.toISOString().split('T')[0];

    const dates = Object.keys(agenda).sort(); // Ordena las fechas ascendentemente

    for (let i = 0; i < dates.length; i++) {
      if (dates[i] >= currentWeekStartStr && dates[i] <= currentWeekEndStr) {
        return dates[i]; // Retorna la primera fecha encontrada dentro de la semana actual
      }
    }   
    // Si no hay eventos dentro de la semana actual, devuelve la última fecha
    return dates[dates.length - 1] || today;
  };

  // Cargar datos de la base de datos
  useEffect(() => {
    const fetchAgendaItems = async () => {
      try {
        //const results = await db.getAllAsync('SELECT * FROM T_05_AGENDA_GESTACIONAL WHERE id = ?', [user.id]);
        const results = await db.getAllAsync('select a.id,a.nrosem,a.fec_marker,b.desc_img,b.img_bb,b.altura_bb,b.peso_bb,c.calcu_nrosema,c.calcu_nrodias,c.calcu_nrodias_parto,c.calcu_fecaprox_parto from T_05_AGENDA_GESTACIONAL a join T_LECT_SEMANAS b on b.nro_semana = a.nrosem left join T_05_ETAPA_GESTACIONAL c on c.id = a.id WHERE a.id = ?', [user.id]);

        setAgendaItems(results);
      } catch (error) {
        console.error('Error al obtener datos de la agenda:', error);
      }
    };

    fetchAgendaItems();
  }, [db, user.id]);

  // Transformar los datos al formato requerido por el componente Agenda
  useEffect(() => {
    const transformAgendaItems = () => {  
      const currentDate = new Date();      
      const currentWeekEnd = new Date(currentDate.setDate(currentDate.getDate() + (6 - currentDate.getDay()))); // Fin de la semana actual
      const currentWeekEndStrMax = currentWeekEnd.toISOString().split('T')[0];
  
      const transformed = agendaItems.reduce((acc, item) => {
        const { id,nrosem,fec_marker,desc_img,img_bb,altura_bb,peso_bb,calcu_nrosema,calcu_nrodias,calcu_nrodias_parto,calcu_fecaprox_parto } = item;

        // Incluir solo los eventos anteriores o dentro de la semana actual
        if (fec_marker <= currentWeekEndStrMax) {
          const formattedItem = {
            nrosem: nrosem,
            name: desc_img,
            semat: `Estas en tu semana numero : ${nrosem} de Embarazo`,
            alturabb: altura_bb,
            pesobb: peso_bb,            
            cal_nrosema: calcu_nrosema,
            cal_nrodias: calcu_nrodias,
            cal_nrodias_parto: calcu_nrodias_parto,
            cal_fecaprox_parto: calcu_fecaprox_parto,
            day: fec_marker,
          };

          if (!acc[fec_marker]) {
            acc[fec_marker] = [];
          }
          acc[fec_marker].push(formattedItem);
        }

        return acc;
      }, {});

      setFormattedAgenda(transformed);
    };

    if (agendaItems.length > 0) {
      transformAgendaItems();
    }
  }, [agendaItems]);

  // Configurar las fechas marcadas, manteniendo la semana actual marcada
  useEffect(() => {
    if (Object.keys(formattedAgenda).length > 0) {
      const today = new Date().toISOString().split('T')[0]; // Fecha actual
      const markedDates = Object.keys(formattedAgenda).reduce((acc, date) => {
        // Excluir solo fechas futuras que no sean dentro de la semana actual
        acc[date] = {
          marked: true,
          dotColor: 'blue',
          customStyles: {
            container: { backgroundColor: '#FFD700' },
            text: { color: 'black', fontWeight: 'bold' },
          },
        };
        return acc;
      }, {});

      setMarkedDates(markedDates);
    }
  }, [formattedAgenda]);

  const customTheme = {
    ...calendarTheme,
    agendaDayTextColor: 'black',
    agendaDayNumColor: 'green',
    agendaTodayColor: 'red',
    agendaKnobColor: 'blue',
  };

  const categoryList = [
    {
      id: '1',
      title: 'Toma de Suplementos',
    },
    {
      id: '2',
      title: 'Mis Recompensas',
    },
    {
      id: '3',
      title: 'Mis Tips de Gestación',
    },
    {
      id: '4',
      title: 'Centros de Salud mas Cercanos',
    },
  ];

  const imageMenubtn = {
    '1': icotomas,
    '2': reompensas,
    '3': icotips,
    '4': icomaps,    
  };

  const handleNavigationBtn = (id) => {
    switch (id) {
      case '1':
        //navigation.navigate('Fur',{user : user});
        break;
      case '2':
        //navigation.navigate('Eco',{user : user});
        break;          
      case '3':
        //navigation.navigate('Parto',{user : user});
        break;     
      case '4':
        navigation.push('mapita-detail', {          
          user: user,
        })
          break;       
      default:
        console.log('Opción no válida');
    }
  };
  
  return (
    <>
    <View style={{ flex: 1, marginHorizontal: 10 }}>
      <Agenda
        items={formattedAgenda}
        markedDates={markedDates}
        markingType={'custom'}
        showOnlySelectedDayItems={true}
        theme={customTheme}
        selected={getFinalEventOfWeek(formattedAgenda)}
        renderItem={(item) => (
          <TouchableOpacity
            className="flex-1 m-2 p-2 rounded-lg border-[1px] border-slate-200"
            onPress={() =>
              navigation.push('product-detail', {
                baby: item,
                user: user,
              })
            }
          >
            <View
              style={{
                marginVertical: 10,
                marginTop: 30,
                backgroundColor: 'white',
                marginHorizontal: 10,
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
              <Text style={{ marginTop: 20, fontSize: 14 }}>{item.semat}</Text>
              <View className="flex-1 items-center justify-center">
                <Image
                  source={imageMapping[item.nrosem]}
                  className="w-40 h-40 border-2 border-blue-500"
                />
              </View>
              {/* Botones debajo de la imagen */}
              <View className="flex-row flex-wrap items-center justify-between mt-4">
                {categoryList.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className="w-[90%] flex-row items-center justify-center p-2 border-[1px] border-blue-600 rounded-lg bg-blue-650 m-1"
                    onPress={() => handleNavigationBtn(category.id)}
                  >
                    <Image
                      source={imageMenubtn[category.id]}
                      className="w-[25px] h-[25px] mr-2"
                    />
                    <Text className="text-black font-bold text-[12px]">
                      {category.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        )}
        renderEmptyData={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay datos para esta fecha.</Text>
          </View>
        )}
      />
    </View>
  </>  
  );
}

// Estilos
const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
  },
});