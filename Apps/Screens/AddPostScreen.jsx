import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity, Image, ToastAndroid, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

export default function AddPostScreen() {
  

  return (
    <KeyboardAvoidingView>
    <ScrollView className="p-10 bg-white "> 
    <Text className="text-[27px] font-bold">aaaa</Text>
    <Text className="text-[16px] text-gray-500 mb-7">Create New P</Text>        
    </ScrollView>
    </KeyboardAvoidingView>
 
  )
}

const styles = StyleSheet.create({
    input:{
        borderWidth:1,
        borderRadius:10,
        padding:10,
        paddingTop:15,
       
        marginTop:10,marginBottom:5,
        paddingHorizontal:17,
        textAlignVertical:'top',
        fontSize:17
    }
})