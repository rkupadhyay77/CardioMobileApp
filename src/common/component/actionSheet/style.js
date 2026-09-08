import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(21,21,21,0.7)',
    position: 'absolute',
    width,
    height,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    height: 300,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  separatorLine: {
    width: width * 0.3,
    left: width * 0.35,
    height: 6,
    borderRadius: 3,
    marginTop: 20,
    backgroundColor: 'rgba(223,223,223,1.0)',
  },
  textContainer: {
    width: width * 0.94,
    height: 60,
    left: width * 0.05,
    borderBottomColor: 'rgba(223,223,223,1.0)',
    borderBottomWidth: 1,
    justifyContent: 'center'
  },
  text: {
    color: 'rgba(76,76,76,1.0)',
    fontSize: 18,
  },
  icon : {
    position: 'absolute',
     marginLeft: width*0.80
    }
});

export default styles;
