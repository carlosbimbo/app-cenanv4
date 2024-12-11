import { View, Text, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import LatestItemList from '../Components/HomeScreen/LatestItemList'

export default function ExploreScreen() {

  return (
    <ScrollView className="p-5 py-8 bg-white">
      <Text className="text-[30px] font-bold">Explore More</Text>      
    </ScrollView>
  )
}