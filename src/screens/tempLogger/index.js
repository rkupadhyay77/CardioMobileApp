import React, { Component , createRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList
} from 'react-native';

import styles from './styles';
import { checkForSensorInIdentity, fetchLatestDataFromPVital } from '../../../galenApiLibrary/residents';


export default class TempLogger extends Component {
    constructor(props) {
        super(props);   
        this.getCurrentTime = this.getCurrentTime.bind(this);

        this.state = {apiDataSource:[]}    
    }

    getCurrentTime() {
        const now = new Date();
    
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
    
        const ampm = hours >= 12 ? 'pm' : 'am';
    
        hours = hours % 12;
        hours = hours || 12;
    
        return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
    }

    componentDidMount(){
       
       this._checkForSensorInIdentity()
    }

    async _checkForSensorInIdentity(){
       const {macAddress, userId} = this.props;
       const {apiDataSource} = this.state
       var newDataSource = apiDataSource
        newDataSource.push({description: "Checking in identity...", _time: this.getCurrentTime()})
        this.setState({apiDataSource: newDataSource})

        let isSensorInIdentity = await checkForSensorInIdentity(macAddress, userId)
        console.log("TempLogger:_checkForSensorInIdentity isSensorInIdentity:"+isSensorInIdentity)
        newDataSource.unshift({description: "Got "+isSensorInIdentity, _time: this.getCurrentTime()})
        this.setState({apiDataSource: newDataSource})


        newDataSource.unshift({description: "Now will check in pVitals", _time: this.getCurrentTime()})
        this.setState({apiDataSource: newDataSource})

        this._fetchPVitalsData()

        // call this api after every 10 seconds to get latest data from pVitals
        this._interval = setInterval(() => {
            this._fetchPVitalsData()
        }, 10000);

        
     }

    componentWillUnmount(){
         clearInterval(this._interval )
    }

   async  _fetchPVitalsData(){
    const {macAddress, userId} = this.props;
        const {apiDataSource} = this.state
        
       

        var newDataSource = apiDataSource
        let latestData = await fetchLatestDataFromPVital(macAddress, userId)
       
        if (latestData.length > 0){
            let latestDataObj = latestData[0]
            console.log("TempLogger:latestDataObj:"+JSON.stringify(latestDataObj))
              let isOnline = latestDataObj?.data?.Online?.value === 1 ? "Online" : "Offline"
            newDataSource.unshift({description: "Sensor is "+isOnline +", OnlineData : ("+latestDataObj?.data?.Online?.value+")", _time: this.getCurrentTime()})
            this.setState({apiDataSource: newDataSource})
        }else{
            newDataSource.unshift({description: "No data found in pVitals", _time: this.getCurrentTime()})
            this.setState({apiDataSource: newDataSource})
        }

    }

   

    _renderRow(item){
        return (
            <View style={styles.rowContainer}>
             <View style={styles.seprator}></View>
             <View style={{flexDirection:'row'}}>
             <Text>{item._time}</Text>
                <Text style={styles.descriptionText}>{item.description}</Text>
                </View>
            </View>
        )
    }

   _renderAPiData(){
       const {apiDataSource} = this.state
       if(apiDataSource.length > 0){
        return (
            <View style={styles.apiDataContainer}>
                <FlatList style={styles.flatListContainer}
                    data={apiDataSource}
                    renderItem={({item}) => (
                        this._renderRow(item)
                    )}
                    keyExtractor={(item, index) => index.toString()} 
                     >      

                </FlatList>
            </View>
        )
       }
   }

   _renderStopButton(){
    return (
        <TouchableOpacity style={{width: 200, height: 40, backgroundColor: 'floralWhite', borderRadius: 5, top: 100}} onPress={()=>this._crossPresses()}>
            <Text style={styles.crossText}>Stop pVitals call</Text>
        </TouchableOpacity>
    )
   }

    render() {
        const {onClose} = this.props;
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.crossBtnContainer} onPress={onClose}>
                    <Text style={styles.crossText}>X</Text>
                </TouchableOpacity>

                {this._renderAPiData()}
            </View>
        );
    }
}