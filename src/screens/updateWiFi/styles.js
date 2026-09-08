import {StyleSheet, Dimensions} from 'react-native';
import getStateItem from '../../state/getStateItem';
import {DB_KEY} from '../../common/helper/keys';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getStateItem(DB_KEY.IS_DARK_MODE)
      ? 'rgba(31,31,31,1.0)'
      : 'rgba(249,249,249,1.0)',
  },
  layout: {
    borderColor: 'rgba(240,240,240,1.0)',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
  },
  emailTextFieldContainer: {
    left: width * 0.06,
    width: width * 0.88,
    marginTop: height * 0.01,
  },
  emailTextField: {
    width: width * 0.84,
    height: 50,
    left: 5,
  },
  passwordTextField: {
    width: width * 0.84,
    height: 50,
    left: 5,
  },

  passwordTextFieldContainer: {
    left: width * 0.06,
    width: width * 0.84,
    marginTop: height * 0.02,
  },

  signInButton: {
    width: width * 0.84,
    left: width * 0.08,
    height: 50,
    marginTop: height * 0.1,
  },
  buttonTop: {
    marginTop: height * 0.02,
  },
  textContainer: {
    width: width * 0.94,
    marginLeft: width * 0.03,
    justifyContent: 'center',
    alignItems: 'center',
    height: height * 0.6,
  },
  singInText: {
    color: 'rgba(144,144,144,1.0)',
    marginLeft: width * 0.06,
    fontSize: width * 0.04,
    fontWeight: 'normal',
    marginTop: height * 0.01,
  },
  wifiInfoBox: {
    width,
    height: height * 0.2,
  },
  ssidBox: {
    height: 30,
    flexDirection: 'row',
  },
});

export default styles;
