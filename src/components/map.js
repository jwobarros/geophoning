import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Location, MapView } from 'expo';
import { Button, Icon, FormLabel, FormInput, FormValidationMessage } from "react-native-elements";
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
        origin: null,
        destination: null,
        route: [],
        waypoints: [],
        geophoning: false,
        loading_watch_position: false,

        show_bottom_options: "button",
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

    static navigationOptions = {
      headerTitle: "Teste",
      headerRight: (
        <Button
          onPress={() => alert('This is a button!')}
          title="Info"
          color="#fff"
        />
      ),
    };

    componentDidMount() {
        this._get_current_position();    
    };  

    componentWillUnmount() {
      if (this.watchId != null) {
        this._stop_watch_position();
      }
    }


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
        });
    
    };
    
    _watch_position = async () => {
        this.setState({
            loading_watch_position: true
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
        this.setState({
            geophoning: false,
            loading_watch_position: false
        });
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

    _render_marker_option = () => {
        return (
          <View>

            <Text style={styles.title}>Inserir Ponto</Text>

            <FormLabel>Título do Ponto</FormLabel>
            <FormInput onChangeText={ text => this.setState({markerTitle: text}) }/>
            <FormValidationMessage>{this.state.markerTitleError}</FormValidationMessage>
    
            <FormLabel>Descrição</FormLabel>
            <FormInput onChangeText={ text => this.setState({markerDescription: text}) }/>
            <FormValidationMessage>{this.state.markerDescriptionError}</FormValidationMessage>
    
            <View style={styles.button_container}>
              <Button 
                title="Cancelar"
                onPress={ () => this.setState({show_bottom_options: "button"}) }
                buttonStyle={styles.button_style}
              />
              <Button 
                title="Inserir"
                onPress={ () => {
                    if (this.state.markerDescription != "" && this.state.markerTitle != "") {
                      this.markerCounter += 1; 
                      this.setState(
                        {
                        show_bottom_options: "button",
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

                        this._reposition_markers

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
        );
    };

    _render_marker_edit_option = () => {
        return (
          <View>
    
            <Text style={styles.title}>Editar Ponto</Text>
    
            <Button 
              title="Deletar"
              buttonStyle={styles.button_style}
              onPress={ () => {
                  this.setState({show_bottom_options: "button"});
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
                onPress={ () => this.setState({show_bottom_options: "button"}) }
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
                      this.setState({show_bottom_options: "button", markerTitleError: "", markerDescriptionError: ""});
    
    
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

    _render_route_button = () => {
        if ( this.state.geophoning ) {
          return (
            <View style={styles.button_container}>
              <Button 
                title="Finalizar Rota"
                onPress={this._stop_watch_position}
                buttonStyle={styles.button_style}
                icon={ {name: "times-circle", type: "font-awesome"} }
              />
              <Button 
                title="Adicionar ponto"
                onPress={ () => this.setState({show_bottom_options: "marker"}) }
                buttonStyle={styles.button_style}
                icon={ {name: "add-location", type: "MaterialIcons"} }
              />
            </View>
          );
        
        }
    
        else {
          return (
            <View style={styles.button_container}>
              <Button 
                title="Voltar"
                onPress={ () => this.props.navigation.goBack() }
                buttonStyle={styles.button_style}
                icon={ {name: "times", type: "font-awesome"} }
              />
              <Button 
                title="Iniciar Rota"
                onPress={this._watch_position}  
                loading={this.state.loading_watch_position}
                buttonStyle={styles.button_style}
                icon={ {name: "location-arrow", type: "font-awesome"} }
              />  
            </View>
          );
        }
    
    };

    _render_bottom_options = () => {

        if (this.state.show_bottom_options === "button") {
          return this._render_route_button();
        } 
    
        else if (this.state.show_bottom_options === "marker") {
          return this._render_marker_option();
        }
    
        else if (this.state.show_bottom_options === "editMarker") {
          return this._render_marker_edit_option();
        }
    
        else {
          return null;
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <MapView
                style={styles.map}
                region={this.state.mapRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                >
        
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
                                    show_bottom_options: 'editMarker', 
                                    markerEditingKey: marker.key,
                                    markerTitle: marker.title, 
                                    markerDescription: marker.description, 
                                    markerTitleError: "",
                                    markerDescriptionError: ""                    
                                });
                            }
                        }
                        draggable
                        onDragEnd={(coordinate) => console.log(coordinate) }
                        />
                    </MapView.Callout>
                    ))}

                    {this._render_start_marker()}
                    {this._render_end_marker()}

                    <MapViewDirections
                    origin={this.state.route[0]}
                    destination={this.state.route.slice(-1)[0]}
                    apikey={GOOGLE_MAPS_APIKEY}
                    waypoints={this.state.waypoints}
                    language="pt-BR"
                    mode="walking"
                    strokeWidth={10}
                    strokeColor="blue"
                    onReady={(params) => {
                        console.log(params.coordinates[0], params.coordinates[1]);
                        this.setState({show_route_points: true, origin: params.coordinates[0], destination: params.coordinates[1]});
                      }}
                    />


                </ MapView>

                {this._render_bottom_options()}

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
    },
  
    map: {
      flex: 1
    },
  
    input_style: {
      height: 44,
      margin: 3
    },
  
    title: {
      textAlign: 'center',
      fontSize: 30,
      marginBottom: 10
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


