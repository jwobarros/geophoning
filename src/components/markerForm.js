import React, { Component } from 'react';
import { View } from 'react-native';
import { Button, Icon, FormLabel, FormInput, FormValidationMessage } from "react-native-elements";

import styles from '../static/styles';

export default class MarkerForm extends Component {

    state = {
        markerTitle: "",
        markerDescription: "",

        markerTitleError: "",
        markerDescriptionError: ""

    }


    validation = () => {
        if (this.state.markerTitle == '') {
            this.setState({ markerTitleError: 'Preencha o título do novo marcador!' })
            this.markerTitle.shake()
        } else {
            this.setState({ markerTitleError: '' })
        }

        if (this.state.markerDescription == '') {
            this.setState({ markerDescriptionError: 'Preencha a descrição do novo marcador!' })
            this.markerDescription.shake()
        } else {
            this.setState({ markerDescriptionError: '' })
        }
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>

                <View style={{ flex: 1, justifyContent: 'space-around' }}>

                    <FormLabel>Título do Ponto</FormLabel>
                    <FormInput ref={markerTitle => this.markerTitle = markerTitle} value={this.state.markerTitle} onChangeText={text => this.setState({ markerTitle: text })} />
                    <FormValidationMessage>{this.state.markerTitleError}</FormValidationMessage>

                    <FormLabel>Descrição</FormLabel>
                    <FormInput ref={markerDescription => this.markerDescription = markerDescription} value={this.state.markerDescription} onChangeText={text => this.setState({ markerDescription: text })} />
                    <FormValidationMessage>{this.state.markerDescriptionError}</FormValidationMessage>

                    <View style={[styles.button_container, { marginBottom: 30 }]}>
                        <Button
                            title="Voltar"
                            onPress={() => this.props.back()}
                            buttonStyle={[styles.button_style, { backgroundColor: '#00558A' }]}
                        />
                        <Button
                            title="Salvar"
                            buttonStyle={[styles.button_style, { backgroundColor: '#00558A' }]}
                            onPress={() => this.validation()}
                        />
                    </View>

                </View>

            </View>
        )
    }


}
