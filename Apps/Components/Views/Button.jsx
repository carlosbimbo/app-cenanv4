import * as React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Entypo, MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function Button({ title, onPress, icon, color, family = 'Entypo' }) {
  const IconComponent = 
    family === 'MaterialIcons' ? MaterialIcons :
    family === 'Ionicons' ? Ionicons :
    Entypo; // Default to Entypo

  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <IconComponent name={icon} size={28} color={color || '#f1f1f1'} />
      {title && <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#f1f1f1',
    marginLeft: 10,
  },
});
