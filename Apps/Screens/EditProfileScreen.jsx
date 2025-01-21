import { SafeAreaView, Dimensions,StyleSheet, Text, View, TextInput, Pressable, Alert, Image,TouchableOpacity,KeyboardAvoidingView,ScrollView,FlatList } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from "@react-navigation/native";
import iconsave from '../../images/btnsave.png';
import * as ImagePicker from 'expo-image-picker';
import FlotaButton from '../Components/Views/FlotaButton'

export default function EditProfileScreen({ route }) {
  const db = useSQLiteContext();
  const { user } = route.params;
  const navigation = useNavigation();

  const [userName, setUserName] = useState(user.username);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');    
  const [userDni, setUserDni] = useState(user.dni);
  const [userNomb, setUserNomb] = useState(user.nombape);
  const [profileImage, setProfileImage] = useState(user.profileImage || null); // URI de la imagen


  //add 07122024
  const [errorMsg, setErrorMsg] = useState('');
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net)$/;
  const isValidEmail = (userName) => emailRegex.test(userName);
  
  
  const [focusedInput, setFocusedInput] = useState(null); // Estado para rastrear qué TextInput está activo
  const userNombRef = useRef(null);    
  const dniRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirpasswordRef = useRef(null);   

  useEffect(() => {
    if (userNombRef.current) {
      userNombRef.current.focus();
      setFocusedInput('userNomb'); // Aplicar el estilo resaltado
    }
  }, []);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso necesario', 'Se necesita acceso a la galería para continuar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri); // Actualizar la URI de la imagen
    }
  };

  //function to handle registration logic
  const handleRegister = async() => {
 
      try {
        
          if(userNomb.trim().length === 0) {
            Alert.alert('Atencion!', 'Por favor ingrese sus Nombres y Apellidos.');
            userNombRef.current.focus(); // Enfocar automáticamente
            setFocusedInput('userNomb'); // Resaltar el campo
            return;
            }

            if(userDni.trim().length === 0) {
              Alert.alert('Atencion!', 'Por favor ingrese su DNI.');
              dniRef.current.focus(); // Enfocar automáticamente
              setFocusedInput('userDni'); // Resaltar el campo
              return;
              }  

          if(userDni.trim().length < 8) {
                Alert.alert('Atencion!', 'El numero de DNI es incorrecto.');
                dniRef.current.focus(); // Enfocar automáticamente
                setFocusedInput('userDni'); // Resaltar el campo
                return;
           }     

          if(userName.trim().length === 0) {
              Alert.alert('Atencion!', 'Por favor ingrese su Email.');
              emailRef.current.focus(); // Enfocar automáticamente
              setFocusedInput('userName'); // Resaltar el campo
              return;
               }
               
          if(password.trim().length === 0) {
              Alert.alert('Atencion!', 'Por favor ingrese su Password.');
              passwordRef.current.focus(); // Enfocar automáticamente
              setFocusedInput('password'); // Resaltar el campo
              return;
            }
          
          if(confirmPassword.trim().length === 0) {
              Alert.alert('Atencion!', 'Por favor ingrese su Confirmacion de Password.');
              confirpasswordRef.current.focus(); // Enfocar automáticamente
              setFocusedInput('confirmPassword'); // Resaltar el campo
              return;
            }

          if (password !== confirmPassword) {
              Alert.alert('Error', 'Password no coincide');               
              confirpasswordRef.current.focus(); // Enfocar automáticamente
              setFocusedInput('confirmPassword'); // Resaltar el campo
              return;
          }
  
          if (!isValidEmail(userName)) {
              Alert.alert('Error', 'Email no valido!');
              emailRef.current.focus(); // Enfocar automáticamente
              setFocusedInput('userName'); // Resaltar el campo
              return;
          }
         
          const existingUser = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [user.id]);
          if (existingUser) {              
            const resultudp =   await db.runAsync('UPDATE users SET nombape = ?,dni = ?,password = ?, profileImage = ? WHERE id = ?', [userNomb,userDni,password,profileImage,user.id]);                         
            Alert.alert('Correcto', 'Actualizacion completada exitosamente!');     
                       
          }
 
         
      } catch (error) {
          console.log('Error durante la Actualización : ', error);
      }
 
    
  }
  const [isPressed, setIsPressed] = useState(false);
  return (
    <>
    <SafeAreaView className="flex-1 bg-gray-100">
    <KeyboardAvoidingView>
         <ScrollView>   
        <View style={styles.container}>
        <Text className="mb-4 font-extrabold text-center text-[18px] bg-gradient-to-r from-purple-100 to-violet-200 p-4 text-blue-800 border border-green-700 rounded-xl shadow-lg">
          <Text className="text-purple-700">Mis datos Personales</Text>
        </Text>
                {/* Mostrar la imagen seleccionada */}
                {profileImage ? (
                    <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickImage}>
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickImage}>
                    <Text style={styles.placeholderText}>Seleccionar Imagen</Text>
                    </TouchableOpacity>
                )}
                
            <TextInput  
              ref={userNombRef} // Asignar la referencia         
              style={[
                styles.input,
                focusedInput === 'userNomb' && styles.inputFocused,
              ]}
              placeholder="Nombres y Apellidos"
              value={userNomb}
              onChangeText={setUserNomb}
              onFocus={() => setFocusedInput('userNomb')}
              onBlur={() => setFocusedInput(null)}
              returnKeyType="next" // Configura el botón Enter para "siguiente"
              onSubmitEditing={() => dniRef.current.focus()} 
            />

            <TextInput 
                ref={dniRef} // Asignar la referencia         
                style={[
                  styles.input,
                  focusedInput === 'userDni' && styles.inputFocused,
                ]}
                placeholder='DNI'
                value={userDni}
                maxLength={8}
                keyboardType="numeric"
                onChangeText={setUserDni}
                onFocus={() => setFocusedInput('userDni')}
                onBlur={() => setFocusedInput(null)}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current.focus()} // Enfoca al siguiente campo
            />

            <TextInput 
                ref={emailRef} // Asignar la referencia         
                style={[
                  styles.input,
                  focusedInput === 'userName' && styles.inputFocused,
                ]}
                editable={false}
                backgroundColor= '#d3d3d3'
                placeholder='Email'
                keyboardType="email-address"
                value={userName}
                onChangeText={setUserName}
                onFocus={() => setFocusedInput('userName')}
                onBlur={() => setFocusedInput(null)}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()} // Enfoca al siguiente campo
            />
            <TextInput 
                ref={passwordRef} // Asignar la referencia         
                style={[
                  styles.input,
                  focusedInput === 'password' && styles.inputFocused,
                ]}
                placeholder='Password'
                secureTextEntry
                maxLength={10}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                returnKeyType="next"
                onSubmitEditing={() => confirpasswordRef.current.focus()} // Enfoca al siguiente campo
            />
            <TextInput 
                ref={confirpasswordRef} // Asignar la referencia         
                style={[
                  styles.input,
                  focusedInput === 'confirmPassword' && styles.inputFocused,
                ]}
                placeholder='Confirmar password'
                secureTextEntry
                value={confirmPassword}
                maxLength={10}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                returnKeyType="done" // Último campo no necesita ir a otro
                onSubmitEditing={handleRegister} // Invoca el registro al terminar
            />             
            
             <TouchableOpacity 
                onPress={handleRegister}   
                onPressIn={() => setIsPressed(true)} // Activa el estado "presionado"
                onPressOut={() => setIsPressed(false)} // Desactiva el estado al soltar
                className={`flex-row items-center justify-center rounded-lg ${
                    isPressed ? 'bg-fuchsia-800' : 'bg-fuchsia-600'
                }`}
                style={{
                    width: '80%', // Ajusta el ancho según la pantalla (un 80% del ancho disponible)
                    height: 50, // Altura más estrecha para un diseño estilizado
                    paddingVertical: 10, // Ajusta el relleno vertical
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
                activeOpacity={0.8} // Reduce la opacidad al presionar
                >
                <Image
                    source={iconsave}
                    className="w-8 h-8 mr-2" // Reduce el tamaño del ícono para que encaje con la altura del botón
                    resizeMode="contain"
                />
                <Text className="text-white font-semibold text-base">Guardar</Text> 
                </TouchableOpacity>          
        </View>
        </ScrollView>
    </KeyboardAvoidingView>     
    </SafeAreaView>
    <FlotaButton />
    </>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingHorizontal: 20,
      paddingTop: 40,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 5,
    },
    imagePlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#d3d3d3',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 5,
    },
    placeholderText: {
      color: '#888',
      textAlign: 'center',
    },
    input: {
      width: '80%',
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      marginVertical: 5,
    },
    inputFocused: {
      backgroundColor: 'yellow',
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: 'blue',
      padding: 10,
      marginVertical: 10,
      width: '80%',
      borderRadius: 5,
    },
    buttonText: {
      color: 'white',
      textAlign: 'center',
      fontSize: 16,
    },
  });