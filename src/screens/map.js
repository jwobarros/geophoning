import React, { Component } from 'react';
import { View, Text, Image, ActivityIndicator, Alert, StyleSheet, StatusBar, TouchableOpacity, Vibration, ScrollView } from 'react-native';
import { Location, MapView, Camera, Permissions, FileSystem, SQLite } from 'expo';
import { Header, Button, Icon, FormLabel, FormInput, FormValidationMessage, Badge, Divider } from "react-native-elements";
import MapViewDirections from 'react-native-maps-directions';
import axios from 'axios';

import styles from '../static/styles';

const db = SQLite.openDatabase('db.db');
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
    markers: 0,
    geophoning: false,
    loading_watch_position: false,

  };

  watchId = null
  markerCounter = 0

  componentDidMount() {
    StatusBar.setBackgroundColor('#00558A');
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
      { enableHighAccuracy: true, timeout: 120000 },
    );
  };

  _updateLocation = async (location) => {

    var route = this.state.route;
    var waypoints = route.slice(1, -1);

    if (waypoints.length > 23) {
      while (waypoints.length > 23) {
        var temp = []
        waypoints.forEach(function (value, index) {
          if (index % 2 == 0) {
            temp.push(value);
          }
        })
        waypoints = temp
      }
    }

    this.setState({ waypoints: waypoints });

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
      options = { enableHighAccuracy: true, distanceInterval: 10 },
      callback = currentLocation => {
        this.setState({ geophoning: true });
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
    markers.map(marker => {

      if (!marker.repositioned) {
        let google_directions_api = "https://maps.googleapis.com/maps/api/directions/json"
        axios.get(google_directions_api, {
          params: {
            origin: marker.coords.latitude + "," + marker.coords.longitude,
            destination: marker.coords.latitude + "," + marker.coords.longitude,
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

    this.setState({ markers: temp_markers });

  };


  render() {
    return (
      <View style={styles.container}>

        <StatusBar
          barStyle="light-content"
          backgroundColor="#00558A"
        />

        <Header
          centerComponent={{ text: 'Mapa', style: { color: '#fff', fontSize: 20 } }}
          outerContainerStyles={{ backgroundColor: '#00558A' }}
          innerContainerStyles={{ justifyContent: 'space-around', alignItems: 'center', alignContent: 'center' }}
        />

        <View style={{ flex: 1 }}>
          <MapView
            style={styles.map}
            region={this.state.mapRegion}
            loadingEnabled
          >

            <MapView.Circle
              center={{ latitude: this.state.mapRegion.latitude, longitude: this.state.mapRegion.longitude }}
              radius={10}
              strokeWidth={2}
              strokeColor='rgba(77, 184, 254, 0.8)'
              fillColor='rgba(77, 184, 254, 0.5)'
            />

            <MapView.Circle
              center={{ latitude: this.state.mapRegion.latitude, longitude: this.state.mapRegion.longitude }}
              radius={1}
              strokeWidth={2}
              strokeColor='#FFFFFF'
              fillColor='rgba(77, 184, 254, 1)'
            />
           

            {/*}
            {this.state.markers.map(marker => (
              <MapView.Callout>
                <MapView.Marker
                  key={marker.key}
                  coordinate={marker.coords}
                  title={marker.title}
                  description={marker.description}
                  onCalloutPress={() => {
                    this.setState({
                      show_options: 'markerOptions',
                      markerKey: marker.key,
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

                    markers.map(point => {
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
                    });

                    this.setState({ markers: temp_merkers });

                  }}
                />
              </MapView.Callout>
            ))}

            {this.state.waypoints.map(point => (
              <MapView.Callout>
                <MapView.Marker
                  coordinate={point}
                  title={"waypoint"}
                  pinColor={'blue'}
                />
              </MapView.Callout>
            ))}

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
                this.setState({ show_route_points: true, origin: params.coordinates[0], destination: params.coordinates[1], distance: params.distance * 1000 });
              }}
              resetOnChange={true}
            />
            */}

          </ MapView>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            backgroundColor: '#005C8F',
            padding: 5
          }}>
            <Badge containerStyle={{ backgroundColor: '#fff' }}>
              <Text>Marcadores: {this.state.markers}</Text>
            </Badge>

            <Badge containerStyle={{ backgroundColor: '#fff' }}>
              <Text>Distância: {this.state.distance} Metros</Text>
            </Badge>
          </View>
        </View>

      </View>
    );
  };
};
