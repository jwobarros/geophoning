import React, { Component } from 'react';
import { View, Button, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Location, Permissions, MapView} from 'expo';

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
    geophoning: false
  };
  
  watchId = null
  
  componentDidMount() {
    this._get_current_position();
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
      { enableHighAccuracy: true, timeout: 30000},
    );
  }

  _add_marker = async () => {
    this.setState({
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
      ]
    });
  }

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
  }

  _watch_position = async () => {
    this.watchId =  await Location.watchPositionAsync(
      options = {enableHighAccuracy: true, distanceInterval: 2},
      callback = currentLocation => {
        this.setState({geophoning: true})
        this._updateLocation(currentLocation);
      }
    );
  };

  _stop_watch_position = async () => {
    this.watchId.remove();
    this.setState({
      geophoning: false
    });
  }

  _render_route_button = () => {
    if ( this.state.geophoning ) {
      return (
        <Button 
          title="Finalizar Rota"
          onPress={this._stop_watch_position}
        />
      );
    
    }

    else {
      return (
        <Button 
          title="Iniciar Rota"
          onPress={this._watch_position}  
        />  
      );
    }

  }


  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={this.state.mapRegion}
        >

          {this.state.markers.map(marker => (
            <MapView.Marker
              coordinate={marker.coords}
              title={marker.title}
            />
          ))}

          <MapView.Polyline 
            coordinates={this.state.route}
            strokeWidth={6}
          />
          
        </ MapView>
        
        <View style={styles.button_container}>
          
          {this._render_route_button()}

          <Button 
            title="Adicionar ponto"
            onPress={this._add_marker}
          />

        </View>
      </View>  
    );
  }
}

const styles = StyleSheet.create({

  container: {
    flex: 1
  },

  map: {
    flex: 1,
  },

  button_container: {
    flexDirection: "row",
    justifyContent: 'space-around'
  }

});
