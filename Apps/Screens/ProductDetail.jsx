import { View, Text, Image, ScrollView, Linking, Share, Alert,FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
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

import altubaby from '../../images/infodetbb/alturababy.png';
import pesobaby from '../../images/infodetbb/pesobaby.png';

export default function ProductDetail({navigation}) {

    const {params}=useRoute();
    const nav=useNavigation();    
    console.log('Entree params zzz: ',params.baby);
    const detbaby = params.baby;
    const user = params.user;
    console.log('Entree params user: ',user);

    const imageMapping = {
      '1': logosizebb1,'2': logosizebb1,'3': logosizebb1,'4': logosizebb1,'5': logosizebb5,'6': logosizebb6,'7': logosizebb7,'8': logosizebb8,'9': logosizebb9,'10': logosizebb10,
      '11': logosizebb11,'12': logosizebb12,'13': logosizebb13,'14': logosizebb14,'15': logosizebb15,'16': logosizebb16,'17': logosizebb17,'18': logosizebb18,'19': logosizebb19,'20': logosizebb20,
      '21': logosizebb21,'22': logosizebb22,'23': logosizebb23,'24': logosizebb24,'25': logosizebb25,'26': logosizebb26,'27': logosizebb27,'28': logosizebb28,'29': logosizebb29,'30': logosizebb30,
      '31': logosizebb31,'32': logosizebb32,'33': logosizebb33,'34': logosizebb34,'35': logosizebb35,'36': logosizebb36,'37': logosizebb37,'38': logosizebb38,'39': logosizebb39,'40': logosizebb40,
    };

    const menuList=[
      {
        id:1,
        name:'Altura de tu bb : \n' + detbaby.alturabb,
        icon:altubaby,
        path:'my-product' 
      },
      {
        id:2,
        name:'Peso de tu bb : \n' + detbaby.pesobb,
        icon:pesobaby,
        path:'explore'
      }
    ]

    
  return (
    <View className="bg-white flex-1">
      <View className="items-center mt-4">
      <Image source={imageMapping[detbaby.nrosem]}
          className="w-[130px] h-[130px]"
        /> 
      <Text className="font-extrabold text-center text-[17px] bg-gradient-to-r from-purple-100 to-violet-200 p-4 text-blue-800 m-4 border border-green-700 rounded-xl shadow-lg">
      <Text className="text-purple-700">{detbaby.name} Semanas</Text>
      </Text>
      <Text className="font-extrabold text-[15px] bg-gradient-to-r from-purple-100 to-violet-200 p-4 text-blue-800 m-2 border border-green-700 rounded-xl shadow-lg">
      Edad Gestacional: <Text className="text-purple-700">{detbaby.cal_nrosema} Semanas</Text> y <Text className="text-green-600">{detbaby.cal_nrodias} Días</Text>
      </Text>
      </View>
        
        <FlatList
        data={menuList}
        numColumns={3}
        style={{marginTop:-5}}
        renderItem={({item,index})=>(
          <TouchableOpacity           
          className="flex-1 p-4 border-[1px] items-center
           mx-2 mt-4
          rounded-lg border-blue-400 bg-blue-50">
             {item.icon&& <Image source={item?.icon} 
             className="w-[40px]  h-[40px]"/>}
        <Text className="font-bold text-[15px] mt-2 text-blue-700 text-center w-[150px]">{item.name}</Text>
          </TouchableOpacity>
        )}
        />
        <Text className="font-extrabold text-[15px] bg-blue-50 p-4 text-blue-800 m-12 border border-green-700 rounded-xl shadow-lg">
  Quedan aprox.: <Text className="text-[15px] text-green-600">{detbaby.cal_nrodias_parto} Dias </Text>para el parto y la Fecha aprox. del parto: <Text className="text-green-600"> {detbaby.cal_fecaprox_parto}</Text>
</Text>
    </View>
  )
}