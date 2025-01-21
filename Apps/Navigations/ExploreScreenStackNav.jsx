import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import ExploreScreen from '../Screens/ExploreScreen';
import ProductDetail from '../Screens/ProductDetail';
import RegisterEventsScreen from '../Screens/RegisterEventsScreen';

const Stack=createStackNavigator();
export default function ExploreScreenStackNav({ route }) {
  const { user } = route.params;
    console.log('ExploreScreenStackNav user:', `ExploreScreenStackNav usuarioid : ${user.id} - dni : ${user.dni}`);
    
  return (
    <Stack.Navigator>
        <Stack.Screen name='explore-tab' component={ExploreScreen} initialParams={{ user }} 
        options={{
            headerShown:false
        }}
        />
        <Stack.Screen name="product-detail" component={ProductDetail}
         options={{
            headerStyle:{
                backgroundColor:'#ffd3fb',
            },
            headerTintColor:'#fff',
            headerTitle:'Detail'
        }}
        />
      <Stack.Screen name='register-events-gestante' 
        component={RegisterEventsScreen}
        options={{
            title:'Regresar al Calendario de Eventos',
            headerStyle:{
                backgroundColor:'#ffd3fb',
                height: 60,
            },
            headerTintColor:'#000',          
            headerTitleStyle: {              
              fontSize: 18,
              fontWeight: 'bold',
              color: '#000', // Color del título
          },
        }}
        
        />
    </Stack.Navigator>
  )
}
