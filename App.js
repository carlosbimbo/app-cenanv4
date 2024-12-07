import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, Image,TouchableOpacity,KeyboardAvoidingView,ScrollView,FlatList } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useState, useEffect } from 'react';

import Icon from 'react-native-vector-icons/Ionicons';
import logo from './images/logogesta.png';
import logoeco from './images/icoeco.png';
import logofpp from './images/icofpp.png';
import logofur from './images/icofur.png';
import iconsave from './images/btnsave.png';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import DropDownPicker from 'react-native-dropdown-picker';

//initialize the database
const initializeDatabase = async(db) => {
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username varchar(100) UNIQUE,
                password varchar(10),
                dni varchar(8),
                nombape varchar(150)
            );
        `);

        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS T_05_ETAPA_GESTACIONAL (
                id INTEGER PRIMARY KEY NOT NULL,
                fur varchar(10) NULL,
                fec_proba_parto varchar(10) NULL,
                eco_nro_sem_emb INT NULL,
                eco_nro_dias_emb INT NULL,
                hemoglo varchar(10) NULL
                );
        `);

        console.log('Database initialized !');
    } catch (error) {
        console.log('Error while initializing the database : ', error);
    }
};

//create a stack navigator that manages the navigation between 3 screens
const Stack = createStackNavigator();

//We'll have 3 screens : Login, Register and Home

export default function App() {
  return (
    <SQLiteProvider databaseName='auth.db' onInit={initializeDatabase}>
        <NavigationContainer>
            <Stack.Navigator initialRouteName='Login'>
                <Stack.Screen name='Login' component={LoginScreen} options={{
                title: '',
                headerStyle: {
                    backgroundColor: '#fff', // Color de fondo de la barra de navegación
                    height: 40, // Ajusta la altura
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#fff', // Color del título
                },
                }} />
                <Stack.Screen name='Register' component={RegisterScreen} options={{ title: 'Registro' }} />
                <Stack.Screen name='Home' component={HomeScreen} options={{ title: 'Principal' }}/>

                <Stack.Screen name='Fur' component={FurScreen} options={{
                    title: '',
                    headerStyle: {
                        backgroundColor: '#fff', // Color de fondo de la barra de navegación
                        height: 70, // Ajusta la altura
                    },
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#fff', // Color del título
                    },
                    }} />
                <Stack.Screen name='Eco' component={EcoScreen} options={{ title: 'Ecografia' }}/>
                <Stack.Screen name='Parto' component={PartoScreen} options={{ title: 'Fecha de Parto' }}/>

            </Stack.Navigator>
        </NavigationContainer>
    </SQLiteProvider>
  );
}

//LoginScreen component
const LoginScreen = ({navigation}) => {

    const db = useSQLiteContext();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    //function to handle login logic
    const handleLogin = async() => {
        if(userName.length === 0 || password.length === 0) {
            Alert.alert('Atencion','Porfavor ingrese el Usuario and Password');
            return;
        }
        try {
            const user = await db.getFirstAsync('SELECT * FROM users WHERE username = ?', [userName]);
            if (!user) {
                Alert.alert('Error', 'Usuario no Existe!');
                return;
            }
            const validUser = await db.getFirstAsync('SELECT * FROM users WHERE username = ? AND password = ?', [userName, password]);
            if(validUser) {
                //Alert.alert('Correcto', `Login Exitoso ${validUser.id}`);
                Alert.alert('Correcto', `Login Exitoso`);
                navigation.navigate('Home', {user:validUser});
                setUserName('');
                setPassword('');
            } else {
                Alert.alert('Error', 'Password Incorrecto');
            }
        } catch (error) {
            console.log('Error durante el Login : ', error);
        }
    }
    return (  
        <> 
        <KeyboardAvoidingView>
         <ScrollView>        
            <View className="flex-1 bg-gray-100">
                <View className="p-8 bg-blue-500 rounded-t-3xl shadow-md w-full">
                    <Text className="text-[30px] font-bold text-white text-center mt-6">Bienvenidos</Text>
                    <Text className="text-[18px] text-white text-center mt-4">
                        Aplicacion de Seguimiento a Gestantes en su Etapa de Gestacion en el consumo de sus vitaminas
                    </Text>
                    <TouchableOpacity className="p-4 bg-white rounded-full mt-6">
                        <Text className="text-blue-500 text-center text-[18px]">Inicio</Text>
                    </TouchableOpacity>
                </View>
            </View>            
            <View style={styles.containerAdjusted}>
                <Image source={logo} style={styles.logo} />
                <Text style={styles.title}>App mhealth</Text>               
                <View style={styles.inputContainer}>
                    <Icon name="mail-outline" size={25} style={styles.icon} />
                    <TextInput
                        style={styles.input}                        
                        placeholder="Email"
                        keyboardType="email-address"
                        value={userName}
                        maxLength={100}
                        onChangeText={setUserName}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="lock-closed-outline" size={25} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        maxLength={10}
                        onChangeText={setPassword}
                    />
                </View>                
                <Pressable style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>
                <Pressable style={styles.link} onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.linkText}>No tienes una cuenta? Registrate</Text>                    
                </Pressable>
            </View>  
            </ScrollView>
    </KeyboardAvoidingView>          
        </>
    )
}

