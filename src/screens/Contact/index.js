import React, { Component , createRef} from 'react';
import {
  View,
  Text
} from 'react-native';
import getStateItem from '../../state/getStateItem'
import {DB_KEY} from '../../common/helper/keys'
import TopHeader from '../../common/component/topHeader'


import styles from './styles'





export default class Contact extends Component{

    constructor(props){
        super(props)

        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE)}
    }

    back(){
        this.props.navigation.goBack()
    }
    render(){
        const {themeChanged} = this.state
        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
                <TopHeader leftTitle={'Contact us'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
                <View style={styles.rowContainer}>
                     <Text  allowFontScaling={false} style={styles.smallText}>Email Support</Text>
                     <Text  allowFontScaling={false} style={[styles.largeText, {color : themeChanged ? 'rgba(249,249,249,1.0)' : 'rgba(60,60,60,1.0)',textDecorationLine: 'underline'}]}>Support@cardio.io</Text>
                   <View style={styles.separator} />
                </View>

                <View style={styles.rowContainer}>
                     <Text  allowFontScaling={false} style={styles.smallText}>Product Support</Text>
                     <Text  allowFontScaling={false} style={[styles.largeText, {color : themeChanged ? 'rgba(249,249,249,1.0)' : 'rgba(60,60,60,1.0)'}]}>1-888.292.2208 | Ext 4.</Text>
                </View>

    
            </View>
        );
    }
}