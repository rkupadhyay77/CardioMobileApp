import React, { Component } from 'react'
import { View , Text, Dimensions, TouchableOpacity, Switch} from 'react-native'
import styles from './styles'
import getStateItem from '../../../state/getStateItem';
import { DB_KEY } from '../../helper/keys';

import Icon from 'react-native-vector-icons/Entypo'
import setStateItem from '../../../state/setState/setStateItem';
import { FloatingWindowChanged } from '../../../state/emitters';


const {width , height }  = Dimensions.get('window')

export default class SettingRow extends Component {
    constructor(props) {
        super(props)
        this.state = {isPerfEnabled: getStateItem(DB_KEY.IS_PREF_ENABLED), isEventLoggingEnabled: getStateItem(DB_KEY.IS_EVENT_LOGIN_ENABLED)}
    }

    componentDidMount() {
        if (this.props.isSwitch) {
            this.floatingWindowListener = (payload) => {
                if (payload && payload.visible !== undefined) {
                    this.setState({isEventLoggingEnabled: payload.visible});
                }
            };
            FloatingWindowChanged.addFloatingWindowChangeListener(this.floatingWindowListener);
        }
    }

    componentWillUnmount() {
        if (this.props.isSwitch && this.floatingWindowListener) {
            FloatingWindowChanged.removeFloatingWindowChangeListener(this.floatingWindowListener);
        }
    }

    changePrefSetting() {
        let isPerfEnabled = getStateItem(DB_KEY.IS_PREF_ENABLED)
        let valueToSet = isPerfEnabled === true ? false : true
        setStateItem(DB_KEY.IS_PREF_ENABLED, valueToSet)

        this.setState({isPerfEnabled : !this.state.isPerfEnabled});
    }

    changeEventLoggingSetting() {
        let isEventLoggingEnabled = getStateItem(DB_KEY.IS_EVENT_LOGIN_ENABLED)
        let valueToSet = isEventLoggingEnabled === true ? false : true
        setStateItem(DB_KEY.IS_EVENT_LOGIN_ENABLED, valueToSet)
        setStateItem(DB_KEY.EVENT_LOG_ARRAY,[])
        this.setState({isEventLoggingEnabled : valueToSet});

        if (valueToSet) {
            FloatingWindowChanged.show();
        } else {
            FloatingWindowChanged.hide();
        }
    }

    _renderSwitch(){
        const {isSwitch, ...props} = this.props
        const {isEventLoggingEnabled} = this.state
        if (isSwitch) {
            return (
                <View style = {styles.switchContainer}>
                  <Switch
                    trackColor={{false: '#767577', true: '#008000'}}
                    thumbColor={isEventLoggingEnabled ? '#008000' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => this.changeEventLoggingSetting()}
                    value={isEventLoggingEnabled}
                />
       </View>
            )
        }else{
            return(<View />)
        }
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
        }
        else{
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
                <View />
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
              {this._renderSwitch()}
            </TouchableOpacity>
        )
      }
}