import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native'
import LatestItemList from '../Components/HomeScreen/LatestItemList';

export default function ItemList() {
  const {params}=useRoute();

  return (
    <View className="p-2">
     <Text className="text-[30px] font-bold">Mira1 Test</Text>
    </View>
  )
}