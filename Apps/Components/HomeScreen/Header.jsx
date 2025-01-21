import { View, Text, Image, TextInput } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
export default function Header() {
  
  return (
    <View>
        {/* User Info Section  */}
        <View className="flex flex-row items-center gap-2">
          
            <View>
                <Text className="text-[16px]">Welcome</Text>
                <Text className="text-[20px] font-bold">carlos</Text>
            </View>
        </View>

      
        <View className="p-[9px] px-5 flex flex-row 
        items-center  bg-blue-50 mt-5 rounded-full 
        border-[1px] border-blue-300">
        <Ionicons name="search" size={24} color="gray"  />
            <TextInput placeholder='Search' 
            className="ml-2 text-[18px]" 
            onChangeText={(value)=>console.log(value)}
            />
        </View>
    </View>
  )
}