//RegisterScreenComponent
const RegisterScreen = ({navigation}) => {

    const db = useSQLiteContext();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [userDni, setUserDni] = useState('');
    const [userNomb, setUserNomb] = useState('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net)$/;
    const isValidEmail = (userName) => emailRegex.test(userName);

    //function to handle registration logic
    const handleRegister = async() => {
        if  (userName.length === 0 || password.length === 0 || confirmPassword.length === 0) {
            Alert.alert('Atencion!', 'Por favor ingrese todos los campos.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Password no coincide');
            return;
        }

        if (!isValidEmail(userName)) {
            Alert.alert('Error', 'Email no valido!');
            return;
        }

        try {
            const existingUser = await db.getFirstAsync('SELECT * FROM users WHERE username = ?', [userName]);
            if (existingUser) {
                Alert.alert('Error', 'Usuario ya existe.');
                return;
            }

            const result = await db.runAsync('INSERT INTO users (username, password,dni,nombape) VALUES (?, ?,?, ?)', [userName, password,userDni,userNomb]);
            Alert.alert('Correcto', 'Registro Completado exitosamente!');
            //const insertedId = result.lastInsertRowId;
            //Alert.alert('Correcto', `Registro completado exitosamente! ID: ${insertedId}`);
            //navigation.navigate('Home', {user : userName});
            navigation.navigate('Login');
        } catch (error) {
            console.log('Error durante el registro : ', error);
        }
    }

    return (
        <KeyboardAvoidingView>
         <ScrollView>   
        <View style={styles.container}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.title}>Registro de Gestante</Text>

            <TextInput 
                style={styles.input}
                placeholder='Nombres y Apellidos'
                value={userNomb}
                onChangeText={setUserNomb}
            />

            <TextInput 
                style={styles.input}
                placeholder='DNI'
                value={userDni}
                maxLength={8}
                keyboardType="numeric"
                onChangeText={setUserDni}
            />

            <TextInput 
                style={styles.input}
                placeholder='Email'
                keyboardType="email-address"
                value={userName}
                onChangeText={setUserName}
            />
            <TextInput 
                style={styles.input}
                placeholder='Password'
                secureTextEntry
                maxLength={10}
                value={password}
                onChangeText={setPassword}
            />
            <TextInput 
                style={styles.input}
                placeholder='Confirmar password'
                secureTextEntry
                value={confirmPassword}
                maxLength={10}
                onChangeText={setConfirmPassword}
            />             
            
            <Pressable style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText} >Guardar</Text>
            </Pressable>
            <Pressable style={styles.link} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Ya tienes una cuenta? Ir a Login</Text>
            </Pressable>
        </View>
        </ScrollView>
    </KeyboardAvoidingView>     
    )
}

