import React, { Component } from 'react'
import { TouchableOpacity,Image, Text} from 'react-native'




export default class ButtonK extends Component {
    render(){
        const {title,onPress,style,titleColor,titleFont,titleWeight, ...props} = this.props
        return(
            <TouchableOpacity onPress={onPress} style={[style,{justifyContent:'center',alignItems:'center'}]}>
                <Image style={{width:style.width,height:style.height,resizeMode:'stretch',position:'absolute'}} source={require('../../../img/buttonBg.png')} />
                <Text  allowFontScaling={false} style={{width:style.width, height: style.height,fontSize: titleFont, color:titleColor,fontWeight:titleWeight, textAlign: 'center', top:(style.height-titleFont)/2.2}}>{title}</Text>
            </TouchableOpacity>
        )
    }
}