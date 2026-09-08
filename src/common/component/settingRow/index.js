import React, { Component } from 'react'
import { View , Text, Dimensions, TouchableOpacity, Switch} from 'react-native'
import styles from './styles'
import getStateItem from '../../../state/getStateItem';
import { DB_KEY } from '../../helper/keys';

import Icon from 'react-native-vector-icons/Entypo'
import setStateItem from '../../../state/setState/setStateItem';


const {width , height }  = Dimensions.get('window')

export default class SettingRow extends Component {
    constructor(props) {
        super(props)
        this.state = {isPerfEnabled: getStateItem(DB_KEY.IS_PREF_ENABLED)}
    }

    changePrefSetting() {
        let isPerfEnabled = getStateItem(DB_KEY.IS_PREF_ENABLED)
        let valueToSet = isPerfEnabled === true ? false : true
        setStateItem(DB_KEY.IS_PREF_ENABLED, valueToSet)

        this.setState({isPerfEnabled : !this.state.isPerfEnabled});
    }
    _renderIcon(){
        const {isIcon,isSwitch, ...props} = this.props
        const {isPerfEnabled} = this.state
        if (isIcon){
            return(
                <View style = {styles.iconContainer}>
                <Icon name= {'chevron-thin-right'} size = {height*0.02} color = {'rgba(136,136,136,1.0)'} />
             </View>
            )
        }else if (isSwitch) {
            return (
                <View style = {styles.iconContainer}>
                  <Switch
                    trackColor={{false: '#767577', true: '#008000'}}
                    thumbColor={isPerfEnabled ? '#008000' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => this.changePrefSetting()}
                    value={isPerfEnabled}
                />
       </View>
            )
        }else{
            return(<View />)
        }
    }

    _renderSelectedType(){
        const {selectedType,isIcon, ...props} = this.props
        if (selectedType){
            return(
                <View style = {styles.selectedTypeContainer}>
                <Text  allowFontScaling={false} style = {[styles.selectedType, isIcon?{width:width*0.35}:{width:width*0.40}]}>{selectedType}</Text>
             </View>
            )
        }else{
            return (
                <View style = {styles.selectedTypeContainer} />
            )
        }
    }

    _renderTitle(){
        const {title, ...props} = this.props
        if (title){
            return(
                <View style = {styles.titleContainer}>
                <Text  allowFontScaling={false} style={styles.title}>{title}</Text>
             </View>
            )
        }else{
            return (
                <View />
            )
        }
    }


    render() {
        const {onPress, ...props} = this.props
        return (
          <TouchableOpacity style={styles.container} onPress={onPress}>  
              {this._renderTitle()} 
              {this._renderSelectedType()}
              {this._renderIcon()}
            </TouchableOpacity>
        )
      }
}