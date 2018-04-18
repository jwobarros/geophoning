import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { Location, Permissions, MapView } from 'expo';
import MapViewDirections from 'react-native-maps-directions';
import { Button } from "react-native-elements";

const GOOGLE_MAPS_APIKEY = 'AIzaSyCyH3WXs70xDF5DrJ72ih-7tTQn1D8CnBw';
const LATITUDE_DELTA = 0.001;
const LONGITUDE_DELTA = 0.001;

export default class App extends Component {
  state = {
    error: null,
    mapRegion: { 
      latitude: 37.78825, 
      longitude: -122.4324, 
      latitudeDelta: LATITUDE_DELTA, 
      longitudeDelta: LONGITUDE_DELTA 
    },
    markers: [],
    route: [],
    geophoning: false,
    loading_watch_position: false,
    show_bottom_options: "button",

    markerTitle: "",
    markerDescription: "",
    markerError: ""
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
      options = {enableHighAccuracy: true, distanceInterval: 2},
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
        <TextInput
          placeholder='Título'
          value={this.state.markerTitle}
          onChangeText={ text => this.setState({markerTitle: text}) }
          style={styles.input_style}
        />
        <TextInput
          placeholder='Descrição'
          value={this.state.markerDescription}
          onChangeText={ text => this.setState({markerDescription: text}) }
          style={styles.input_style}          
        />

        <Text style={styles.error}>{this.state.markerError}</Text>

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
                this.setState({
                  show_bottom_options: "button",
                  markerError: "",
                  markers: [
                    ...this.state.markers, 
                    {
                      coords: {
                        latitude: this.state.mapRegion.latitude,
                        longitude: this.state.mapRegion.longitude
                      },
                      title: "Teste markers",
                      description: 'Marker description'
                    }
                  ]})
              }
              else {
                this.setState({markerError: "Preencha todos os campos."})
              }
                 
              
              }
            }
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
          />
          <Button 
            title="Adicionar ponto"
            onPress={ () => this.setState({show_bottom_options: "marker"}) }
            buttonStyle={styles.button_style}
          />
        </View>
      );
    
    }

    else {
      return (
        <View style={styles.button_container}>
          <Button 
            title="Iniciar Rota"
            onPress={this._watch_position}  
            loading={this.state.loading_watch_position}
            buttonStyle={styles.button_style}
          />  
          <Button 
            title="Adicionar ponto"
            onPress={ () => this.setState({show_bottom_options: "marker"}) }
            buttonStyle={styles.button_style}
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
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={this.state.mapRegion}
        >
         
          {this.state.markers.map(marker => (
            <MapView.Callout>
              <MapView.Marker
                coordinate={marker.coords}
                title={marker.title}
                description={marker.description}
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
        
        <View>
          
          {this._render_bottom_options()}

        </View>

      </View>  
    );
  }
}




// STYLE
const styles = StyleSheet.create({

  container: {
    flex: 1
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
