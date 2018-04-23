import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button, Icon } from "react-native-elements";


export default class Home extends Component {
    render() {
        return (
            <Card 
            title="NASCENTES DO XINGU" 
            containerStyle={{flex: 1, marginBottom: 15}}
            >
              <View style={{marginTop: 150}}>
                <Button 
                  title="Iniciar"
                  onPress={() => this.props.navigation.navigate('Map')}
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