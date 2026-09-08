import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text
} from 'react-native';

import TopHeader from '../../common/component/topHeader'
import styles from './styles'
import ButtonK from '../../common/component/Button'
import getStateItem from '../../state/getStateItem'
import setStateItem from '../../state/setState/setStateItem'
import {DB_KEY} from '../../common/helper/keys'

export default class MedicalTextScreen extends Component{
    constructor(props){
        super(props)

        this.state = {themeChanged :getStateItem(DB_KEY.IS_DARK_MODE) }
    }

    back(){
        this.props.navigation.goBack()
    }

    continueTapped(){

        
        setStateItem('deviceListNav',this.props.navigation )
        
            //  this.props.navigation.navigate('ConnectWiFiScreen',{macAddress: 'C4:7F:51:8F:F6:F3', serialNumber:'number',manufacturer:'manufacturer'});
            // return
       const role = getStateItem(DB_KEY.USER).currentRole.role

       const company = getStateItem(DB_KEY.USER).currentRole?getStateItem(DB_KEY.USER).currentRole.supplier?getStateItem(DB_KEY.USER).currentRole.supplier.name:'':''
       
       if (role !== "Patient") {
       //(role.includes("Admin") || role.includes("Supplier")){
          alert('Only Patient can add a New Device.')
          return
       }
       
      this.props.navigation.navigate('DeviceConfigScannerScreen')
    }

render(){
    return(
        <View 
style={[styles.container, {backgroundColor: this.state.themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}
>
            <TopHeader leftTitle={'Disclaimer'} isDarkMode = {this.state.themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
            <View style={styles.scrollViewContainer}>
                <ScrollView>
                    <Text style={[styles.heading, {color : this.state.themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)'}]}>WARNING/ADVISORY : </Text>
                    <Text style={[styles.description, {color : this.state.themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)'}]}>* Cardi/o products are not medical devices. They are not intended for use as medical devices or to replace medical devices. They do not and are not intended to diagnose, cure, treat, mitigate, alleviate or prevent any disease or health condition, or investigate, replace or modify anatomy or any physiological process.</Text>
                    <Text style={[styles.description, {color : this.state.themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)', marginTop:15}]}>* Cardi/o monitors are intended to to provide you with information about your heart rate and breath rate and to encourage a healthy lifestyle.</Text>
                    <Text style={[styles.description, {color : this.state.themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)', marginTop:15}]}>* Cardi/o products are meant for use with healthy individuals aged 12 and up.</Text>
                    <Text style={[styles.description, {color : this.state.themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)', marginTop:15}]}>* Do not attempt to use our products as a diagnostic tool or to rely upon them for diagnosis.</Text>
                    <Text style={[styles.description, {color : this.state.themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)', marginTop:15}]}>* Do not use our products if your doctor recommends the use of hospital grade monitors/equipment.</Text>
                    <Text style={[styles.description, {color : this.state.themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)', marginTop:15}]}>* Do not use our products as a replacement for or in lieu of adult and/or medical care or professional medical advice.</Text>
                    <Text style={[styles.description, {color : this.state.themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)', marginTop:15}]}>* You are responsible for the health and well-being of you and your loved one, and following safe sleep, health, and care guidelines. The absence or occurrence of a notification is not an indication of your, or someone else's health status.</Text>
                    
                </ScrollView>
            </View>
            <ButtonK title={'Continue'} style={styles.signInButton} onPress={()=> this.continueTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />


        </View>
    )
}
}