import React, { Component } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, StatusBar } from 'react-native';
import { Card, Button, Icon, FormLabel, FormInput, FormValidationMessage } from "react-native-elements";

import { TabNavigator } from 'react-navigation';

// SCREENS
import Home from './src/components/home';
import Map from './src/components/map';

const RootStack = TabNavigator({
    Home: {
      screen: Home,
    },
    Map: {
      screen: Map,
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



