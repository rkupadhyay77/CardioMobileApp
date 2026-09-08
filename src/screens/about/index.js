import React, { Component , createRef} from 'react';
import {
  View,
  Text
} from 'react-native';
import getStateItem from '../../state/getStateItem'
import {DB_KEY} from '../../common/helper/keys'
import TopHeader from '../../common/component/topHeader'


import styles from './styles'





export default class About extends Component{

    constructor(props){
        super(props)

        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE)}
    }

    back(){
        this.props.navigation.goBack()
    }

    
    render(){
        const {themeChanged} = this.state
        let version = getStateItem("version")
        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
                <TopHeader leftTitle={'About'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
                  <View style={styles.rowContainer}>
                     <Text  allowFontScaling={false} style={styles.smallText}>Software Version</Text>
                     <Text  allowFontScaling={false} style={[styles.largeText, {color : themeChanged ? 'rgba(249,249,249,1.0)' : 'rgba(60,60,60,1.0)'}]}>{version}</Text>
                   <View style={styles.separator} />
                </View>

                <View style={styles.rowContainer}>
                     <Text  allowFontScaling={false} style={styles.smallText}>Software Developer</Text>
                     <Text  allowFontScaling={false} style={[styles.largeText, {color : themeChanged ? 'rgba(249,249,249,1.0)' : 'rgba(60,60,60,1.0)'}]}>Cardio</Text>
                   <View style={styles.separator} />
                </View>

                <View style={styles.rowContainer}>
                     <Text  allowFontScaling={false} style={styles.smallText}>Equipment Manufacturer</Text>
                     <Text  allowFontScaling={false} style={[styles.largeText, {color : themeChanged ? 'rgba(249,249,249,1.0)' : 'rgba(60,60,60,1.0)'}]}>Cardio</Text>
                </View>
            </View>
        );
    }
}