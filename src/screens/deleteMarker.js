import React, { Component } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { Header, Icon, Button } from "react-native-elements";

import styles from '../static/styles';
import MarkerForm from '../components/markerForm';

export default class DeleteMarker extends Component {

    state = {
        markerTitle: "",
        markerDescription: "",
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="#00558A"
                />

                <Header
                    centerComponent={{ text: 'Deletar ponto', style: { color: '#fff', fontSize: 20 } }}
                    outerContainerStyles={{ backgroundColor: '#00558A' }}
                    innerContainerStyles={{ justifyContent: 'space-around', alignItems: 'center', alignContent: 'center' }}
                />

                <View style={{ flex: 1, justifyContent: 'center' }}>

                    <View style={[styles.dangerZone, {flex: 0.7}]}> 

                        <Text h2 style={{fontSize: 20, color: '#d9534f', fontWeight: 'bold', textAlign: 'center'}}>Cuidado</Text>

                        <Text h2 style={{fontSize: 15, color: '#d9534f', fontWeight: 'bold', textAlign: 'center', justifyContent: 'center'}}>Este ponto não poderá ser recuperado.</Text>

                        <View style={styles.button_container}>
                            
                            <Button 
                                title="Não"
                                onPress={ () => this.props.navigation.navigate('Mapa') }
                                buttonStyle={[styles.button_style, {backgroundColor: '#00558A'}, {paddingLeft: 50, paddingRight: 50}]}
                            />             
                            <Button 
                                title="Sim"
                                buttonStyle={[styles.button_style, {backgroundColor: '#d9534f'}, {paddingLeft: 50, paddingRight: 50}]}
                                onPress={ () => console.log("delete") }          
                            />
                        </View>
                    </View> 

                </View>

                <View style={styles.footer}>
                    <Icon name='copyright' />
                    <Text> 2018 - Nascentes do Xingu</Text>
                </View>
            </View>
        );
    }
}