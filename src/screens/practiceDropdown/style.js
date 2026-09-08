import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    width,
    height,
  },
  textStyle : {
    fontSize : height * 0.02,
    marginTop: height * 0.20, 
    marginLeft : 20,
    fontWeight: '700',
  },
  dropdownContainer: {
    marginLeft: 20 ,
    width: width - 40,
    marginTop: 10
  },
  buttonStyle: {
    width : 100,
    height :40 , 
    borderRadius : 50,
    marginLeft: width - 130,
    marginTop : -height * 0.2,
    position: 'absolute'
  },
  applyStyle : {
    width : 100,
   fontSize : 22 ,
   fontWeight: 'bold',
   textAlign: 'center',
   marginTop: 8
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height
  },
});

export default styles;
