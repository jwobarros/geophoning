import React, {Component} from 'react';
import {ScrollView, Text, View, Image, TouchableOpacity} from 'react-native';
import { Icon, Divider } from "react-native-elements";
import {NavigationActions} from 'react-navigation';

import styles from '../static/styles';

export default class Menu extends Component {
  navigateToScreen = (route) => () => {
    const navigateAction = NavigationActions.navigate({
      routeName: route
    });
    this.props.navigation.dispatch(navigateAction);
  }

  addActiveStyle = screen => {
      if (screen == this.props.navigation.state.routes[this.props.navigation.state.index].key) {
          return styles.menuItemActive
      } 
      return {paddingLeft: 8}
  }

  render () {
    return (
      <View style={styles.container}>
        <Image style={{ flex: 0.5, marginRight: 20, marginLeft: 20, aspectRatio: 2, resizeMode: 'contain', alignSelf: 'center'}} source={require('../../assets/logo_nx.png')} />
        
        <Divider style={{ backgroundColor: '#00558A', marginHorizontal: 10, height: 2 }} />
        
        <ScrollView style={{flex: 1, marginTop: 10}}>

            <View style={[{marginTop: 2, marginBottom: 2}, this.addActiveStyle('Home')]}>
                <TouchableOpacity style={styles.menuItem} onPress={this.navigateToScreen('Home')}> 
                    <Icon name='home' />
                    <Text style={styles.menuText}>Inicio</Text>
                </TouchableOpacity>
            </View>

            <View style={[{marginTop: 2, marginBottom: 2}, this.addActiveStyle('Map')]}>
                <TouchableOpacity style={styles.menuItem} onPress={this.navigateToScreen('Map')}> 
                    <Icon name='map' type="foundation" />
                    <Text style={styles.menuText}>Mapa</Text>
                </TouchableOpacity>
            </View>

            <View style={[{marginTop: 2, marginBottom: 2}, this.addActiveStyle('NewMarker')]}>
                <TouchableOpacity style={styles.menuItem} onPress={this.navigateToScreen('NewMarker')}> 
                    <Icon name="add-location" type="material-community," />
                    <Text style={styles.menuText}>Adicionar marcador</Text>
                </TouchableOpacity>
            </View>

            <View style={[{marginTop: 2, marginBottom: 2}, this.addActiveStyle('EditMarker')]}>
                <TouchableOpacity style={styles.menuItem} onPress={this.navigateToScreen('EditMarker')}> 
                    <Icon name="edit-location" type="material-community," />    
                    <Text style={styles.menuText}>Editar marcador</Text>
                </TouchableOpacity>
            </View>

            <View style={[{marginTop: 2, marginBottom: 2}, this.addActiveStyle('DeleteMarker')]}>
                <TouchableOpacity style={styles.menuItem} onPress={this.navigateToScreen('DeleteMarker')}> 
                    <Icon name='delete-forever' type="material-community," />
                    <Text style={styles.menuText}>Deletar marcador</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
      </View>
    );
  }
}
