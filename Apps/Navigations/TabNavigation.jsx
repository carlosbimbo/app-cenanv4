import { View, Text, Image } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreeStackNav from './HomeScreeStackNav';
import ExploreScreenStackNav from './ExploreScreenStackNav';
import ProfileScreenStackNav from './ProfileScreenStackNav';
import AddPostScreen from '../Screens/AddPostScreen';
import logotabuserprofile from '../../images/tabuserperfil.png';
import logotabstart from '../../images/tabstart.png';
import logotabagenda from '../../images/tabagenda.png';
import icomaps from '../../images/icomaps.png';

const Tab = createBottomTabNavigator();

export default function TabNavigation({ navigation, route }) {
  const { user } = route.params;
  console.log('TabNavigation user:', `usuarioid : ${user.id} - dni : ${user.dni}`);



  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffd3fb', // Fondo rojo en la barra de navegación
          height: 60, // Ajustar altura opcionalmente
          paddingBottom: 5, // Espaciado inferior
          paddingTop: 5, // Espaciado superior
        },
        tabBarActiveTintColor: 'black', // Color de texto activo
        tabBarInactiveTintColor: 'gray', // Color de texto inactivo
      }}
    >
      <Tab.Screen
        name="home-nav"
        component={HomeScreeStackNav}
        initialParams={{ user }}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color: color,
                fontSize: 13,
                marginBottom: 3,
                fontWeight: focused ? 'bold' : 'normal',
              }}
            >
              Inicio
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={logotabstart}
              style={{
                width: 35,
                height: 35,
                opacity: focused ? 1 : 0.7,
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="explore"
        component={ExploreScreenStackNav}
        initialParams={{ user }}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color: color,
                fontSize: 13,
                marginBottom: 3,
                fontWeight: focused ? 'bold' : 'normal',
              }}
            >
              Mi Agenda
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={logotabagenda}
              style={{
                width: 35,
                height: 35,
                opacity: focused ? 1 : 0.7,
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="addpost"
        component={AddPostScreen}
        initialParams={{ user }}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color: color,
                fontSize: 13,
                marginBottom: 3,
                fontWeight: focused ? 'bold' : 'normal',
              }}
            >
              EESS
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={icomaps}
              style={{
                width: 35,
                height: 35,
                opacity: focused ? 1 : 0.7,
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreenStackNav}
        initialParams={{ user }}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color: color,
                fontSize: 13,
                marginBottom: 3,
                fontWeight: focused ? 'bold' : 'normal',
              }}
            >
              Mi Perfil
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={logotabuserprofile}
              style={{
                width: 35,
                height: 35,
                opacity: focused ? 1 : 0.7,
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
