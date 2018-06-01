import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import { Button, Icon } from "react-native-elements";

import styles from '../static/styles';

export default class Home extends Component {
    
    componentDidMount() {
        StatusBar.setBackgroundColor('#599014');
    };

    render() {
        return (
            <View style={[styles.container, {alignItems: 'center', marginTop: StatusBar.currentHeight}]}>

                <StatusBar
                barStyle="light-content"
                backgroundColor="#599014"
                />

                <Image style={{ flex: 1, aspectRatio: 1.5, resizeMode: 'contain', margin: 12}} source={require('../../assets/logo_nx.png')} />

                <View style={{ flex: 1 }}>
                    <Button 
                    title="Iniciar"
                    onPress={() => this.props.navigation.navigate('Map')}
                    buttonStyle={[styles.button_style, {backgroundColor: '#00558A'}]}
                    />
                    <Button 
                    title="Minhas Rotas"
                    onPress={() => console.log('Minhas Rotas')}
                    buttonStyle={[styles.button_style, {backgroundColor: '#00558A'}]}
                    />
                </View>
                <View style={styles.footer}>
                    <Icon name='copyright' />
                    <Text> 2018 - Nascentes do Xingu</Text>
                </View>
            </View>
        );
    }
};