//HomeScreen component
const HomeScreen = ({navigation, route}) => {

    const categoryList = [
        {
          id: '1',
          title: 'FECHA DE ULTIMA REGLA',
        },
        {
          id: '2',
          title: 'DATOS DE TU ECOGRAFIA',
        },
        {
          id: '3',
          title: 'FECHA PROBABLE DE PARTO',
        },
      ];
      
      const { user } = route.params;

      const handleNavigation = (id) => {
        switch (id) {
          case '1':
            navigation.navigate('Fur',{user : user});
            break;
          case '2':
            navigation.navigate('Eco',{user : user});
            break;          
          case '3':
            navigation.navigate('Parto',{user : user});
            break;     
          default:
            console.log('Opción no válida');
        }
      };

    //we'll extract the user parameter from route.params
    
    //navigation.navigate('Home', {user : userName});

    const imageMapping = {
        '1': logofur,
        '2': logoeco,
        '3': logofpp,
      };
    
    return (
        <View className="mt-3">
        <Text className="bg-violet-100 p-4 text-black m-10 border border-solid border-green-900 rounded font-bold text-[17px] text-center">En base a la informacion que manejes seleciona una opcion para calcular tu edad gestacional {user.username}-{user.id}</Text>
        <FlatList
          data={categoryList}
          numColumns={1}
          renderItem={({item,index})=>(
            <TouchableOpacity 
            onPress={() => handleNavigation(item.id)}
            className="flex-1 items-center 
            justify-center p-2 border-[1px] border-blue-600 
            m-1 h-[150px] rounded-lg bg-blue-650 ">              
              <Image source={imageMapping[item.id]}
              className="w-[75px] h-[75px] "
              />
             <Text className="text-[14px] mt-1 font-bold">{item.title}</Text>
            </TouchableOpacity>
          )}
        />
    </View>
    )
}

//Para Fur

const FurScreen = ({navigation, route}) => {

    const db = useSQLiteContext();

    //we'll extract the user parameter from route.params
    const { user } = route.params;

    LocaleConfig.locales['fr'] = {
        monthNames: [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Setiembre',
          'Octubre',
          'Noviembre',
          'Diciembre'
        ],
        monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr', 'May', 'Jun', 'Jul.', 'Ago', 'Set.', 'Oct.', 'Nov.', 'Dic.'],
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
        dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mie.', 'Jue.', 'Vie.', 'Sab.'],
        today: "Hoy"
      };
      
      LocaleConfig.defaultLocale = 'fr';

    /////////////////////////////////////
    const [selectedDate, setSelectedDate] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Indicador de carga
  
    // Cargar datos de la base de datos al montar el componente
    useEffect(() => {
      const fetchData = async () => {
        try {
          const validUserFur = await db.getFirstAsync('SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?', [user.id]);
          if (validUserFur) {
            setSelectedDate(validUserFur.fur || ''); // Asignar la fecha obtenida de la BD
          } else {
            setSelectedDate(''); // Si no hay datos, dejar vacío
          }
        } catch (error) {
          console.log('Error al consultar la base de datos:', error);
        } finally {
          setIsLoading(false); // Finaliza el estado de carga
        }
      };
  
      fetchData();
    }, [db, user.id]);
    /////////////////////////////////////
     
      //const [selectedDate, setSelectedDate] = useState('');
      //const [selectedDate, setSelectedDate] = useState('2024-12-01');
    
      const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
        console.log('selected day', day);
     };

     const handleRegiFur = async() => {

        //Alert.alert('Presionaste!', 'Presionaste handleRegiFur!!!');    
                 
            try {   

                const valUserFur = await db.getFirstAsync('SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?', [user.id]);
                
                //Alert.alert('AlGrabar : ' + valUserFur.id, valUserFur.fur);  
                    if(valUserFur){
                        const resultudp =   await db.runAsync('UPDATE T_05_ETAPA_GESTACIONAL SET fur = ? WHERE id = ?', [selectedDate,user.id]);  
                        //const resultudp =   await db.runAsync('UPDATE T_05_ETAPA_GESTACIONAL SET fur = ? WHERE id = ?', [user.id,selectedDate]);  
                        Alert.alert('Correcto', 'Registro FUR Actualizado exitosamente!');      
                        navigation.navigate('Home', {user:user});
                    }else{   
                        const resultins = await db.runAsync('INSERT INTO T_05_ETAPA_GESTACIONAL (id, fur) VALUES (?, ?)', [user.id, selectedDate]);
                        Alert.alert('Correcto', 'Registro FUR Registrado exitosamente!');      
                        navigation.navigate('Home', {user:user});
                       //const insertedId = resultins.lastInsertRowId;
                        //Alert.alert('Correcto', `Registro FUR Registrado exitosamente! ID: ${insertedId}`);
                                                
                    }            

                } catch (error) {
                    console.log('Error durante el registro del FUR : ', error);
                }

        }

        const [isPressed, setIsPressed] = useState(false);
    return(
        <>
        <View style={styles.containercalendario}>
            <Text style={styles.title}>FUR</Text>
            <Image source={logofur}
              className="w-[75px] h-[75px] "
              />                
        </View>
        <View style={styles.containerCalendar}>        
        <TextInput 
                style={styles.input}
                placeholder='Fecha'     
                editable={false}           
                maxLength={10}
                value={selectedDate}
                onChangeText={setSelectedDate}
            />    
        <Calendar
        style={styles.calendar} 
        // Fecha seleccionada y resaltada en forma circular
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#FF6347', // Color del círculo
            textColor: '#FFFFFF', // Color del texto
          },
        }}
        onDayPress={handleDayPress}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#FF6347',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          arrowColor: 'orange',
          monthTextColor: 'blue',
          indicatorColor: 'blue',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 16,
        }}
      />
      
      <TouchableOpacity 
      onPress={handleRegiFur}   
      onPressIn={() => setIsPressed(true)} // Activa el estado "presionado"
      onPressOut={() => setIsPressed(false)} // Desactiva el estado al soltar
      className={`flex-row items-center justify-center rounded-lg ${
        isPressed ? 'bg-blue-700' : 'bg-blue-500'
      }`}
      style={{
        width: '70%', // Ajusta el ancho según la pantalla (un 80% del ancho disponible)
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
    </>
    )   
}

