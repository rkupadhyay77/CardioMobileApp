
import React, { Component , createRef} from 'react';
import {
  View,
  Text,
  TextInput,
  Dimensions,
  Keyboard,
  
} from 'react-native';

const {width , height }  = Dimensions.get('window')
import getStateItem from '../../state/getStateItem'
import {DB_KEY} from '../../common/helper/keys'
import TopHeader from '../../common/component/topHeader'
import styles from './styles'
import DatabaseManager from '../../Database'
import ButtonK from '../../common/component/Button'

import {NotesListingChange} from  '../../state/emitters'




export default class AddNotes extends Component{

    constructor(props){
        super(props)

        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),notesTitle:'',notesDescription:'',macAddress:props.navigation.state.params.macAddress,devId:props.navigation.state.params.devId,item:props.navigation.state.params.item}
    }

    back(){
        this.props.navigation.goBack()
    }

    componentDidMount(){
        const {item} = this.state

        if (item !== undefined && item !== null){
            this.setState({
                notesTitle : item.title,
                notesDescription:item.desc
            })
        }
    }

    validate(){
        const {notesTitle,notesDescription} = this.state
        let message = ''
        if(notesTitle.length === 0){
           // message = 'Please enter notes title'
        }else if(notesDescription.length === 0){
            message = 'Please enter notes description'
        }else{
            message = ''
        }

       return message 
    }

    addNotesTapped = () => {
        const {notesTitle,notesDescription,devId, macAddress} = this.state
       
        const message = this.validate()
        if (message.length > 0){
            alert(message)
        }else{
            let currentTimeStamp = new Date().getTime()

            const {item} = this.state
           
            if (item !== undefined && item !== null){
                currentTimeStamp = item.timestamp
            }
                
            let data = {timestamp:currentTimeStamp, title:notesTitle === ''?'Notes' : notesTitle, desc: notesDescription}
            DatabaseManager.addNotes(devId,data,macAddress)
            NotesListingChange.emit('NOTES_LISTING_CHANGE')
            this.back()
        
        }
    }
    
    render(){
        const {themeChanged} = this.state
        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
                <TopHeader leftTitle={'Add Notes'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>

                

              
                <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>Notes Title</Text>
                        <View style={[styles.titleTextFieldContainer, styles.layout]}> 
                            <TextInput
                             style={[styles.titleTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            returnKeyType = {'done'}
                            keyboardType = {'default'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "ENTER NOTES TITLE"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(notesTitle) => this.setState({notesTitle})}
                            value={this.state.notesTitle}
                            />
                        </View>

                <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>Notes Description</Text>
                        <View style={[styles.titleTextFieldContainer, styles.layout, {height:height*0.25}]}> 
                            <TextInput
                            ref={(ref)=>{this.descTextInput = ref}}
                             style={[styles.titleTextField,{height:height*0.25,color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            returnKeyType = {'done'}
                            maxLength={500}
                            multiline = {true}
                            keyboardType = {'default'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "ENTER NOTES DESCRIPTION..."
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(notesDescription) => this.setState({notesDescription})}
                            value={this.state.notesDescription}
                            blurOnSubmit={true}
                            onSubmitEditing={()=>{Keyboard.dismiss()}}
                            />
                        </View>  
                        
                <ButtonK title={'ADD NOTES'} style={styles.signInButton} onPress={()=> this.addNotesTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
                         
            </View>
        );
    }
}