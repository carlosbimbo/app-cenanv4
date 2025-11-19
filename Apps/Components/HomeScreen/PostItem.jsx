import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

export default function PostItem({item}) {

  const navigation=useNavigation();

  return (
    <TouchableOpacity className="flex-1 m-2 p-2 rounded-lg 
    border-[1px] border-slate-200"
  
    >
  
        <View >
          <Text className="text-[15px] font-bold mt-2">aaa</Text>
          <Text className="text-[20px] font-bold text-blue-500">bbb</Text>
          <Text className="text-blue-500 bg-blue-200 mt-1 p-[2px] text-center rounded-full px-1 text-[10px] w-[70px]">ccc</Text>

        </View>
    </TouchableOpacity>
  )
}