const EcoScreen = ({navigation, route}) => {
    const db = useSQLiteContext();
    const { user } = route.params;

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [open2, setOpen2] = useState(false);
    const [value2, setValue2] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  

   // Cargar datos de la base de datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const validUserEco = await db.getFirstAsync(
          'SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?',
          [user.id]
        );

        if (validUserEco) {
          setValue(String(validUserEco.eco_nro_sem_emb) || '');
          setValue2(String(validUserEco.eco_nro_dias_emb) || '');
        } else {
          setValue('');
          setValue2('');
        }
      } catch (error) {
        console.log('Error al consultar la base de datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [db, user.id]);

  //Alert.alert('guardadoBD', `Valor: ${value} - value2 : ${value2}`); 

    const [items, setItems] = useState([
      { label: 'Semana 1', value: '1' },
      { label: 'Semana 2', value: '2' },
      { label: 'Semana 3', value: '3' },
      { label: 'Semana 4', value: '4' },
      { label: 'Semana 5', value: '5' },
      { label: 'Semana 6', value: '6' },
      { label: 'Semana 7', value: '7' },
      { label: 'Semana 8', value: '8' },
      { label: 'Semana 9', value: '9' },
      { label: 'Semana 10', value: '10' },
      { label: 'Semana 11', value: '11' },
      { label: 'Semana 12', value: '12' },
      { label: 'Semana 13', value: '13' },
      { label: 'Semana 14', value: '14' },
      { label: 'Semana 15', value: '15' },
      { label: 'Semana 16', value: '16' },
      { label: 'Semana 17', value: '17' },
      { label: 'Semana 18', value: '18' },
      { label: 'Semana 19', value: '19' },
      { label: 'Semana 20', value: '20' },
      { label: 'Semana 21', value: '21' },
      { label: 'Semana 22', value: '22' },
      { label: 'Semana 23', value: '23' },
      { label: 'Semana 24', value: '24' },
      { label: 'Semana 25', value: '25' },
      { label: 'Semana 26', value: '26' },
      { label: 'Semana 27', value: '27' },
      { label: 'Semana 28', value: '28' },
      { label: 'Semana 29', value: '29' },
      { label: 'Semana 30', value: '30' },
      { label: 'Semana 31', value: '31' },
      { label: 'Semana 32', value: '32' },
      { label: 'Semana 33', value: '33' },
      { label: 'Semana 34', value: '34' },
      { label: 'Semana 35', value: '35' },
      { label: 'Semana 36', value: '36' },
      { label: 'Semana 37', value: '37' },
      { label: 'Semana 38', value: '38' },
      { label: 'Semana 39', value: '39' },
      { label: 'Semana 40', value: '40' },
    ]);
  
///////////////////////////////////////////////

const [items2, setItems2] = useState([
  { label: '1 dia', value: '1' },
  { label: '2 dias', value: '2' },
  { label: '3 dias', value: '3' },
  { label: '4 dias', value: '4' },
  { label: '5 dias', value: '5' },
  { label: '6 dias', value: '6' }, 
]);
///////////////////////////////////////////////

const handleButtonPress = async () => {
  try {
    const valUserEco = await db.getFirstAsync(
      'SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?',
      [user.id]
    );

    if (valUserEco) {
      await db.runAsync(
        'UPDATE T_05_ETAPA_GESTACIONAL SET eco_nro_sem_emb = ?, eco_nro_dias_emb = ? WHERE id = ?',
        [value, value2, user.id]
      );
      Alert.alert('Correcto', 'Registro de Ecografia Actualizado exitosamente!');      
      navigation.navigate('Home', {user:user});
    } else {
      await db.runAsync(
        'INSERT INTO T_05_ETAPA_GESTACIONAL (id, eco_nro_sem_emb, eco_nro_dias_emb) VALUES (?, ?, ?)',
        [user.id, value, value2]
      );
      Alert.alert('Correcto', 'Registro de Ecografia Registrado exitosamente!');      
      navigation.navigate('Home', {user:user});         
    }
  } catch (error) {
    console.log('Error al guardar los datos:', error);
  }
};
  
  const [isPressed, setIsPressed] = useState(false);
    return (
      <>
        <View className="flex-1 justify-center items-center bg-gray-100 -mt-100">       
          <View style={styles.containercalendario}>
            <Text style={styles.title}>ECOGRAFIA</Text>
            <Image
              source={logoeco}
              className="w-[75px] h-[75px]"
            />
          </View>
  
          <View style={styles.containerCombate}>
            <Text className="text-lg font-bold mb-4 text-center">Número de Semanas</Text>
  
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder="Selecciona una opción"
              style={{
                width: '100%',
                height: 50,
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1',
                borderRadius: 8,
              }}
              dropDownContainerStyle={{
                width: '100%',
                backgroundColor: 'white',
              }}
              textStyle={{
                fontSize: 16,
                color: '#374151', // Gray-700 de Tailwind
              }}
            />
          </View>

          <View style={styles.containerCombate}>
            <Text className="text-lg font-bold mb-4 text-center">Número de dias</Text>
  
            <DropDownPicker
              open={open2}
              value={value2}
              items={items2}
              setOpen={setOpen2}
              setValue={setValue2}
              setItems={setItems2}
              placeholder="Selecciona una opción"
              style={{
                width: '100%',
                height: 50,
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1',
                borderRadius: 8,
              }}
              dropDownContainerStyle={{
                width: '100%',
                backgroundColor: 'white',
              }}
              textStyle={{
                fontSize: 16,
                color: '#374151', // Gray-700 de Tailwind
              }}
            />
          </View>
   <View style={styles.containerCombateButton}>
    <TouchableOpacity 
      onPress={handleButtonPress}   
      onPressIn={() => setIsPressed(true)} // Activa el estado "presionado"
      onPressOut={() => setIsPressed(false)} // Desactiva el estado al soltar
      className={`flex-row items-center justify-center rounded-lg ${
        isPressed ? 'bg-blue-700' : 'bg-blue-500'
      }`}
      style={{
        width: '70%', // Ajusta el ancho según la pantalla (un 80% del ancho disponible)
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

        </View>
      </>
    );
  }

const PartoScreen = ({navigation, route}) => {

    const db = useSQLiteContext();

    //we'll extract the user parameter from route.params
    const { user } = route.params;

    LocaleConfig.locales['fr'] = {
        monthNames: [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Setiembre',
          'Octubre',
          'Noviembre',
          'Diciembre'
        ],
        monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr', 'May', 'Jun', 'Jul.', 'Ago', 'Set.', 'Oct.', 'Nov.', 'Dic.'],
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
        dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mie.', 'Jue.', 'Vie.', 'Sab.'],
        today: "Hoy"
      };
      
      LocaleConfig.defaultLocale = 'fr';
 
    const [selectedDate, setSelectedDate] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Indicador de carga
  
    // Cargar datos de la base de datos al montar el componente
    useEffect(() => {
      const fetchData = async () => {
        try {
          const validUserFpp = await db.getFirstAsync('SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?', [user.id]);
          if (validUserFpp) {
            setSelectedDate(validUserFpp.fec_proba_parto || ''); // Asignar la fecha obtenida de la BD
          } else {
            setSelectedDate(''); // Si no hay datos, dejar vacío
          }
        } catch (error) {
          console.log('Error al consultar la base de datos:', error);
        } finally {
          setIsLoading(false); // Finaliza el estado de carga
        }
      };
  
      fetchData();
    }, [db, user.id]);
      
      const handleDayPressfpp = (day) => {
        setSelectedDate(day.dateString);
        console.log('selected day', day);
     };

     const handleRegiFpp = async() => {

        //Alert.alert('Presionaste!', 'Presionaste handleRegiFpp!!!');    
                 
            try {   

                const valUserFpp = await db.getFirstAsync('SELECT * FROM T_05_ETAPA_GESTACIONAL WHERE id = ?', [user.id]);
                  
                    if(valUserFpp){
                        const resultudp =   await db.runAsync('UPDATE T_05_ETAPA_GESTACIONAL SET fec_proba_parto = ? WHERE id = ?', [selectedDate,user.id]);                          
                        Alert.alert('Correcto', 'Registro FPP Actualizado exitosamente!');      
                        navigation.navigate('Home', {user:user});
                    }else{   
                        const resultins = await db.runAsync('INSERT INTO T_05_ETAPA_GESTACIONAL (id, fec_proba_parto) VALUES (?, ?)', [user.id, selectedDate]);
                        Alert.alert('Correcto', 'Registro FPP Registrado exitosamente!');      
                        navigation.navigate('Home', {user:user});                       
                                                
                    }            

                } catch (error) {
                    console.log('Error durante el registro del FPP : ', error);
                }

        }

        const [isPressed, setIsPressed] = useState(false);
    return(
        <>
        <View style={styles.containercalendario}>
            <Text style={styles.title}>Fecha Probable de Parto</Text>
            <Image source={logofpp}
              className="w-[75px] h-[75px] "
              />                
        </View>
        <View style={styles.containerCalendar}>        
        <TextInput 
                style={styles.input}
                placeholder='Fecha'     
                editable={false}           
                maxLength={10}
                value={selectedDate}
                onChangeText={setSelectedDate}
            />    
        <Calendar
        style={styles.calendar} 
        // Fecha seleccionada y resaltada en forma circular
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#FF6347', // Color del círculo
            textColor: '#FFFFFF', // Color del texto
          },
        }}
        onDayPress={handleDayPressfpp}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#FF6347',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          arrowColor: 'orange',
          monthTextColor: 'blue',
          indicatorColor: 'blue',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 16,
        }}
      />
      
      <TouchableOpacity 
      onPress={handleRegiFpp}   
      onPressIn={() => setIsPressed(true)} // Activa el estado "presionado"
      onPressOut={() => setIsPressed(false)} // Desactiva el estado al soltar
      className={`flex-row items-center justify-center rounded-lg ${
        isPressed ? 'bg-blue-700' : 'bg-blue-500'
      }`}
      style={{
        width: '70%', // Ajusta el ancho según la pantalla (un 80% del ancho disponible)
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
    </>
    )   
}


