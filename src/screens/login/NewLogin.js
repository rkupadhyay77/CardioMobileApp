/**
 * cardio App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import {
  Image,
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  PermissionsAndroid,
  AlertIOS,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';


import ButtonK from '../../common/component/Button'
import styles from './styles'
import Loader from '../../common/component/loader'
import Policy from '../../screens/policy'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
const {width, height} = Dimensions.get('window')

export default class NewLogin extends Component { 
    constructor(props) {
        super(props);
        this.state = {
            showPolicy: false,
        }
    }
    
    
    componentDidMount() {   

    }

    componentWillUnmount() {

    }

    _renderUi(){
        const {showPolicy} = this.state
        if (showPolicy){
            return(<Policy onPress={()=>this.onPress()} nav={this.props.navigation}/>)
        }
        else{
            return(
                <View>
                    <Text  allowFontScaling={false} style= {styles.welcomeText}>Welcome,</Text>
                    </View>
            )
        }
    }

    render() {
        return (
            <KeyboardAwareScrollView
            style={{ backgroundColor: '#4c69a5' }}
            resetScrollToCoords={{ x: 0, y: 0 }}
            contentContainerStyle={styles.container}
            scrollEnabled={false}
          >
                  <Image source = {require('../../img/background.png')}  style = {styles.backgroundImageContainer} />
                
                 {this._renderUi()}
                 </KeyboardAwareScrollView>
        )
    }
}