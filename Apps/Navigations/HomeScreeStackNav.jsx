import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../Screens/HomeScreen';
import ItemList from '../Screens/ItemList';
import ProductDetail from '../Screens/ProductDetail';
import MapsDetail from '../Screens/MapsDetail';
import SuplementosScreen from '../Screens/SuplementosScreen';
import SuplementosDetail from '../Screens/SuplementosDetail';
import RecompensasList from '../Screens/RecompensasList';
import TipsGestacionList from '../Screens/TipsGestacionList';

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
            backgroundColor:'#ffd3fb',            
        },
    headerTintColor:'#fff'})}
        />
         <Stack.Screen name='product-detail' 
        component={ProductDetail}
        options={{
            headerStyle:{
                backgroundColor:'#ffd3fb',
                height: 60, // Ajusta la altura
            },
            headerTintColor:'#000',
            headerTitle:'Regresar'
        }}
        
        />
        <Stack.Screen name='mapita-detail' 
        component={MapsDetail}
        options={{
            headerStyle:{
                backgroundColor:'#ffd3fb',
            },
            headerTintColor:'#000',
            headerTitle:'Regresar'
        }}
        
        />

    <Stack.Screen name='supleme-detail' 
        component={SuplementosScreen}
        options={{
            headerStyle:{
                backgroundColor:'#ffd3fb',
                height: 40,
            },
            headerTintColor:'#000',
            headerTitle:'Regresar'
        }}
        
        />
    <Stack.Screen name='supleme-calendar' 
        component={SuplementosDetail}
        options={{
            headerStyle:{
                backgroundColor:'#ffd3fb',
                height: 40,
            },
            headerTintColor:'#000',
            headerTitle:'Regresar'
        }}
        
        />
    
    <Stack.Screen name='recompensas-list' 
        component={RecompensasList}
        options={{
            headerStyle:{
                backgroundColor:'#ffd3fb',
                height: 40,
            },
            headerTintColor:'#000',
            headerTitle:'Regresar'
        }}
        
        />
    <Stack.Screen name='tipsgestacion-list' 
        component={TipsGestacionList}
        options={{
            headerStyle:{
                backgroundColor:'#ffd3fb',
                height: 40,
            },
            headerTintColor:'#000',
            headerTitle:'Regresar'
        }}
        
        />
    </Stack.Navigator>
  )
}