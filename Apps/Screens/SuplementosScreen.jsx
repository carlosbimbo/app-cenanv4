import { StatusBar } from 'expo-status-bar';
import React, {useState, useRef, useEffect} from 'react';
import { StyleSheet, Text, View, Image, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Slider from '@react-native-community/slider';
import Button from '../Components/Views/Button'
import * as FileSystem from 'expo-file-system';
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

export default function SuplementosScreen({ route }) {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const { user } = route.params;
  const [infogestan, setInfoGestan] = useState([]);
  console.log('SuplementosScreen : ',user);

  
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [mediaLibraryPermissionResponse, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
     
    const [cameraProps, setCameraProps] = useState({
        zoom: 0,
        facing: 'front',
        flash: 'on',
        animateShutter: false,
        enableTorch: false
    });
    const [image, setImage] = useState(null);
    const [previousImage, setPreviousImage] = useState(null);

    const cameraRef = useRef(null);

     //add 05012024
     useEffect(() => {
      const fetchInfoGestan = async () => {
        try {                  
          //const results = await db.getAllAsync('SELECT hemoglo FROM T_05_AGENDA_GESTACIONAL WHERE id = ?', [user.id]);    
          const results = await db.getAllAsync(`SELECT a.calcu_nrosema,a.calcu_nrodias,c.fecha,a.hemoglo,ifnull(c.totalpic,0) as totalpic FROM T_05_ETAPA_GESTACIONAL a left join (select iduser,fecha,COUNT(*) as totalpic from T_05_REGISTRO_SUPLEMENTOS where iduser = 1 and fecha = DATE('now', '-5 hours') group by iduser,fecha limit 1) c on c.iduser = a.id WHERE a.id = ?`, [user.id]);    
          //console.log(results);  
          setInfoGestan(results);
        } catch (error) {
          console.error('Error al obtener datos de la Gestante:', error);
        }
      };
  
      fetchInfoGestan();
    }, [db, user.id]);
    //fin add 05012024

    //to load the last saved image when permissions change
    useEffect(() => {
        if(cameraPermission && cameraPermission.granted && mediaLibraryPermissionResponse && mediaLibraryPermissionResponse.status === 'granted') {
            getLastSavedImage();
        }
    }, [cameraPermission, mediaLibraryPermissionResponse])

    if (!cameraPermission || !mediaLibraryPermissionResponse) {
        // Permissions are still loading.
        return <View />
    }     
  
    if (!cameraPermission.granted || mediaLibraryPermissionResponse.status !== 'granted') {
        // Permissions are not granted yet.
        return (
          <View style={styles.container}>
              <Text>Favor de Brindar los permisos para el uso de la camara y galeria.</Text>
              <TouchableOpacity style={styles.button} onPress={() => {
                  requestCameraPermission();
                  requestMediaLibraryPermission();                  
              }} >
                  <Text style={styles.buttonText}>Otorgar Permisos</Text>
              </TouchableOpacity>
          </View>
        )
    }
  
    //function to toggle camera properties
    const toggleProperty = (prop, option1, option2) => {
        setCameraProps((current) => ({
            ...current,
            [prop]:current[prop] === option1 ? option2 : option1
        }));
    };

    //function to zoom in
    const zoomIn = () => {
        setCameraProps((current) => ({
            ...current,
            zoom: Math.min(current.zoom + 0.1, 1)
        }))
    }

    //function to zoom out
    const zoomOut = () => {
      setCameraProps((current) => ({
          ...current,
          zoom: Math.max(current.zoom - 0.1, 0)
      }))
  }

  //function to take a picture and show it without saving it
  const takePicture = async() => {
      if(cameraRef.current) {
          try {
              const picture = await cameraRef.current.takePictureAsync();
              setImage(picture.uri);
          } catch (err) {
            console.log('Error while taking the picture : ', err);
          }
      }
  }

  const savePicture = async () => {
    if (image) {
      try {

        /*infogestan.map((infgest) => {  

          console.log('calcu_nrosema map ir SupleScreen infogestan : ',infgest.calcu_nrosema);
          console.log('calcu_nrodias map ir SupleScreen infogestan : ',infgest.calcu_nrodias);       
          console.log('hemoglo map ir SupleScreen infogestan : ',parseFloat(infgest.hemoglo)); 

          })
          */

          const suple = await db.getFirstAsync(`SELECT a.calcu_nrosema,a.calcu_nrodias,c.fecha,a.hemoglo,ifnull(c.totalpic,0) as totalpic FROM T_05_ETAPA_GESTACIONAL a left join (select iduser,fecha,COUNT(*) as totalpic from T_05_REGISTRO_SUPLEMENTOS where iduser = 1 and fecha = DATE('now', '-5 hours') group by iduser,fecha limit 1) c on c.iduser = a.id WHERE a.id = ?`, [user.id]);    
          const levelhemo = parseFloat(suple.hemoglo);
          const totalpictu = parseInt(suple.totalpic);
          const calc_nrosema = parseInt(suple.calcu_nrosema);  
          const calc_nrodias = parseInt(suple.calcu_nrodias);  
          
          console.log('Tomooo foto levelhemo save : ',levelhemo);
          console.log('Tomooo foto totalpictu save : ',totalpictu);    

        // Generar la fecha actual en formato YYYY-MM-DD
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  
        // Crear el nombre con la fecha
        //const newFileName = `${user.id}_${formattedDate}.jpg`;
        let newFileName;  
        if(levelhemo>=11){
          if(totalpictu<1){
            newFileName = `${user.id}_${formattedDate}.jpg`;
            console.log('Graba Gestan normal foto');
          }
        }else{
          if(totalpictu<2){
            const wnamepic = totalpictu + 1;
            newFileName = `${user.id}_${formattedDate}_${wnamepic}.jpg`;
            console.log('Graba Gestan Anemica foto');
          }
        }

        //add 04012025         
        // Crear un directorio personalizado dentro de FileSystem.documentDirectory
        const directoryUriapp = FileSystem.documentDirectory + 'fotosCenan';
        const directoryInfo = await FileSystem.getInfoAsync(directoryUriapp);

        if (!directoryInfo.exists) {
          // Si no existe, creamos el directorio
          await FileSystem.makeDirectoryAsync(directoryUriapp, { intermediates: true });
          console.log('Directorio creado:', directoryUriapp);
        }

        // Definir la ruta completa para la imagen
        const destinationUriapp = directoryUriapp + '/' + newFileName;
        console.log('destinationUriapp fotoCopiada:', destinationUriapp);

        // Verificar si el archivo ya existe
        const fileInfoapp = await FileSystem.getInfoAsync(destinationUriapp);
        if (fileInfoapp.exists) {
          console.log('Archivo existente encontrado, eliminando:', destinationUriapp);
          await FileSystem.deleteAsync(destinationUriapp);
        }
        // Copiar la foto al nuevo directorio
        await FileSystem.copyAsync({
          from: image,
          to: destinationUriapp,
        });
        //Fin add 04012025

        
        
        // Obtener el directorio temporal
        const destinationUri = FileSystem.documentDirectory + newFileName;
        console.log('Destino de la foto:', destinationUri);
        
        // Verificar si el archivo ya existe
        const fileInfo = await FileSystem.getInfoAsync(destinationUri);
        console.log('Info del archivo:', fileInfo);
  
        if (fileInfo.exists) {
          console.log('Archivo existente encontrado, eliminando:', destinationUri);
  
          // Intentar eliminar la imagen existente
          try {
            await FileSystem.deleteAsync(destinationUri);
            console.log('Archivo eliminado correctamente:', destinationUri);
          } catch (deleteError) {
            console.log('Error al eliminar el archivo:', deleteError);
            throw new Error('No se pudo eliminar el archivo existente');
          }
  
        }

        //const fileAfterDel = await FileSystem.getInfoAsync(destinationUri);
        //const fileAfterDelFINAL = await FileSystem.getContentUriAsync(destinationUri);
        //const fileAfterDelFINAL = await MediaLibrary.getAlbumAsync('DCIM');
        //const assetInfo = await MediaLibrary.getAssetInfoAsync(assets[0].id);
        //console.log('Info del archivo fileAfterDelFINAL :', assetInfo.uri);

        /////////////////
         // Obtener las fotos de la galería, puedes filtrar por la carpeta o nombre del archivo si lo deseas
         
         /*const dcimAlbum = await MediaLibrary.getAlbumAsync('DCIM');

         if (dcimAlbum) {
           const { assets } = await MediaLibrary.getAssetsAsync({
             album: dcimAlbum,
             sortBy: [[MediaLibrary.SortBy.creationTime, false]],
             mediaType: MediaLibrary.MediaType.photo,
             first: 20,
           });
        
            // Buscar la foto por su nombre (en este caso, el nombre basado en la fecha)
            console.log('Info del archivo photoAsset JO :', newFileName);
            const photoAsset = assets.find(asset => asset.uri.includes(newFileName));            
            if (photoAsset) {
            if (photoAsset.length > 0) {
            console.log('Info del archivo photoAsset FINAL :', photoAsset.uri);
            
                await MediaLibrary.deleteAssetsAsync([photoAsset.id]);
            console.log('Archivo eliminado correctamente MediaLibrary:', photoAsset.uri);
            }
          }

            
        }*/
        
        /////////////////

        //ADD DOMINGO 05012025
        const dcimAlbum = await MediaLibrary.getAlbumAsync('DCIM');

         if (dcimAlbum) {
           const { assets } = await MediaLibrary.getAssetsAsync({
             album: dcimAlbum,
             sortBy: [[MediaLibrary.SortBy.creationTime, false]],
             mediaType: MediaLibrary.MediaType.photo,
             first: 100,
           });
        
            // Buscar la foto por su nombre (en este caso, el nombre basado en la fecha)
            console.log('Info del archivo photoAsset JUJUJUX :', newFileName);

            console.log('mIRA assets DE dcim  :', assets);
            const photoAsset = assets.find(asset => asset.filename === newFileName);   
            if(photoAsset){         
            console.log('ZZZZ photoAsset de dcim  :', photoAsset);

            const photoInfo = await MediaLibrary.getAssetInfoAsync(photoAsset.id);
            console.log('Infowww del archivo photoInfo.uri :', photoInfo.uri);
            console.log('Infowww del archivo photoInfo.localUri :', photoInfo.localUri);
            
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Permission to access media library is required.');
              return;
            }
                
            //await MediaLibrary.deleteAssetsAsync([photoAsset.id]); //esto funciona pero no vamos a eliminar la foto
            //await FileSystem.deleteAsync(photoInfo.uri); //esto No funciona solo funciona dentro de la app fuera no
            console.log('Archivo eliminado XXX correctamente MediaLibrary:', photoAsset.uri);
            }

            
        }
        //FIN ADD DOMINGO 05012025
           
            // Copiar la nueva imagen al destino
            console.log('Copiando la nueva imagen al destino JOJO...');
            await FileSystem.copyAsync({
            from: image,
            to: destinationUri,
            });
          
  
        // Crear el asset en la librería de medios
        const asset = await MediaLibrary.createAssetAsync(destinationUri);
      
        Alert.alert('Foto Guardada!', `Nombre: ${newFileName}`);
        setImage(null);
        getLastSavedImage();

        //add 20122024
        //const suple = await db.getFirstAsync('SELECT * FROM T_05_REGISTRO_SUPLEMENTOS WHERE fecha = ? and iduser = ?', [formattedDate,user.id]);
           
        //Add 20122024        
        let calcfinal_nrosema=0;
        
        if(calc_nrodias>0){
          calcfinal_nrosema = (calc_nrosema + 1);
        }else{
          calcfinal_nrosema = calc_nrosema;
        }
        //

        const result = await db.getFirstAsync(
          "SELECT COALESCE(MAX(idsuple), 0) + 1 AS nextId FROM T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ?",
          [user.id]
        );
        const nextIdsuple = result.nextId;
        
          if(levelhemo>=11){
            if(totalpictu<1){  
              await db.runAsync(
                "INSERT INTO T_05_REGISTRO_SUPLEMENTOS (idsuple, iduser, fecha, foto,destinationUri,nro_sema) VALUES (?, ?, ?, ?, ?, ?)",
                [nextIdsuple, user.id, formattedDate, newFileName,destinationUri,calcfinal_nrosema]
              );
              console.log('Graba Gestan normal foto');
            }
          }else{
            if(totalpictu<2){
              await db.runAsync(
                "INSERT INTO T_05_REGISTRO_SUPLEMENTOS (idsuple, iduser, fecha, foto,destinationUri,nro_sema) VALUES (?,?, ?, ?, ?, ?)",
                [nextIdsuple, user.id, formattedDate, newFileName,destinationUri,calcfinal_nrosema]
              );
              console.log('Graba Gestan Anemica foto');
            }
          }
         

        /*if (!suple) {
          console.log('Entre GUardar T_05_REGISTRO_SUPLEMENTOS!! una foto nueva mas');     
        await db.runAsync(
          "INSERT INTO T_05_REGISTRO_SUPLEMENTOS (iduser, fecha, foto,destinationUri) VALUES (?, ?, ?, ?)",
          [user.id, formattedDate, newFileName,destinationUri]
        );
        }
        */
        navigation.push('supleme-calendar', {          
          user: user,
        })
        //Fin add 20122024
      } catch (err) {
        console.log('Error mientras guardaba la imagen:', err);
        Alert.alert('Error', 'Hubo un error al guardar la foto.');
      }
    }
  };

  const getLastSavedImage = async () => {
    if (mediaLibraryPermissionResponse && mediaLibraryPermissionResponse.status === 'granted') {
      const dcimAlbum = await MediaLibrary.getAlbumAsync('DCIM');

      if (dcimAlbum) {
        const { assets } = await MediaLibrary.getAssetsAsync({
          album: dcimAlbum,
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
          mediaType: MediaLibrary.MediaType.photo,
          first: 1,
        });

        if (assets.length > 0) {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(assets[0].id);
          setPreviousImage(assetInfo.localUri || assetInfo.uri);
        } else {
          setPreviousImage(null);
        }
      } else {
        setPreviousImage(null);
      }
    }
  };

  return (
    <View style={styles.container}>
      {!image ? (
          <>
              <View style={styles.topControlsContainer}>
              
              <Button 
                    icon="flash-on" 
                    family="MaterialIcons" 
                    onPress={() => toggleProperty('flash', 'on', 'off')}
                    />
                    <Button 
                    icon="flashlight-off" 
                    family="MaterialIcons" 
                    onPress={() => toggleProperty('enableTorch', true, false)}
                    />
                    <Button 
                    icon="camera" 
                    family="Ionicons" 
                    onPress={takePicture}
                    />
                    <Button 
                    icon="flip-camera-ios" 
                    family="MaterialIcons" 
                    onPress={() => toggleProperty('facing', 'front', 'back')}
                    />

            </View>
            <CameraView 
                style={styles.camera} 
                zoom={cameraProps.zoom}
                facing={cameraProps.facing}
                flash={cameraProps.flash}
                animateShutter={cameraProps.animateShutter}
                enableTorch={cameraProps.enableTorch}
                ref={cameraRef}
            />
            <View style={styles.sliderContainer}>
            <Button 
                icon="zoom-out" 
                family="MaterialIcons" 
                onPress={zoomOut}
                />
              <Slider 
                  style= {styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={cameraProps.zoom}
                  onValueChange={(value) => setCameraProps((current) => ({...current, zoom:value}))}
                  step={0.1}
              />
              <Button 
                icon="zoom-in" 
                family="MaterialIcons" 
                onPress={zoomIn}
                />
            </View>
            <View style={styles.bottomControlsContainer}> 
                <TouchableOpacity onPress={() => previousImage && setImage(previousImage)}>
                    <Image 
                        source={{uri:previousImage}}
                        style={styles.previousImage}
                    />
                </TouchableOpacity>
                
                <Button 
                    icon='camera'
                    size={60}
                    style={{height:60}}
                    onPress={takePicture}
                />
                <Button 
                icon="flip-camera-ios" 
                family="MaterialIcons" 
                onPress={() => toggleProperty('facing', 'front', 'back')} 
                size={40}
                />
            </View>
          </>
      ) : (
          <>
            <Image source={{uri:image}} style={styles.camera}/>
              <View style={styles.bottomControlsContainer}>
              <Button 
                icon="flip-camera-android" 
                family="MaterialIcons" 
                onPress={() => setImage(null)}
                />

                <Button 
                icon="check" 
                family="MaterialIcons" 
                onPress={savePicture}
                />

              </View>
          </>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 0,
  },
  topControlsContainer: {
    height: 100,
    backgroundColor:'black',
    flexDirection: 'row',
    justifyContent:'space-around',
    alignItems: 'center'
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    margin: 10,
    borderRadius: 5,
},
buttonText: {
    color: 'white',
    fontSize: 16,
},
camera: {
  flex:1,
  width: '100%',
},
slider: {
  flex:1,
  marginHorizontal: 10,
},
sliderContainer: {
  position: 'absolute',
  bottom: 120,
  left : 20,
  right: 20,
  flexDirection: 'row'
},
bottomControlsContainer: {
  height:100,
  backgroundColor: 'black',
  flexDirection: 'row',
  justifyContent:'space-around',
  alignItems:'center'
},
previousImage: {
  width:60,
  height:60,
  borderRadius: 50
}
});