const styles = StyleSheet.create({
    containerAdjusted: {
        flex: 1.7,
        justifyContent: 'flex-start', // Alinea los elementos al inicio
        alignItems: 'center',
        paddingTop: 20, // Espacio superior ajustable
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
      }, containercalendario: {
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 60,
      },
      logo: {
        height: 150, // Reducido para ajustar el diseño
        width: 150,
        resizeMode: 'contain',
        marginBottom: 10, // Menos margen inferior
    }, icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 22, // Más pequeño para ahorrar espacio
    fontWeight: 'bold',
    marginBottom: 10, // Menos margen inferior
},
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 5,
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
  link: {
    marginTop: 5, // Reducido para ahorrar espacio
},
  linkText: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 14,
},
  userText: {
    fontSize: 18,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15, // Espaciado más compacto entre inputs
},
containerCalendar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 100,
  },
  calendar: {
    width: '100%', // Asegura que el calendario ocupe todo el ancho disponible
    borderRadius: 10, // Opcional: redondea los bordes del calendario
    marginBottom: 20,
  },containerCombate: {
    width: '70%', 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 10,
  },containerCombateButton: {
    width: '100%',     
    justifyContent: 'center',
    alignItems: 'center',    
    paddingHorizontal: 10,
    marginBottom: 100,
  },
  
});
