import { View, Text, Image, FlatList ,TouchableOpacity} from 'react-native'
import React from 'react'

import { useNavigation } from '@react-navigation/native'



export default function ProfileScreen() {


  const navigation=useNavigation();


  return (
    <View className="p-5 bg-white flex-1">
     <Text className="text-[30px] font-bold">Mira1 Profile Test</Text>
    </View>
  )
}