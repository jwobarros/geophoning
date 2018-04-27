import React, { Component } from 'react';
import { View, Text, Image, ActivityIndicator, Alert, StyleSheet, StatusBar, TouchableOpacity, Vibration, ScrollView } from 'react-native';
import { Location, MapView, Camera, Permissions, FileSystem } from 'expo';
import { Header, Button, Icon, FormLabel, FormInput, FormValidationMessage, Badge, Divider } from "react-native-elements";
import MapViewDirections from 'react-native-maps-directions';
import axios from 'axios';

import styles from '../static/styles';

const GOOGLE_MAPS_APIKEY = 'AIzaSyCyH3WXs70xDF5DrJ72ih-7tTQn1D8CnBw';
const LATITUDE_DELTA = 0.001;
const LONGITUDE_DELTA = 0.001;
const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

export default class Map extends Component {

    state = {
        mapRegion: { 
          latitude: -15.587265,
          longitude: -56.08016, 
          latitudeDelta: LATITUDE_DELTA, 
          longitudeDelta: LONGITUDE_DELTA 
        },

        mapLoaded: false,
        loadingMessage: '',
        origin: null,
        destination: null,
        route: [],
        waypoints: [],
        distance: 0,
        geophoning: false,
        loading_watch_position: false,

        show_options: "map",
        show_marker_form: false,
        show_route_points: false,
    
        markers: [],
        markerTitle: "",
        markerDescription: "",
        markerTitleError: "",
        markerDescriptionError: "",
        markerKey: null,
        photos: [],

        hasCameraPermission: null,
        type: Camera.Constants.Type.back,        
        flash: 'off'
    };
      
    watchId = null
    markerCounter = 0

    async componentWillMount() {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      this.setState({ hasCameraPermission: status === 'granted' });
    };

    componentDidMount() {
      StatusBar.setBackgroundColor('#00558A');
      FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos')  
      this._get_current_position();    
    };  

    componentWillUnmount() {
      if (this.watchId != null) {
        this._stop_watch_position();
      }
    };

