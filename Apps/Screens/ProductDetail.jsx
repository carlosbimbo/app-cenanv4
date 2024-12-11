import { View, Text, Image, ScrollView, Linking, Share, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetail({navigation}) {

    const {params}=useRoute();
    const nav=useNavigation();

  return (
    <ScrollView className="bg-white">
        
     <View className="m-5"> 
     <Text className="text-[30px] font-bold">Mira1 Test</Text>
    </View>
    </ScrollView>
  )
}