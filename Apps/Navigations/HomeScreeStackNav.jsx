import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../Screens/HomeScreen';
import ItemList from '../Screens/ItemList';
import ProductDetail from '../Screens/ProductDetail';
import MapsDetail from '../Screens/MapsDetail';

import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator(); 

export default function HomeScreeStackNav({ route }) {
    const { user } = route.params;
    console.log('HomeScreeStackNav user:', `HomeScreeStackNav usuarioid : ${user.id} - dni : ${user.dni}`);
  return (
    <Stack.Navigator>
        <Stack.Screen name='home' component={HomeScreen} initialParams={{ user }}
            options={{
                headerShown:false
            }}
        />
        <Stack.Screen name='item-list' 
        component={ItemList}
        options={({ route }) => ({ title: route.params.category ,
        headerStyle:{
            backgroundColor:'#3b82f6',
        },
    headerTintColor:'#fff'})}
        />
         <Stack.Screen name='product-detail' 
        component={ProductDetail}
        options={{
            headerStyle:{
                backgroundColor:'lightblue',
            },
            headerTintColor:'#000',
            headerTitle:'Regresar al Inicio'
        }}
        
        />
        <Stack.Screen name='mapita-detail' 
        component={MapsDetail}
        options={{
            headerStyle:{
                backgroundColor:'lightblue',
            },
            headerTintColor:'#000',
            headerTitle:'Regresar al Inicio'
        }}
        
        />
    </Stack.Navigator>
  )
}