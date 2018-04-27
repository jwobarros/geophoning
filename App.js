import React, { Component } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { Card, Button, Icon, FormLabel, FormInput, FormValidationMessage, Dimensions } from "react-native-elements";
import { Asset, AppLoading } from 'expo';

import { DrawerNavigator } from 'react-navigation';

import styles from './src/static/styles';

// SCREENS
import Home from './src/components/home';
import Map from './src/components/map';

const RootStack = DrawerNavigator({

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

  state = {
    isReady: false,
  };

  async _cacheResourcesAsync() {
    const images = [
      require('./assets/logo_nx.png'),
    ];

    const cacheImages = images.map((image) => {
      return Asset.fromModule(image).downloadAsync();
    });
    return Promise.all(cacheImages)

  }

  render() {   

    if (!this.state.isReady) {
      return (
        <View style={styles.container}>
          <Image style={{ margin: 5, aspectRatio: 0.8, resizeMode: 'contain', alignSelf: 'center'}} source={require('./assets/logo_nx.png')} />        
          <AppLoading
            startAsync={this._cacheResourcesAsync}
            onFinish={() => this.setState({ isReady: true })}
          />
        </View>
      );
    }
    
    return (
      <RootStack />
    );

  }

}



