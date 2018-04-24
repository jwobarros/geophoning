import React, { Component } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, StatusBar } from 'react-native';
import { Location, MapView } from 'expo';
import { Header, Button, Icon, FormLabel, FormInput, FormValidationMessage, Badge } from "react-native-elements";
import MapViewDirections from 'react-native-maps-directions';
import axios from 'axios';

const GOOGLE_MAPS_APIKEY = 'AIzaSyCyH3WXs70xDF5DrJ72ih-7tTQn1D8CnBw';
const LATITUDE_DELTA = 0.001;
const LONGITUDE_DELTA = 0.001;

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
        show_route_points: false,
    
        markers: [],
        markerTitle: "",
        markerDescription: "",
        markerTitleError: "",
        markerDescriptionError: "",
        markerEditingKey: null
    };
      
    watchId = null
    markerCounter = 0

    componentDidMount() {
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
              }
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
        }, console.log(this.MapDirections.state.coordinates));
    
    };
    
    _watch_position = async () => {
        this.setState({
            loading_watch_position: true,
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
                                   show_options: 'editMarker', 
                                   markerEditingKey: marker.key,
                                   markerTitle: marker.title, 
                                   markerDescription: marker.description, 
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

                   {this._render_start_marker()}
                   {this._render_end_marker()}

                   <MapViewDirections
                   ref={(MapDirections) => {this.MapDirections = MapDirections;}}
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
                   />


               </ MapView>
                <View style={{
                  flexDirection: 'row', 
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  backgroundColor: '#3D6DCC',
                  padding: 3
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
        <View style={{flex: 1}}>

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

    _render_marker_option = () => {
        return (
          <View style={{flex: 1, justifyContent: 'center'}}>

            <View style={{flex: 1, justifyContent: 'center'}}>
              <View style={{flex: 1, justifyContent: 'center'}}>

                <Text style={styles.title}>Inserir Ponto</Text>

                <FormLabel>Título do Ponto</FormLabel>
                <FormInput onChangeText={ text => this.setState({markerTitle: text}) }/>
                <FormValidationMessage>{this.state.markerTitleError}</FormValidationMessage>
        
                <FormLabel>Descrição</FormLabel>
                <FormInput onChangeText={ text => this.setState({markerDescription: text}) }/>
                <FormValidationMessage>{this.state.markerDescriptionError}</FormValidationMessage>
              </View> 

              <View style={styles.button_container}>
                <Button 
                  title="Cancelar"
                  onPress={ () => this.setState({show_options: "map"}) }
                  buttonStyle={styles.button_style}
                />
                <Button 
                  title="Inserir"
                  onPress={ () => {
                      if (this.state.markerDescription != "" && this.state.markerTitle != "") {
                        this.markerCounter += 1; 
                        this.setState(
                          {
                          show_options: "map",
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
                              repositioned: false
                            }
                          ]},

                          this._reposition_markers,
                          this.props.navigation.navigate('PhotoTaker')

                        );
                        
                      }
      
                      if ( this.state.markerDescription == "" ) {
                        this.setState({markerDescriptionError: "Este campo é obrigatório."})
                      }
      
                      if ( this.state.markerTitle == "" ) {
                        this.setState({markerTitleError: "Este campo é obrigatório."})
                      }
      
                    }
                  }
                  buttonStyle={styles.button_style}
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

    _render_marker_edit_option = () => {
        return (
          <View style={{flex: 1, justifyContent: 'center'}}>
    
            <Text style={styles.title}>Editar Ponto</Text>
    
            <Button 
              title="Deletar"
              buttonStyle={styles.button_style}
              onPress={ () => {
                  this.setState({show_options: "map"});
                  var markerEditingKey = this.state.markerEditingKey;
                  var markers = this.state.markers;
    
                  this.state.markers.forEach(function(value, i) {
                    if (value.key === markerEditingKey) {
                      markers.splice(i, 1);
                   }
    
                 });
    
                 this.setState({markers: markers});
    
                }            
              }          
            />
    
            <FormLabel>Título do Ponto</FormLabel>
            <FormInput value={this.state.markerTitle} onChangeText={ text => this.setState({markerTitle: text}) }/>
            <FormValidationMessage>{this.state.markerTitleError}</FormValidationMessage>
    
            <FormLabel>Descrição</FormLabel>
            <FormInput value={this.state.markerDescription} onChangeText={ text => this.setState({markerDescription: text}) }/>
            <FormValidationMessage>{this.state.markerDescriptionError}</FormValidationMessage>
    
            <View style={styles.button_container}>
              <Button 
                title="Cancelar"
                onPress={ () => this.setState({show_options: "map"}) }
                buttonStyle={styles.button_style}
              />
              <Button 
                title="Inserir"            
                buttonStyle={styles.button_style}
                onPress={ () => 
                  {
                    var markerEditingKey = this.state.markerEditingKey;
                    var markers = this.state.markers;
                    var markerTitle = this.state.markerTitle;
                    var markerDescription = this.state.markerDescription;
    
                    if (this.state.markerTitle != "" && this.state.markerDescription != "") {
                      this.setState({show_options: "map", markerTitleError: "", markerDescriptionError: ""});
    
    
                      this.state.markers.forEach(function(value, i) {
                         if (value.key === markerEditingKey) {
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
    
                  }
                  
                }
              />
            </View>  
    
          </View>
        );
    };

    _render_buttons = () => {
        if ( this.state.geophoning ) {
          return (
            <View>

              <Button 
                title="Adicionar ponto"
                onPress={ () => this.setState({show_options: "addMarker"}) }
                buttonStyle={styles.button_style}
                icon={ {name: "add-location", type: "MaterialIcons"} }
              />

              <Button 
                title="Finalizar Rota"
                onPress={ () => { 
                    this.setState({show_options: 'map', geophoning: false, loading_watch_position: false});
                    this._stop_watch_position();                  
                  } 
                }
                buttonStyle={styles.button_style}
                icon={ {name: "times-circle", type: "font-awesome"} }
              />

            </View>
          );
        
        }
    
        else {
          return (
            <Button 
              title="Iniciar Rota"
              onPress={this._watch_position}  
              loading={this.state.loading_watch_position}
              buttonStyle={styles.button_style}
              icon={ {name: "location-arrow", type: "font-awesome"} }
            />  
          );
        }
    
    };

    _render = () => {

        if ((this.state.loading_watch_position && this.state.geophoning == false) /*|| !this.state.mapLoaded */ ) {
          return (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={{textAlign: 'center', color: '#0000ff'}}>{this.state.loadingMessage || "Carregando..."}</Text>
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
          return this._render_marker_option();
        }
    
        else if (this.state.show_options === "editMarker") {
          return this._render_marker_edit_option();
        }   

    };

    render() {
        return (
          <View style={styles.container}>
             
            <Header
               leftComponent={
               <Icon
                 name='arrow-left'
                 type='font-awesome'
                 color='#fff'
                 reversed
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
                 reversed
                 onPress={ () => this.setState({show_options: 'options'}) } 
               />
               }
               outerContainerStyles={{ backgroundColor: '#3D6DCC' }}
               innerContainerStyles={{ justifyContent: 'space-around', alignItems: 'center', alignContent: 'center' }}
            />

             {this._render()}

          </View>   
          
        );
    }
};

// STYLE
const styles = StyleSheet.create({

    container: {
      flex: 1,
      justifyContent: "space-between", 
      backgroundColor: "rgba(255, 255, 255, 0.6)", 
      marginTop: StatusBar.currentHeight
    },

    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
  
    map: {
      flex: 1
    },
  
    footer: {
      flexDirection: 'row', 
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 2
    },

    input_style: {
      height: 44,
      margin: 3
    },
  
    title: {
      textAlign: 'center',
      fontSize: 30,
      marginRight: 15
    },
  
 
    button_container: {
      flexDirection: "row",
      justifyContent: "space-around"
    },
  
    button_style: {
      backgroundColor: "rgba(92, 99,216, 1)",
      borderColor: "transparent",
      borderWidth: 0,
      borderRadius: 5,
      margin: 3
    },
  
  });


