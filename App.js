import React, { Component } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, StatusBar } from 'react-native';
import { Card, Button, Icon, FormLabel, FormInput, FormValidationMessage } from "react-native-elements";

import Map from './src/components/map';

export default class App extends Component {

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
    if ( this.state.error != null ) {
      return(<FormValidationMessage>{this.state.error}</FormValidationMessage>);
    }

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
        <Map />
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

  title: {
    textAlign: 'center',
    fontSize: 40,
    marginBottom: 10
  },

  error: {
    color: "red",
    textAlign: "center",
    margin: 5
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
