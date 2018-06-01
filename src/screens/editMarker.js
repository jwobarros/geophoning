import React, { Component } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { Header, Icon } from "react-native-elements";

import styles from '../static/styles';
import MarkerForm from '../components/markerForm';

export default class EditMarker extends Component {

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
                    centerComponent={{ text: 'Editar ponto', style: { color: '#fff', fontSize: 20 } }}
                    outerContainerStyles={{ backgroundColor: '#00558A' }}
                    innerContainerStyles={{ justifyContent: 'space-around', alignItems: 'center', alignContent: 'center' }}
                />

                <MarkerForm back={() => this.props.navigation.navigate('Mapa')} />

                <View style={styles.footer}>
                    <Icon name='copyright' />
                    <Text> 2018 - Nascentes do Xingu</Text>
                </View>
            </View>
        );
    }
}