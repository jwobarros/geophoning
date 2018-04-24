import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Camera, Permissions } from 'expo';

export default class PhotoTaker extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>Sem acesso a Câmera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera style={{ flex: 1 }} type={this.state.type}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
                <View style={styles.button_container}>

                    <TouchableOpacity
                        onPress={() => this.props.navigation.navigate('Map') }
                    >
                        <Text
                        style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                        {' '}Cancelar{' '}
                        </Text>

                    </TouchableOpacity>


                    <TouchableOpacity
                        onPress={() => {
                        this.setState({
                            type: this.state.type === Camera.Constants.Type.back
                            ? Camera.Constants.Type.front
                            : Camera.Constants.Type.back,
                        });
                        }}
                    >
                        <Text
                        style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                        {' '}Girar{' '}
                        </Text>

                    </TouchableOpacity>

                </View>               
               

            </View>

            <View style={{ bottom: 10 }}>
                <TouchableOpacity
                    style={[styles.picButton, {flex: 0.3, alignSelf: 'center'}]}
                    onPress={()=> console.log('picture taked')}>                    
                </TouchableOpacity>
            </View>

          </Camera>
        </View>
      );
    }
  }
}

// STYLE
const styles = StyleSheet.create({

    button_container: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: (StatusBar.currentHeight * 2),
      marginLeft: 10,
      marginRight: 10,
    },

    picButton: {
        backgroundColor: 'darkseagreen',
        width: 50,
        height: 50,
    },

 
  
});