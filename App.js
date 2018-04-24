import React, { Component } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, StatusBar } from 'react-native';
import { Card, Button, Icon, FormLabel, FormInput, FormValidationMessage } from "react-native-elements";

import { DrawerNavigator } from 'react-navigation';

// SCREENS
import Home from './src/components/home';
import Map from './src/components/map';
import PhotoTaker from './src/components/camera';

const RootStack = DrawerNavigator({

    Home: {
      screen: Home,
    },

    Map: {
      screen: Map,
    },

    PhotoTaker: {
      screen: PhotoTaker,
    },

  },
  {
    initialRouteName: 'Home',
    navigationOptions: {
      headerStyle: {
        paddingTop: StatusBar.currentHeight
      }
    }
  }
);


export default class App extends Component {

  render() {   
    
    return (
      <RootStack />
    );

  }

}



