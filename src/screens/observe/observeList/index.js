import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Alert,
  TouchableOpacity
 } from 'react-native';
import getStateItem from '../../../state/getStateItem'
import {DB_KEY,RESPONSE_MESSAGE} from '../../../common/helper/keys'
import TopHeader from '../../../common/component/topHeader'
import styles from './styles'
import URLS from '../../../common/helper/urls'
import HEADER from '../../../common/helper/constants'
const {width , height }  = Dimensions.get('window');
import Icon from 'react-native-vector-icons/FontAwesome'
import {executeApiWith} from '../../../api'

import Loader from '../../../common/component/loader'
// import api and emitter
import {InviteObserveDidChange, ObserveListDidChange} from '../../../state/emitters'
import { getGuestList, deleteObserveInvite } from '../../../../galenApiLibrary/guestUser';
import { API_TIMEOUT } from '../../../common/helper/util';

export default class ObserveListScreen extends Component {
    _keyExtractor = (item, index) =>  index.toString()
    constructor(props){
        super(props)

        this.eventObserveListDidChange = this.eventObserveListDidChange.bind(this)
        this.eventInviteObserveDidChange = this.eventInviteObserveDidChange.bind(this)

        this.state = {observeList:[],themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),loading:false}
    }

    back(){
        this.props.navigation.goBack()
    }

     componentDidMount(){
        ObserveListDidChange.addObserveListListener(this.eventObserveListDidChange)
        InviteObserveDidChange.addInviteObserveListener(this.eventInviteObserveDidChange)
        this.setState({loading:true})
        this.fetchObserveListFromAPI()
    }


    async fetchObserveListFromAPI() {
        let res = await getGuestList()

         this.setState({loading:false})
          if (res.status === 200) {
              let jsonResponse = await res.json()
              let content = jsonResponse.content
              if (content !== undefined && content !== null && content.length > 0) {
                this.setState({observeList:content})
              }else{
                this.setState({observeList:[]})
              }
         }
    }

    componentWillUnmount(){
        ObserveListDidChange.removeObserveListListener(this.eventObserveListDidChange)
        InviteObserveDidChange.removeInviteObserveListener(this.eventInviteObserveDidChange)
    }

    eventObserveListDidChange(){
        
        this.setState({loading:false})
        const observeList = getStateItem("observeListArray")
        
        if (observeList.length > 0){
            this.setState({observeList:observeList})
        }
    }

    eventInviteObserveDidChange=()=>{
        this.fetchObserveListFromAPI()
    }

    _renderLoader() {
        const {loading} = this.state
    
        if (loading) {
            return (<Loader />)
        }else{
            return (<View />)
        }
    }

    async delegateGuestInvite(item){
        
           this.setState({loading:true})
           const promiseDeleteObserveInviteTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
           let res = await Promise.race([promiseDeleteObserveInviteTimeout, deleteObserveInvite(item.userObserverId)])
           if (!res) {
               this.setState({loading:false})
               alert("API Delayed response for delegateGuestInvite ")
               return
           }

           if (res.status === 200){
            this.setState({loading:false})
            alert('Observe deleted successfully')
            this.fetchObserveListFromAPI()

           }else{
            this.setState({loading:false})
            alert('Some error occurred while deleting the invite')
           }
 
    }

    deleteInvite(item){
       Alert.alert(
            'DELETE',
            "Are you sure you want to delete guest invite?",
            [
              {text: 'Yes', onPress: () => this.delegateGuestInvite(item)},
              {text: 'No',style: "cancel"}
            ],
            { cancelable: false }
          )
    }

    renderRow(item, index){
        const {themeChanged} = this.state;
        let name = "-"
        if (item.observer !== undefined && item.observer !== null){
            name = item.observer.fullName
        }
        let isAccepted = item.requestStatus === 'ACCEPTED'

        return(
            <View style={styles.row} >
                 <View style={[styles.rowContainer, {backgroundColor:themeChanged?'rgba(37,40,44,1.0)':'rgba(238,238,238,1.0)',shadowColor : themeChanged ?  "#000" : "rgba(240,240,240,1.0)", borderBottomColor:themeChanged? "#000" : 'rgba(240,240,240,1.0)'}]} >
                <Text  allowFontScaling={false} style={{color:themeChanged ?'rgba(241,241,241,1.0)': styles.welcomeText.color, fontSize:height*0.020,fontWeight: 'bold',marginLeft:width*0.03}}>{name}</Text>
                 <Text  allowFontScaling={false} style={{color:themeChanged ?'rgba(241,241,241,0.7)': 'gray', fontSize:height*0.014,fontWeight: 'normal',marginLeft:width*0.03,marginTop:5}}>{item.observerEmailAddress}</Text>
                </View>  

                 <View style={{position:'absolute', width:width*0.31, height:height*0.08,marginLeft:width*0.63,marginTop:height*0.01}}>
                 <View style= {{flexDirection:'row', justifyContent:'flex-end'}}>
                 <Icon name={'circle'} size={height*0.02} color={isAccepted ? 'green' : 'orange'} style={{marginTop:height*0.01}}/>
                 <Text  allowFontScaling={false} style={{color:themeChanged ?'rgba(241,241,241,1.0)': styles.welcomeText.color, fontSize:height*0.020,fontWeight: 'bold',marginLeft:width*0.02, marginTop:height*0.006}}>{item.requestStatus}</Text>
                 </View>
                
                <TouchableOpacity style={{alignItems:'center'}} onPress={()=>this.deleteInvite(item)}>
                <Icon name={'trash'} size={height*0.03} color={'red'} style={{marginTop:height*0.01}} />
                
                </TouchableOpacity>
                 </View>
          
            </View>     
        )
    }

    _renderUI() {
        const {observeList} = this.state;
        const {themeChanged} = this.state;
        if (observeList.length > 0) {
            return(
                <View style={styles.contentContainer}>
                <FlatList
              data={observeList}
               renderItem = {({item, index})=> this.renderRow(item, index)}
                keyExtractor = {this._keyExtractor}
                / >
                    </View>
            )
        }else{
           return(
                <View style={styles.contentContainer}>
                <Text  allowFontScaling={false} style={{color:themeChanged ?'rgba(241,241,241,1.0)': styles.welcomeText.color, fontSize:height*0.020,fontWeight: 'bold'}}>There is no observe!! Please invite observe</Text>
                    </View>
            ) 
        }
    }
    inviteObserve=()=>{
this.props.navigation.navigate('InviteObserveScreen')
    }

    _renderInviteObserve(){
        const {themeChanged} = this.state;
        return(
            <View style={styles.inviteObserveContainer} >
                <TouchableOpacity style={{flexDirection:'row'}} onPress={()=> this.inviteObserve()}>
                
                 <Icon name={'plus-circle'} size={30} color={'rgba(94,21,42,1.0)'} />
                 <Text  allowFontScaling={false} style={{color:themeChanged ?'rgba(241,241,241,1.0)': styles.welcomeText.color, fontSize:height*0.020,fontWeight: 'bold',marginLeft:10, marginTop:2}}>Invite Guest</Text>
                </TouchableOpacity>
                 
                </View>
        )
    }

    

    render(){
        const {themeChanged} = this.state;
    return(
        <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(255,255,255,1.0)'}]}>
         <TopHeader leftTitle={'Guest'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
        {this._renderUI()}
        {this._renderInviteObserve()}
        {this._renderLoader()}
         </View>

        )
    }

}