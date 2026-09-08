import React, { Component } from 'react'
import { View,Image, Dimensions} from 'react-native'

const {width,height} = Dimensions.get('window')

export default class Loader extends Component {
    render(){
        return (
           <View style={{width:width , height: height, position:'absolute' , justifyContent: 'center' , alignItems:'center',backgroundColor:'rgba(31,31,31,0.4)'}}>
               <Image source={require('../../../img/page-loader.gif')} style={{width:width,height:height*0.25,resizeMode:'center'}} />
           </View>
        )
    }
}

