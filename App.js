import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, StatusBar } from 'react-native';
import { Location, Permissions, MapView } from 'expo';
import MapViewDirections from 'react-native-maps-directions';
import { Card, Button, Icon, FormLabel, FormInput, FormValidationMessage } from "react-native-elements";

const GOOGLE_MAPS_APIKEY = 'AIzaSyCyH3WXs70xDF5DrJ72ih-7tTQn1D8CnBw';
const LATITUDE_DELTA = 0.001;
const LONGITUDE_DELTA = 0.001;

export default class App extends Component {
  state = {
    page: "frontPage",
    error: null,
    mapRegion: { 
      latitude: -15.587265,
      longitude: -56.08016, 
      latitudeDelta: LATITUDE_DELTA, 
      longitudeDelta: LONGITUDE_DELTA 
    },
    markers: [],
    route: [],
    geophoning: false,
    loading_watch_position: false,
    show_bottom_options: "",

    markerCounter: 0,
    markerTitle: "",
    markerDescription: "",
    markerTitleError: "",
    markerDescriptionError: ""
  };
  
  watchId = null
  
  componentDidMount() {
    this._get_current_position();    
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
      { enableHighAccuracy: true, timeout: 30000},
    );
  };


  _updateLocation = async (location) => {

    var route = this.state.route
    
    if ( route.length > 23  ) {
            
      for ( var index in route) {
        if ( index % 2 === 1 ) {
          route.splice(index, 1)
        }
      }
    
      this.setState({route: route});

    }

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

  _stop_watch_position = async () => {
    this.setState({
      geophoning: false,
      loading_watch_position: false
    });
    this.watchId.remove();    
  };

  // CONDITIONAL RENDERS

  _render_marker_option = () => {
    return (
      <View>
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
                  this.setState({markerCounter: this.state.markerCounter+1});
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
                        key: this.state.markerCounter
                      }
                    ]}
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
            onPress={ () => this.setState({page: "frontPage", show_bottom_options: ""}) }
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

  _render_map = () => {
    return (
      <MapView
        style={styles.map}
        region={this.state.mapRegion}
        showsUserLocation={true}
        loadingEnabled={true}	
        cacheEnabled={true}
        toolbarEnabled={true}
        showsCompass={true}
        showsMyLocationButton={true}
      >
      
        {this.state.markers.map(marker => (
          <MapView.Callout>
            <MapView.Marker
              key={marker.key}
              coordinate={marker.coords}
              title={marker.title}
              description={marker.description}
              onPress={() => {
                  this.setState({
                    show_bottom_options: 'editMarker', 
                    markerTitle: marker.title, 
                    markerDescription: marker.description});
                }
              }
            />
          </MapView.Callout>
        ))}


        <MapViewDirections
          origin={this.state.route[0]}
          destination={this.state.route.slice(-1)[0]}
          apikey={GOOGLE_MAPS_APIKEY}
          waypoints={this.state.route.slice(1, -1)}
          language="pt-BR"
          mode="walking"
          strokeWidth={3}
          strokeColor="hotpink"
        />      
      </ MapView>
    );
  };

  _render_front_page = () => {
    return (
      <Card 
      title="NASCENTES DO XINGU" 
      containerStyle={{flex: 1, marginBottom: 15}}
      >
        <View style={{marginTop: 150}}>
          <Button 
            title="Iniciar"
            onPress={() => this.setState({page: "map", show_bottom_options: "button"})}
            buttonStyle={styles.button_style}
          />
          <Button 
            title="Minhas Rotas"
            onPress={() => none}
            buttonStyle={styles.button_style}
          />
        </View>
        <View style={styles.footer}>
          <Icon name='copyright' />
          <Text>2018 - Nascentes do Xingu</Text>
        </View>
      </Card>
      
    );
  };

  _render_page = () => {
    if (this.state.page === "frontPage") {
      return this._render_front_page();
    } 
    else if (this.state.page === "map") {
      return this._render_map();
    }
  }; 

  render() {
    return (
      <View style={styles.container}>

        {this._render_page()}
        {this._render_bottom_options()}

      </View>
    );
  }
}




// STYLE
const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "space-between", 
    marginTop: StatusBar.currentHeight,
    backgroundColor: "rgba(255, 255, 255, 0.6)", 
  },

  footer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 150
  },

  map: {
    flex: 1
  },

  input_style: {
    height: 44,
    margin: 3
  },

  error: {
    color: "red",
    textAlign: "center",
    margin: 5
  },

  button_container: {
    flexDirection: "row",
    justifyContent: 'space-around'
  },

  button_style: {
    backgroundColor: "rgba(92, 99,216, 1)",
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 5,
    margin: 3
  },

});
