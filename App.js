import React, { Component } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { Icon, Dimensions } from "react-native-elements";
import { Asset, AppLoading } from 'expo';

import { DrawerNavigator } from 'react-navigation';

import styles from './src/static/styles';

// Menu Component
import Menu from './src/components/menu';

// SCREENS
import Home from './src/screens/home';
import Map from './src/screens/map';
import NewMarker from './src/screens/newMarker';
import EditMarker from './src/screens/editMarker';
import DeleteMarker from './src/screens/deleteMarker';

const RootStack = DrawerNavigator({

    Home: {
      screen: Home,
      navigationOptions: {
        drawerIcon: () => (
          <Icon name='home' />
        )
      }
    },

    Map: {
      screen: Map,
      navigationOptions: {
        drawerIcon: () => (
          <Icon name='map' type="foundation" />
        )
      }
    },

    NewMarker: {
      screen: NewMarker,
      navigationOptions: {
        drawerIcon: () => (
          <Icon name="add-location" type="material-community," />
        )
      }
    },

    EditMarker: {
      screen: EditMarker,
      navigationOptions: {
        drawerIcon: () => (
          <Icon name="edit-location" type="material-community," />
        )
      }
    },

    DeleteMarker: {
      screen: DeleteMarker,
      navigationOptions: {
        drawerIcon: () => (
          <Icon name='delete-forever' type="material-community," />
        )
      }
    },

   },
  {
    initialRouteName: 'Home',
    contentComponent: Menu,
    navigationOptions: {
      headerStyle: {
        paddingTop: StatusBar.currentHeight
      },
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