    _get_current_position = async () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.setState({
              mapRegion: { 
                latitude: position.coords.latitude, 
                longitude: position.coords.longitude, 
                latitudeDelta: LATITUDE_DELTA, 
                longitudeDelta: LONGITUDE_DELTA 
              },
              mapLoaded: true
          })
        },
        (error) => this.setState({ error: error.message }),
        { enableHighAccuracy: true, timeout: 120000},
      );
    };

    _updateLocation = async (location) => {

        var route = this.state.route;
        var waypoints = route.slice(1, -1);
    
        if (waypoints.length > 23) {      
          while (waypoints.length > 23) {
            var temp = []
            waypoints.forEach( function (value, index) {
              if (index % 2 == 0) {
                temp.push(value);
              }          
            })
            waypoints = temp
          }
        }

        this.setState({waypoints: waypoints});
    
        this.setState({
          mapRegion: { 
            latitude: location.coords.latitude, 
            longitude: location.coords.longitude, 
            latitudeDelta: LATITUDE_DELTA, 
            longitudeDelta: LONGITUDE_DELTA 
          },
          route: [...this.state.route, 
            {
              latitude: location.coords.latitude, 
              longitude: location.coords.longitude,   
            }
          ]
        } 
       );
    
    };
    
    _watch_position = async () => {
        this.setState({
            loading_watch_position: true,
            show_options: 'map'
        });
        
        this.watchId = await Location.watchPositionAsync(
            options = {enableHighAccuracy: true, distanceInterval: 10},
            callback = currentLocation => {
              this.setState({geophoning: true});
              this._updateLocation(currentLocation);
            }
        );
    };
    
    _stop_watch_position = () => {
      this.watchId.remove();      
    };  
    
    _reposition_markers = async () => {
        let markers = this.state.markers
        let temp_markers = []
        markers.map( marker => {

            if (!marker.repositioned) {
                let google_directions_api = "https://maps.googleapis.com/maps/api/directions/json"
                axios.get(google_directions_api, {
                    params: {
                    origin: marker.coords.latitude + "," + marker.coords.longitude,
                    destination:  marker.coords.latitude + "," + marker.coords.longitude,
                    waypoints: [],
                    key: GOOGLE_MAPS_APIKEY,
                    mode: "walking",
                    language: "pt-br"
                    }
                })
                .then(function (response) {
                    let data = response.data
                    
                    let new_marker = {
                        coords: {
                          latitude: data.routes[0].bounds.northeast.lat,
                          longitude: data.routes[0].bounds.northeast.lng
                        },
                        title: marker.title,
                        description: marker.description,
                        key: marker.key,
                        repositioned: true
                    }
                    temp_markers.push(new_marker);
                })
                .catch(function (error) {
                    temp_markers.push(marker);
                });
            }
            else {
                temp_markers.push(marker);
            }

        });
                          
        this.setState({markers: temp_markers});

    };

    _add_marker = () => {
      if (this.state.markerDescription != "" && this.state.markerTitle != "") {
        this.markerCounter += 1; 
        this.setState(
          {
          show_options: "camera",
          markerKey: this.markerCounter,
          show_marker_form: false,
          markerError: "",
          markers: [
            ...this.state.markers, 
            {
              coords: {
                latitude: this.state.mapRegion.latitude,
                longitude: this.state.mapRegion.longitude
              },
              title: this.state.markerTitle,
              description: this.state.markerDescription,
              key: this.markerCounter,
              photos: [],
              repositioned: false
            }
          ]},
          this._reposition_markers
        );
        
      }

      if ( this.state.markerDescription == "" ) {
        this.setState({markerDescriptionError: "Este campo é obrigatório."})
      }

      if ( this.state.markerTitle == "" ) {
        this.setState({markerTitleError: "Este campo é obrigatório."})
      }
    };

    _edit_marker = () => {
      var markerKey = this.state.markerKey;
      var markers = this.state.markers;
      var markerTitle = this.state.markerTitle;
      var markerDescription = this.state.markerDescription;

      if (this.state.markerTitle != "" && this.state.markerDescription != "") {
        this.setState({show_options: "map", markerTitleError: "", markerDescriptionError: ""});


        this.state.markers.forEach(function(value, i) {
          if (value.key === markerKey) {
            markers[i].title = markerTitle;
            markers[i].description = markerDescription;
          }

        });

        this.setState({markers: markers});

      } 

      if (this.state.markerTitle === "") {
        this.setState({markerTitleError: "Este campo é obrigatório."})
      }

      if (this.state.markerDescription === "") {
        this.setState({markerDescriptionError: "Este campo é obrigatório."})
      }
    };


    // CAMERA
    toggleFlash() {
      this.setState({
        flash: flashModeOrder[this.state.flash],
      });
    };
  
    render_flash_icon = () => {
      if (this.state.flash == 'on') {
          return <Icon name='flash' type='material-community' color='white' />
      } 
      else if (this.state.flash == 'off') {
          return <Icon name='flash-off' type='material-community' color='white' />
      } 
      else if (this.state.flash == 'auto') {
          return <Icon name='flash-auto' type='material-community' color='white' />
      } 
      else if (this.state.flash == 'torch') {
          return <Icon name='lightbulb-on' type='material-community' color='white' />
      } 
    };
  
    takePicture = async () => {
      let markers = this.state.markers;
      let temp_markers = []

      markers.map(marker => {

        if (marker.key === this.state.markerKey) {

          if (this.camera && this.state.photos.length <= 2 )  {

            let date = new Date().getDate();
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();
            let hour = new Date().getHours();
            let minutes = new Date().getMinutes();
            let seconds = new Date().getSeconds();

            let today = date + '-' + month + '-' + year + '-' + hour + ':' + minutes + ':' + seconds;

            let photoName = `MarkerKey-${marker.key}_DateTime-${today}`;

            console.log(photoName);

            this.camera.takePictureAsync().then(data => {
              Vibration.vibrate();
              FileSystem.moveAsync({
                from: data.uri,
                to: `${FileSystem.documentDirectory}photos/${photoName}.jpg`,
              }).then(() => {
                  this.setState({photos: [...this.state.photos, `${FileSystem.documentDirectory}photos/${photoName}.jpg`]})
                  marker.photos = [...this.state.photos, `${FileSystem.documentDirectory}photos/${photoName}.jpg`]
                  temp_markers.push(marker);

              });
            });

          }

          else if (this.state.photos.length > 2) {
            Alert.alert('Cada ponto só pode conter no máximo três fotos!')
          }

        }
        else {
          temp_markers.push(marker);
        }
      });
  
      this.setState({markers: temp_markers});
  
    };

    // CONDITIONAL RENDERS

    _render_map = () => {
      return (
            <View style={{flex: 1}}>
               <MapView
               style={styles.map}
               region={this.state.mapRegion}
               loadingEnabled={true}
               >

                  <MapView.Circle 
                    center={{latitude: this.state.mapRegion.latitude, longitude: this.state.mapRegion.longitude}}
                    radius={1}
                    strokeWidth={1}
                    strokeColor='rgba(61, 109, 204, 1)'
                    fillColor='rgba(61, 109, 204, 0.8)'
                  />

                  <MapView.Circle 
                    center={{latitude: this.state.mapRegion.latitude, longitude: this.state.mapRegion.longitude}}
                    radius={5}
                    strokeWidth={2}
                    strokeColor='rgba(61, 109, 204, 0.3)'
                    fillColor='rgba(61, 109, 204, 0.3)'
                  />

                   {this.state.markers.map(marker => (
                   <MapView.Callout>
                       <MapView.Marker
                       key={marker.key}
                       coordinate={marker.coords}
                       title={marker.title}
                       description={marker.description}
                       onCalloutPress={() => 
                           {
                               this.setState({
                                   show_options: 'markerOptions', 
                                   markerKey: marker.key,
                                   markerTitle: marker.title, 
                                   markerDescription: marker.description, 
                                   photos: marker.photos,
                                   markerTitleError: "",
                                   markerDescriptionError: ""                    
                               });
                           }
                       }
                       draggable
                       onDragEnd={(e) => {
                         let coordinate = e.nativeEvent.coordinate
                         let markers = this.state.markers
                         let temp_merkers = []

                         markers.map( point => {
                           if (point.key === marker.key) {
                             temp_merkers.push({
                               coords: {
                                 latitude: coordinate.latitude,
                                 longitude: coordinate.longitude
                               },
                               title: marker.title,
                               description: marker.description,
                               key: marker.key,
                               repositioned: true
                             })
                           } else {
                             temp_merkers.push(point);
                           }
                         } );

                         this.setState({markers: temp_merkers});
                         
                       }}
                       />
                   </MapView.Callout>
                   ))}

                   { this.state.waypoints.map(point => (
                      <MapView.Callout>
                        <MapView.Marker
                          coordinate={point}
                          title={"waypoint"}
                          pinColor={'blue'}
                        />
                      </MapView.Callout>
                   ))

                   }

                   {this._render_start_marker()}
                   {this._render_end_marker()}

                   <MapViewDirections
                   ref='MapDirections'
                   origin={this.state.route[0]}
                   destination={this.state.route.slice(-1)[0]}
                   apikey={GOOGLE_MAPS_APIKEY}
                   waypoints={this.state.waypoints}
                   language="pt-BR"
                   mode="walking"
                   strokeWidth={10}
                   strokeColor="blue"
                   onReady={(params) => {
                      this.setState({show_route_points: true, origin: params.coordinates[0], destination: params.coordinates[1], distance: params.distance * 1000});
                    }}
                   resetOnChange={true}
                   />


               </ MapView>
                <View style={{
                  flexDirection: 'row', 
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  backgroundColor: '#005C8F',
                  padding: 5
                }}>
                  <Badge containerStyle={{ backgroundColor: '#fff'}}>
                    <Text>Marcadores: {this.state.markers.length}</Text>
                  </Badge>
    
                  <Badge containerStyle={{ backgroundColor: '#fff'}}>
                    <Text>Distância: {this.state.distance} Metros</Text>
                  </Badge>
              </View>
            </View>           

      );
    };

    _render_camera = () => {
      const { hasCameraPermission } = this.state;
      if (hasCameraPermission === null) {
        return <View />;
      } else if (hasCameraPermission === false) {
        return <View style={{ flex: 1, justifyContent: 'center' }}><Text>Sem acesso a Câmera</Text></View>
      } else {
        return (
          <View style={{ flex: 1 }}>
              <StatusBar
                barStyle="light-content"
                backgroundColor="#00558A"
              />
            <Camera 
            ref={ref => {this.camera = ref}} 
            style={{ flex: 1 }} 
            type={this.state.type}
            autoFocus='on'
            flashMode={this.state.flash}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'column',
                }}>
                  <View style={[styles.button_container, {marginTop: 10}]}>
  
                      <TouchableOpacity onPress={this.toggleFlash.bind(this)}>                        
                          {this.render_flash_icon()}
                      </TouchableOpacity>
  
                      <Text style={{color: 'white', fontSize: 18}}>Fotos: {this.state.photos.length}</Text>
  
                      <TouchableOpacity
                          onPress={() => {
                          this.setState({
                              type: this.state.type === Camera.Constants.Type.back
                              ? Camera.Constants.Type.front
                              : Camera.Constants.Type.back,
                          });
                          }}
                      >
                          <Icon name='cached' color='white' />
  
                      </TouchableOpacity>
  
                  </View>
  
              </View>
  
              <TouchableOpacity
                  style={[styles.picButton, {alignSelf: 'center', alignContent: 'center', alignItems: 'center'}]}
                  onPress={this.takePicture.bind(this)} 
              /> 
  
            </Camera>
          </View>
        );
      }
    };

    _render_start_marker = () => {
        if ( this.state.show_route_points && this.state.origin != null ) {
          return (
            <MapView.Callout>
              <MapView.Marker
                coordinate={this.state.origin}
                title={"INÍCIO DA ROTA"}
                pinColor={'green'}
                ref="origin"
              />
            </MapView.Callout>
          );
        }
        else return null    
    };
    
    _render_end_marker = () => {
        if ( this.state.show_route_points && this.state.destination != null ) {
          return (
            <MapView.Callout>
              <MapView.Marker
                coordinate={this.state.destination}
                title={"FIM DA ROTA"}
                pinColor={'green'}
                ref="destination"
              />
            </MapView.Callout>
          );
        }
        else return null    
    };

    _render_options = () => {
      return (
        <View style={styles.options}>

          <View style={{flex: 1, justifyContent: 'center'}}>

            {this._render_buttons()}

          </View>

          <View style={styles.footer}>
            <Icon name='copyright' />
            <Text> 2018 - Nascentes do Xingu</Text>
          </View>

        </View>
      );
    };

    _render_marker_edit_form = () => {     
      return (
        <View style={[{flex: 1, justifyContent: 'center'}, styles.options]}>
        
            <View style={{flex: 1, justifyContent: 'center'}}>
      
              <Text style={[styles.title, {marginTop: 20}]}>{this.state.markerTitle}</Text>
      
              <View style={{flex: 1, justifyContent: 'center'}}>

                <FormLabel>Título do Ponto</FormLabel>
                <FormInput value={this.state.markerTitle} onChangeText={ text => this.setState({markerTitle: text}) }/>
                <FormValidationMessage>{this.state.markerTitleError}</FormValidationMessage>
    
                <FormLabel>Descrição</FormLabel>
                <FormInput value={this.state.markerDescription} onChangeText={ text => this.setState({markerDescription: text}) }/>
                <FormValidationMessage>{this.state.markerDescriptionError}</FormValidationMessage>
    
                <View style={[styles.button_container, {marginBottom: 30}]}>
                  <Button 
                    title="Cancelar"
                    onPress={ () => this.setState({show_options: 'markerOptions'}) }
                    buttonStyle={[styles.button_style, {backgroundColor: '#00558A'}]}
                  />
                  <Button 
                    title="Inserir"            
                    buttonStyle={[styles.button_style, {backgroundColor: '#00558A'}]}
                    onPress={ () => this._edit_marker() }
                  />
                </View>  

              </View>

            <View style={styles.footer}>
              <Icon name='copyright' />
              <Text> 2018 - Nascentes do Xingu</Text>
            </View>

          </View>
        </View>
      );
    };

    _render_add_marker_options = () => {
        return (
          <View style={[{justifyContent: 'center'}, styles.options]}>

            <View style={{flex: 1, justifyContent: 'center'}}>

              <Text style={[styles.title, {marginTop: 30}]}>Inserir Ponto</Text>

              <FormLabel>Título do Ponto</FormLabel>
              <FormInput value={this.state.markerTitle} onChangeText={ text => this.setState({markerTitle: text}) }/>
              <FormValidationMessage>{this.state.markerTitleError}</FormValidationMessage>

              <FormLabel>Descrição</FormLabel>
              <FormInput value={this.state.markerDescription} onChangeText={ text => this.setState({markerDescription: text}) }/>
              <FormValidationMessage>{this.state.markerDescriptionError}</FormValidationMessage>

              <View style={[styles.button_container, {marginBottom: 30}]}>

                  <Button 
                    title="Cancelar"
                    onPress={ () => this.setState({show_options: "map", show_marker_form: false}) }
                    buttonStyle={[styles.button_style, {backgroundColor: '#00558A'}]}
                  />
                  <Button 
                    title="Inserir"
                    onPress={ () => this._add_marker() }
                    buttonStyle={[styles.button_style, {backgroundColor: '#00558A'}]}
                  />              
              </View> 
 
            </View> 

          <View style={styles.footer}>
            <Icon name='copyright' />
            <Text> 2018 - Nascentes do Xingu</Text>
          </View>

          </View>
        );
    };

    _render_delete_marker_options = () => {
      return (
        <View style={[{justifyContent: 'center'}, styles.options]}>

          <Text style={[styles.title, {marginTop: 30}]}>{this.state.markerTitle}</Text>

          <View style={{flex: 1, justifyContent: 'center'}}>

            <Text style={{fontSize: 15, color: '#d9534f', fontWeight: 'bold', textAlign: 'left', marginLeft: 17}}>Realmente deseja deletar este ponto?</Text>

            <View style={styles.dangerZone}> 
              <View style={styles.button_container}>
                  
                  <Button 
                    title="Cancelar"
                    onPress={ () => this.setState({show_options: "markerOptions"}) }
                    buttonStyle={[styles.button_style, {backgroundColor: '#00558A'}]}
                  />             
                  <Button 
                    title="Deletar"
                    buttonStyle={[styles.button_style, {backgroundColor: '#d9534f'}]}
                    onPress={ () => {
                        this.setState({show_options: 'map'});
                        var markerKey = this.state.markerKey;
                        var markers = this.state.markers;

                        this.state.markers.forEach(function(value, i) {
                          if (value.key === markerKey) {
                            markers.splice(i, 1);
                        }

                      });

                      this.setState({markers: markers});

                      }            
                    }          
                  />
                </View>   

            </View> 

          </View> 

          <View style={styles.footer}>
            <Icon name='copyright' />
            <Text> 2018 - Nascentes do Xingu</Text>
          </View>

        </View>
      );
    };

    _render_photos_marker_options = () => {
      return (
        <View style={[{justifyContent: 'center'}, styles.options]}>

          <Text style={[styles.title, {marginTop: 30}]}>{this.state.markerTitle}</Text>

          <View style={{flex: 1}}>

            <ScrollView>

              {this.state.photos.map( uri => (<Image style={{ aspectRatio: 1.5, resizeMode: 'contain', margin: 5}} source={{uri}} />))}

            </ScrollView> 

          </View> 

          <View style={styles.footer}>
            <Icon name='copyright' />
            <Text> 2018 - Nascentes do Xingu</Text>
          </View>

        </View>
      );
    };

    _render_marker_options = () => {
        return (
          <View style={[{flex: 1, justifyContent: 'center'}, styles.options]}>
          
            <View style={{flex: 1, justifyContent: 'center'}}>
      
              <Text style={[styles.title, {marginTop: 20}]}>{this.state.markerTitle}</Text>
      
              <View style={{flex: 1, justifyContent: 'center'}}>

                <Text style={{fontSize: 15, color: '#d9534f', fontWeight: 'bold', textAlign: 'left', marginLeft: 17}}>Cuidado</Text>
                <View style={styles.dangerZone}>                
                  <Button 
                    title="Deletar"
                    buttonStyle={[styles.button_style, {backgroundColor: '#d9534f'}]}
                    onPress={ () => {
                        this.setState({show_options: 'deleteMarker'});
                        var markerKey = this.state.markerKey;
                        var markers = this.state.markers;

                        this.state.markers.forEach(function(value, i) {
                          if (value.key === markerKey) {
                            markers.splice(i, 1);
                        }

                      });

                      this.setState({markers: markers});

                      }            
                    }          
                  />
                </View>

                <Divider style={{backgroundColor: '#00558A', margin: 20, height: 2}}/>

                <Text style={{fontSize: 15, color: '#f0ad4e', fontWeight: 'bold', textAlign: 'left', marginLeft: 17}}>Cuidado</Text>
                <View style={styles.warningZone}>     
                          
                <Button 
                  title="Editar"
                  buttonStyle={[styles.button_style, {backgroundColor: '#f0ad4e'}]}
                  onPress={ () => this.setState({show_options: 'editMarker'}) }
                />

                </View>

                <Divider style={{backgroundColor: '#00558A', margin: 20, height: 2}}/>

                <Text style={{fontSize: 15, color: '#599014', fontWeight: 'bold', textAlign: 'left', marginLeft: 17}}>Fotos</Text>
                <View style={styles.successZone}> 
                  <Button 
                    title="Ver Fotos"
                    buttonStyle={[styles.button_style, {backgroundColor: '#599014'}]}
                    onPress={ () => this.setState({show_options: 'photosMarker'}) }
                  />                         
                </View>
      
              </View>  
     
            </View>

            <View style={styles.footer}>
              <Icon name='copyright' />
              <Text> 2018 - Nascentes do Xingu</Text>
            </View>

          </View>
        );
    };

    _render_buttons = () => {
        if ( this.state.geophoning ) {
          return (
            <View style={{flex: 1}}>

              <Text style={[styles.title, {marginTop: 30}]}>OPÇÕES</Text>

                <View style={{flex: 1, justifyContent: 'space-around'}}>

                  <View>
                    <Text style={{fontSize: 15, color: '#d9534f', fontWeight: 'bold', textAlign: 'left', marginLeft: 17}}>Cuidado</Text>

                    <View style={[styles.dangerZone, {justifyContent: 'center'}]}>

                      <Button 
                        title="Finalizar Rota"
                        onPress={ () => { 
                            this.setState({show_options: 'map', geophoning: false, loading_watch_position: false});
                            this._stop_watch_position();                  
                          } 
                        }
                        buttonStyle={[styles.button_style, {backgroundColor: '#d9534f'}]}
                        icon={ {name: "times-circle", type: "font-awesome"} }
                      />

                    </View>
                  </View>

                  <View style={{marginTop: 20, justifyContent: 'center'}}>

                    <Button 
                      title="Adicionar ponto"
                      onPress={ () => this.setState({show_options: "addMarker", show_marker_form: true, photos: [], markerTitle: '', markerDescription: ''}) }
                      buttonStyle={[styles.button_style, {backgroundColor: '#599014'}]}
                      icon={ {name: "add-location", type: "MaterialIcons"} }
                    />

                  </View>

              </View>

            </View>
          );
        
        }
    
        else {
          return (
            <Button 
              title="Iniciar Rota"
              onPress={this._watch_position}  
              loading={this.state.loading_watch_position}
              buttonStyle={[styles.button_style, {backgroundColor: '#599014'}]}
              icon={ {name: "location-arrow", type: "font-awesome"} }
            />  
          );
        }
    
    };

    _render = () => {

        if ((this.state.loading_watch_position && this.state.geophoning == false) || !this.state.mapLoaded) {
          return (
            <View style={[{justifyContent: 'center'}, styles.options]}>
              <View style={{flex: 1, justifyContent: 'center'}}>
                <ActivityIndicator size="large" color="#00558A" />
                <Text style={{textAlign: 'center', color: '#00558A'}}>{this.state.loadingMessage || "Carregando..."}</Text>
              </View>  
              <View style={styles.footer}>
                <Icon name='copyright' />
                <Text> 2018 - Nascentes do Xingu</Text>
              </View>
            </View>
          );
        }

        if (this.state.show_options === 'map') {
          return this._render_map();
        }

        else if (this.state.show_options === 'options') {
          return this._render_options();
        }

        else if (this.state.show_options === "button") {
          return this._render_route_button();
        } 
    
        else if (this.state.show_options === "addMarker") {
          return this._render_add_marker_options();
        }
    
        else if (this.state.show_options === "markerOptions") {
          return this._render_marker_options();
        }   

        else if (this.state.show_options === "editMarker") {
          return this._render_marker_edit_form();
        }

        else if (this.state.show_options === "deleteMarker") {
          return this._render_delete_marker_options();
        }

        else if (this.state.show_options === "photosMarker") {
          return this._render_photos_marker_options();
        }

        else if (this.state.show_options === "camera") {
          return this._render_camera();
        } 

    };

    render() {
        return (
          <View style={styles.container}>

            <StatusBar
              barStyle="light-content"
              backgroundColor="#00558A"
            />
             
            <Header
               leftComponent={
               <Icon
                 name='arrow-left'
                 type='font-awesome'
                 color='#fff'
                 containerStyle={{backgroundColor: '#00558A', elevation: 0}}  
                 underlayColor='#00558A'
                 reversed
                 raised
                 onPress={ () => {
                   if (this.state.show_options === 'map' && this.state.geophoning == false) {
                      this.props.navigation.goBack(); 
                   }

                   else if (this.state.show_options === 'map' && this.state.geophoning == true) {
                    Alert.alert("Rota não finalizada!", "Para voltar clique nas opções a direita e depois em 'Finalizar Rota'.");
                   } 

                   else if (this.state.show_options != 'map') {
                     this.setState({show_options: 'map'});
                   }
                    
                  }
                } 
               />
               }
               centerComponent={{ text: 'GEOFONAMENTO', style: { color: '#fff', fontSize: 20 } }}
               rightComponent={
                 <Icon
                 name='bars'
                 type='font-awesome'
                 color='#fff'
                 containerStyle={{backgroundColor: '#00558A', elevation: 0}}                 
                 underlayColor='#00558A'
                 reversed
                 raised

                 onPress={ () => this.setState({show_options: 'options'}) } 
               />
               }
               outerContainerStyles={{ backgroundColor: '#00558A' }}
               innerContainerStyles={{ justifyContent: 'space-around', alignItems: 'center', alignContent: 'center' }}
            />

             {this._render()}

          </View>   
          
        );
    };
};
