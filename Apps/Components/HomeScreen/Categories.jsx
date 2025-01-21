import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

export default function Categories({categoryList}) {Pressable

  const navigation=useNavigation();
  return (
    <View className="mt-3">
        <Text className="font-bold text-[20px]">Categories</Text>        
    </View>
  )
}