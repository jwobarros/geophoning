import { StyleSheet, StatusBar } from 'react-native';

// Colors NX #599014 green, #00558A blue, #d9534f red, #f0ad4e yellow

export default styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "space-between", 
    backgroundColor: "rgba(255, 255, 255, 0.6)", 
  },

  options: {
    flex: 1, borderColor: '#00558A', 
    borderWidth: 3, 
    borderRadius: 10,
    marginTop: -10,          
    margin: 10,
    minHeight: 450
  },

  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  map: {
    flex: 1
  },

  footer: {
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },

  input_style: {
    height: 44,
    margin: 3
  },

  title: {
    textAlign: 'center',
    fontSize: 30,
    marginRight: 15
  },
  
  button_container: {
    flexDirection: "row",
    justifyContent: "space-around"
  },

  button_style: {
    //backgroundColor: "rgba(92, 99,216, 1)",
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 5,
    margin: 3
  },

  successZone: {
    justifyContent: 'space-between', 
    flexDirection: 'column', 
    borderColor: '#599014',
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 15,
    marginRight: 15,
    padding: 15
  },

  warningZone: {
    justifyContent: 'space-between', 
    flexDirection: 'column', 
    borderColor: '#f0ad4e',
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 15,
    marginRight: 15,
    padding: 15
  },

  dangerZone: {
    justifyContent: 'space-between', 
    flexDirection: 'column', 
    borderColor: '#d9534f',
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 15,
    marginRight: 15,
    padding: 15
  },

  picButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: 'rgba(255, 255, 255, 1)',
    borderWidth: 3,
    marginBottom: StatusBar.currentHeight,
  },

  menuItem: {
    flexDirection: 'row',
    paddingLeft: 5,    
    paddingTop: 15,
    paddingBottom: 15,
    alignItems: 'center',
  },

  menuItemActive: {
    borderLeftWidth: 4,
    borderColor: '#599014',
  },

  menuText: {
    paddingLeft: 5,    
  }
  
});