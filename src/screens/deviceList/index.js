import React, {Component} from 'react';
import {View, Text, FlatList, Dimensions, Alert, Platform} from 'react-native';

import TopHeader from '../../common/component/topHeader';
import styles from './styles';
import ButtonK from '../../common/component/Button';
import getStateItem from '../../state/getStateItem';
import {DB_KEY} from '../../common/helper/keys';
import URLS from '../../common/helper/urls';
import moment from 'moment';

import {SensorDataChange} from '../../state/emitters';
import HEADER from '../../common/helper/constants';

import Loader from '../../common/component/loader';
import DeviceRow from '../../common/component/deviceRow';
import {getSensors, executeApiWith, writeData, getDevicePropertySet, getTablesData} from '../../api';
import {getFilteredData, checkGenericNoType} from '../../common/helper/util';
import { API_TIMEOUT } from '../../common/helper/util';
const {height} = Dimensions.get('window');
import getHeaders from '../../../galenApiLibrary/config/getHeader';

import {getLastDataForDevHealth} from '../../../galenApiLibrary/setting/sensor';
import { getBaseURL } from '../../../galenApiLibrary/config/getBaseURL';
import { deleteSensor } from '../../../galenApiLibrary/setting/sensor/removeSensor';

export default class DeviceList extends Component {
  _keyExtractor = (item, index) => index.toString();

  constructor(props) {
    super(props);

    this.eventSensorDataChange = this.eventSensorDataChange.bind(this);
    this.state = {
      themeChanged: getStateItem(DB_KEY.IS_DARK_MODE),
      sensorData: getFilteredData(),
      loading: false,
      refresh: false,
    };
  }

  eventSensorDataChange() {
    this.setState({sensorData: getStateItem(DB_KEY.RESIDENT_DATA)});
  }

  componentDidMount() {
    SensorDataChange.addSensorDataChangeListener(this.eventSensorDataChange);
  }

  componentWillUnmount() {
    SensorDataChange.removeSensorDataChangeListener(this.eventSensorDataChange);
  }

  updateLocation(item) {
    this.props.navigation.navigate('UpdateSensor', {data: item});
  }
  updateWiFiInfo(item) {
    this.props.navigation.navigate('UpdateWiFi', {data: item});
  }

  getHeader() {
    var myHeaders = new Headers();
    myHeaders.append('X-APP-TYPE', HEADER.APP_TYPE);
    myHeaders.append('X-TENANT-DOMAIN', HEADER.TENANT_DOMAIN);
    myHeaders.append('X-API-VERSION', HEADER.API_VERSION);
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', getStateItem(DB_KEY.ACCESS_TOKEN));

    return getHeaders();
  }

  async apiGetWiFiDetail(Devid) {
    const resGetLastDataFromGevHealth = await getLastDataForDevHealth(Devid)
    var res = []
    if (resGetLastDataFromGevHealth.status === 200) {
      res = await resGetLastDataFromGevHealth.json();
    }
    
    return this.getCurrentVersion(res); 
  }

  getCurrentVersion(response) {
    if (
      response.content !== undefined &&
      response.content !== null &&
      response.content.length > 0
    ) {
      const lastObject = response.content[0];

      let rssValue = lastObject.data.WifiRss
        ? lastObject.data.WifiRss.value
        : 'NA';
      return rssValue;
    }

    return '';
  }

  showDialogWithMessage(item, message, isDelete) {
    Alert.alert('DELETE', message, [
      {
        text: 'Yes',
        onPress: () => this.deleteSensor(item, isDelete),
        style: 'cancel',
      },
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
    ]);
  }


  removeSensor(item) {
    const friendlyName = item.data
    ? item.data.FriendlyName
      ? item.data.FriendlyName.value
      : ''
    : '';
  const location = item.data
    ? item.data.Location
      ? item.data.Location.value
      : ''
    : '';

    const message =
    'Are you sure you to delete  ' +
    friendlyName +
    ' (' +
    location +
    ')?';

    Alert.alert('Delete Sensor', message, [
      {
        text: 'Yes',
        onPress: () => this.removeSensorWithNewAPi(item),
        style: 'cancel',
      },
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
    ]);
  }

  // removeSensor(item) {
    // const friendlyName = item.data
    //   ? item.data.FriendlyName
    //     ? item.data.FriendlyName.value
    //     : ''
    //   : '';
    // const location = item.data
    //   ? item.data.Location
    //     ? item.data.Location.value
    //     : ''
    //   : '';

  //   if (item.data.Active !== undefined && item.data.Active !== null) {
  //     let value = item.data.Active.value;

  //     if (checkGenericNoType(value)) {
  //       const message =
  //         'Are you sure you to delete all data for ' +
  //         friendlyName +
  //         ' (' +
  //         location +
  //         ')?';

  //       Alert.alert('Delete Sensor', message, [
  //         {
  //           text: 'Yes',
  //           onPress: () => this.deleteSensorPermanent(item),
  //           style: 'cancel',
  //         },
  //         {
  //           text: 'No',
  //           onPress: () => console.log('Cancel Pressed'),
  //           style: 'cancel',
  //         },
  //       ]);

  //       return;
  //     }
  //   }

  //   const message =
  //     'Are you sure you to delete ' + friendlyName + ' (' + location + ')?';

  //   Alert.alert('Remove Sensor', '', [
  //     {
  //       text: 'Deactivate sensor but Keep data',
  //       onPress: () =>
  //         this.showDialogWithMessage(
  //           item,
  //           'Are you sure you to deactivate ' +
  //             friendlyName +
  //             ' (' +
  //             location +
  //             ')?',
  //           false,
  //         ),
  //       style: 'cancel',
  //     },
  //     {
  //       text: 'Deactivate sensor and delete data',
  //       onPress: () =>
  //         this.showDialogWithMessage(
  //           item,
  //           'Are you sure you to deactivate ' +
  //             friendlyName +
  //             ' (' +
  //             location +
  //             ') and delete all data? ',
  //           true,
  //         ),
  //     },
  //     {
  //       text: 'Cancel',
  //       onPress: () => console.log('Cancel Pressed'),
  //       style: 'cancel',
  //     },
  //   ]);
  // }

  async removeSensorWithNewAPi(item){
    this.setState({loading: true});
    const macAddress = item.data.Devid.value;
    let res = await deleteSensor(macAddress)
    if (res.status === 200 || res.status === 201 || res.status === 204){
      await getSensors(false);
      this.setState({
        loading: false,
        sensorData: getStateItem(DB_KEY.RESIDENT_DATA),
        refresh: !this.state.refresh,
      });
      SensorDataChange.emit('SENSOR_DATA_CHANGED');
    }
    else{
      this.setState({loading: false});
      alert('Error while deleting sensor, Please try again later.')
    }

  }



  async deleteSensorPermanent(item) {
    this.setState({loading: true});

    const header = this.getHeader();

    // now hit the api to remove the sensor

    const userEmail = getStateItem(DB_KEY.USER_EMAIL);

    const macAddress = item.data.Devid.value;

    let identityDeviceId = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-id';
    let paramsDeviceId = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-pa';
    let thresholdDeviceId = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-th';

    let userId = item.ownerId;

    for (var index = 0; index < 3; index++) {
      let deviceId;
      if (index === 0) {
        deviceId = identityDeviceId;
      } else if (index === 1) {
        deviceId = paramsDeviceId;
      } else if (index === 2) {
        deviceId = thresholdDeviceId;
      }

      let urlGetData =
        getBaseURL() +
        'data/devicedata-advanced?sortBy=data.Timestamp.value&sortOrder=DESC&pageSize=1&pageNumber=0';
      var body;
      var devicePropertyCode;
      var deviceCriteria;
      if (deviceId.includes('id')) {
        devicePropertyCode = ['Devid', 'FriendlyName', 'Location'];
        deviceCriteria = [{key: 'Devid', operator: 'Equal', value: macAddress}];
      } else if (deviceId.includes('pa')) {
        devicePropertyCode = ['DevidParams', 'FriendlyNamePa'];
        deviceCriteria = [
          {key: 'DevidParams', operator: 'Equal', value: macAddress},
        ];
      } else if (deviceId.includes('th')) {
        devicePropertyCode = ['DevidThresholds', 'FriendlyNameT'];
        deviceCriteria = [
          {key: 'DevidThresholds', operator: 'Equal', value: macAddress},
        ];
      }
      var raw = JSON.stringify({
        deviceDataModelId: deviceId,
        deviceCriteria: deviceCriteria,
        devicePropertyCodes: devicePropertyCode,
        ownerFilter: {users: [userId]},
      });

      console.log('urlGetData'+urlGetData);
      console.log('raw'+raw);
      requestOptions = {
        method: 'POST',
        headers: header,
        body: raw,
      };

      //V3
      let res2 = await executeApiWith(urlGetData, 'POST', raw, header, "DeviceListScreen:deleteSensorPermanent")

      console.log('res2 status'+res2.status);
      let response;
      if (res2.status === 200) {
        response = await res2.json();
      }

      if (
        response !== undefined &&
        response.content !== undefined &&
        response.content !== null &&
        response.content.length > 0
      ) {
        let deviceDataId = response.content[0].deviceDataId;

        let urlDeviceDataDelete =
          getBaseURL() + 'data/' + deviceId + '/devicedata/delete';
          console.log('urlDeviceDataDelete'+urlDeviceDataDelete);
      let body = JSON.stringify({deviceDataIds: [deviceDataId]})

        requestOptions = {
          method: 'POST',
          headers: header,
          body: body,
        };

        console.log('urlDeviceDataDelete'+urlDeviceDataDelete);
        console.log('body'+body);
      

       let res3 = await executeApiWith(urlDeviceDataDelete, 'POST', body, header, "DeviceListScreen:deleteSensorPermanent")

        //console.log('res3 status'+res3.status);
     
        if (res3.status === 200) {
        } else {
        }
      }
    }

    await getSensors(false);
    this.setState({
      loading: false,
      sensorData: getStateItem(DB_KEY.RESIDENT_DATA),
      refresh: !this.state.refresh,
    });
    SensorDataChange.emit('SENSOR_DATA_CHANGED');
  }

  async deleteSensorFor(macAddress, deviceId, userId) {
    let urlGetData =
      getBaseURL() +
      'data/devicedata-advanced?sortBy=data.Timestamp.value&sortOrder=DESC&pageSize=1&pageNumber=0';
    var body;
    var devicePropertyCode;
    var deviceCriteria;
    if (deviceId.includes('id')) {
      devicePropertyCode = ['Devid', 'FriendlyName', 'Location'];
      deviceCriteria = [{key: 'Devid', operator: 'Equal', value: macAddress}];
    } else if (deviceId.includes('pa')) {
      devicePropertyCode = ['DevidParams', 'FriendlyNamePa'];
      deviceCriteria = [
        {key: 'DevidParams', operator: 'Equal', value: macAddress},
      ];
    } else if (deviceId.includes('th')) {
      devicePropertyCode = ['DevidThresholds', 'FriendlyNameT'];
      deviceCriteria = [
        {key: 'DevidThresholds', operator: 'Equal', value: macAddress},
      ];
    }
    var raw = JSON.stringify({
      deviceDataModelId: deviceId,
      deviceCriteria: deviceCriteria,
      devicePropertyCodes: devicePropertyCode,
      ownerFilter: {users: [userId]},
    });

    requestOptions = {
      method: 'POST',
      headers: header,
      body: raw,
    };

    //V3
    let res2 = await executeApiWith(urlGetData, 'POST', raw, header, "DeviceListScreen:deleteSensorFor")


    let response;
    if (res2.status === 200) {
      response = await res2.json();
    }

    if (
      response !== undefined &&
      response.content !== undefined &&
      response.content !== null &&
      response.content.length > 0
    ) {
      let deviceDataId = response.content[0].deviceDataId;

      let urlDeviceDataDelete =
        getBaseURL() + 'data/' + deviceId + '/devicedata/delete';

      requestOptions = {
        method: 'POST',
        headers: header,
        body: JSON.stringify({deviceDataIds: [deviceDataId]}),
      };

      let res3 = await executeApiWith(urlDeviceDataDelete, 'POST', JSON.stringify({deviceDataIds: [deviceDataId]}), header, "DeviceListScreen:deleteSensorFor")

    }
  }

  async deleteSensor(item, deleteData) {
    this.setState({loading: true});
    //console.log('deleteSensor')
          
    // now hit the api to remove the sensor
    const header = this.getHeader();
    var userEmail = getStateItem(DB_KEY.USER_EMAIL);

    let user = getStateItem(DB_KEY.USER);
    // check if supplierId not Genral wellness and role is Admin the show or supplierId is Genral wellness and role is Pateint the show or
    let userRole = user.currentRole ? user.currentRole.role : '';
    console.log("userRole:"+userRole)
    if (userRole === 'TenantAdmin'|| userRole === 'PracticeAdmin') {
      userEmail =  getStateItem(DB_KEY.USERS_LIST_ARRAY)[0].emailAddress;
    }

    
    let urlGetAllDeviceId =
      getBaseURL() +
      'user/patientdevice?emailAddressLike=' +
      userEmail +
      '&sortBy=deviceDataModel.name&sortOrder=ASC';

    var requestOptions = {
      method: 'GET',
      headers: header,
    };

    
    
    console.log('urlGetAllDeviceId ::: '+urlGetAllDeviceId);
    const macAddress = item.data.Devid.value;

    console.log('macAddress'+macAddress)
     

    let res = await executeApiWith(urlGetAllDeviceId, 'GET', null, header, "DeviceListScreen:deleteSensor")

    console.log('res status'+res.status)
     
    if (res.status === 200) {
      let jsonResponse = await res.json();
      console.log('jsonResponse'+jsonResponse)
     
      // patient device for the specific user and return all the sensors for this user

      if (
        jsonResponse.content !== undefined &&
        jsonResponse.content !== null &&
        jsonResponse.content.length > 0
      ) {
        let contents = jsonResponse.content;

        let filtered = contents.filter(
          content => content.value === item.data.Devid.value,
        );

        console.log('filtered'+filtered);
     
        // filtered the sensor data to be deleted

        if (filtered.length > 0) {
          var isError = false;
          for (var index = 0; index < filtered.length; index++) {
            let patientDeviceId = filtered[index].patientDeviceId;

            let urlDelete =
              getBaseURL() +
              'user/patientdevice?patientDeviceId=' +
              patientDeviceId;
            console.log('urlDelete'+urlDelete)
            requestOptions = {
              method: 'DELETE',
              headers: header,
            };

           let res = await executeApiWith(urlDelete, 'DELETE', null, header, "DeviceListScreen:deleteSensor")

            //deleting the reference from patientdevice table
            console.log('Sensor remove patient '+patientDeviceId+' status '+res.status)
            if (res.status === 200 || res.status === 201) {
            } else {
              alert('Error while deleting sensor ' + patientDeviceId);
              isError = true;
            }
          }

          if (isError === true) {
            return;
          }
        }

          if (deleteData) {
            this.deleteSensorPermanent(item);
          } else {
            // change the Active bit of identity to false for that get last device data Id and update
            const header = this.getHeader();
            const deviceId = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-id';

            let deviceCriteria = [
              {
                key: 'Devid',
                operator: 'Equal',
                value: item.data.Devid.value,
              },
            ];

            let bodyForDataDeviceId = {
              deviceDataModelId: deviceId,
              deviceCriteria: deviceCriteria,
            };
            console.log('bodyForDataDeviceId ::::: '+JSON.stringify(bodyForDataDeviceId))

            var requestOptionsDataDeviceId = {
              method: 'POST',
              headers: header,
              body: JSON.stringify(bodyForDataDeviceId),
            };

            let getDeviDataUrl =
              getBaseURL() +
              'data/devicedata-advanced?pageSize=1&pageNumber=0';
            console.log('getDeviDataUrl::::: '+getDeviDataUrl)

            var deviceDataIdToSend = '';
            //V3
            let resGetDeviDataUrl = await executeApiWith(getDeviDataUrl, 'POST', JSON.stringify(bodyForDataDeviceId), header, "DeviceListScreen:deleteSensor")


            if (resGetDeviDataUrl.status === 200) {
              let jsonRes = await resGetDeviDataUrl.json();
              if (jsonRes.content.length > 0) {
                let content = jsonRes.content[0];
                deviceDataIdToSend = content.deviceDataId;
              }
            }

            const identity_table_id = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-id'
            const promiseGetDevicePropertySetTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
            const resGetDevicePropertySet = await Promise.race([promiseGetDevicePropertySetTimeout,getDevicePropertySet(identity_table_id,  "DeviceListScreen:deleteSensor:585")])
            if (! resGetDevicePropertySet) {
              this.setState({loading:false})
                alert("API Delayed response for DeviceListScreen:deleteSensor:585")
                return
            }
            
            var requestOptions = {
              method: 'GET',
              headers: header,
            };
            //V3
            let jsonResponse = await resGetDevicePropertySet.json();

            let dataToPut = {Active: 'No', TimestampI: moment.utc().format()};

            let body = {
              deviceDataModelId: deviceId,
              deviceDataId: deviceDataIdToSend,
              data: dataToPut,
              devicePropertySetId: jsonResponse.content[0].devicePropertySetId,
            };
            console.log('jsonResponseDeviceData :::body :: '+JSON.stringify(body))
            const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
            const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData( JSON.stringify(body), "DeviceListScreen:deleteSensor")])
            if (!resWriteData) {
                this.setState({loading:false})
                alert("API Delayed response for DeviceListScreen:deleteSensor");
                return
            }

            let jsonResponseDeviceData = await resWriteData.text();

            console.log('jsonResponseDeviceData ::::: '+jsonResponseDeviceData)
          }

          await getSensors(false);
          this.setState({
            loading: false,
            sensorData: getStateItem(DB_KEY.RESIDENT_DATA),
            refresh: !this.state.refresh,
          });
          SensorDataChange.emit('SENSOR_DATA_CHANGED');
        
      } else {
        this.setState({loading: false});
        alert('Something went wrong');
      }
    } else {
      // console.log('Errror:::while getting patientdevice')
    }
  }


  addNewDevice() {
  this.props.navigation.navigate('MedicalTextScreen');

    return

this.props.navigation.navigate('ConnectWiFiScreen',{macAddress: 'C4:7F:51:94:60:E11', serialNumber:'424180-0007',manufacturer:'ATX2410-GW'});
        return
    const role = getStateItem(DB_KEY.USER).currentRole.role;

    const company = getStateItem(DB_KEY.USER).currentRole
      ? getStateItem(DB_KEY.USER).currentRole.supplier
        ? getStateItem(DB_KEY.USER).currentRole.supplier.name
        : ''
      : '';

    if (company.length <= 0) {
      //(role.includes("Admin") || role.includes("Supplier")){
      alert('Only Patient can add a New Device.');
      return;
    }

    this.props.navigation.navigate('DeviceConfigScannerScreen');
  }

  back() {
    this.props.navigation.goBack();
  }


  firmwareTapped(item) {
    this.props.navigation.navigate('FirmwareScreen', {item: item});
  }

  async findMySensor(macAddress, deviceDataId) {
    const header = this.getHeader();
    
    const promiseGetTablesDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
        const resGetTablesData = await Promise.race([promiseGetTablesDataTimeout,getTablesData("DeviceListScreen:findMySensor:674")])
        if (! resGetTablesData) {
            alert("API Delayed response for addSensoScreen:addDevice:266")
            return
        }

    var requestOptions = {
      method: 'GET',
      headers: header,
    };

    let jsonResponse = await resGetTablesData.json();

    let content = jsonResponse.content;

    let dataLength =
      content !== undefined && content !== null && content.length > 0
        ? content.length
        : 0;

    if (dataLength > 0) {
      // iterate content of device
      for (var index = 0; index < dataLength; index++) {
        let subContent = jsonResponse.content[index];

        let deviceId = subContent.deviceId;

        // get the url for device property

        if (deviceId.toUpperCase().includes('ID')) {
          const promiseGetDevicePropertySetTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
            const resGetDevicePropertySet = await Promise.race([promiseGetDevicePropertySetTimeout,getDevicePropertySet(deviceId,  "DeviceListScreen:findMySensor:704")])
            if (! resGetDevicePropertySet) {
              this.setState({loading:false})
                alert("API Delayed response for DeviceListScreen:findMySensor:704")
                return
            }
          //V3
         let jsonResponse = await resGetDevicePropertySet.json();

          let devicePropertySetId = jsonResponse.content[0].devicePropertySetId;
          let data = {
            Devid: macAddress,
            FindMySensor: 'Yes',
            TimestampI: moment.utc().format(),
          };

          let body = {
            deviceDataModelId: deviceId,
            deviceDataId: deviceDataId,
            data: data,
            devicePropertySetId: jsonResponse.content[0].devicePropertySetId,
          };
          
          const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
          const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData( JSON.stringify(body), "DeviceListScreen:findMySensor")])
          if (!resWriteData) {
              this.setState({loading:false})
              alert("API Delayed response for DeviceListScreen:findMySensor");
              return
          }

          let jsonResponseDeviceData = await resWriteData.text();

          //console.log('jsonResponseDeviceData ::::: '+jsonResponseDeviceData)
          alert(
            'Sensor led will start blinking red and blue within a minute and will keep blinking for 2 minutes',
          );
        }
      }
    }
  }

  findSensorTapped(item) {
    // alert(JSON.stringify(item))
    this.findMySensor(item.data.Devid.value, item.deviceDataId);
    //  this.findMySensor(item.data.Devid.value,item.data.FriendlyName.value,item.data.Location.value,item.data.Model.value,item.data.Devsn.value)
  }
  //item,updateWiFiInfo,updateLocation,removeSensor,firmwareTapped
  renderRow(item, index) {
    const {themeChanged} = this.state;
    return (
      <DeviceRow
        themeChanged={themeChanged}
        item={item}
        updateWiFiInfo={() => this.updateWiFiInfo(item)}
        updateLocation={() => this.updateLocation(item)}
        removeSensor={() => this.removeSensor(item)}
        firmwareTapped={() => this.firmwareTapped(item)}
        findSensorTapped={() => this.findSensorTapped(item)}
      />
    );
  }

  _renderEmptyPage() {
    const {sensorData} =  this.state
    let dataCount =  (sensorData !==  undefined &&  sensorData !==  null) ?  sensorData.length : []
    if (dataCount === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text
            allowFontScaling={false}
            style={[
              styles.text,
              {
                color: this.state.themeChanged
                  ? 'rgba(223,223,223,1.0)'
                  : 'rgba(144,144,144,1.0)',
                textAlign: 'center',
              },
            ]}>
            There is no sensor associated, Please add one.
          </Text>
        </View>
      );
    } else {
      return (
        <View
          style={[
            styles.emptyContainer,
            {height: Platform.OS === 'android' ? height * 0.74 : height * 0.75},
          ]}>
          <FlatList
            style={{paddingTop: 10}}
            data={this.state.sensorData}
            extraData={this.state.refresh}
            renderItem={({item, index}) => this.renderRow(item, index)}
            keyExtractor={this._keyExtractor}
          />
        </View>
      );
    }
  }
  _renderLoader() {
    const {loading} = this.state;

    if (loading) {
      return <Loader />;
    } else {
      return <View />;
    }
  }

  render() {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: this.state.themeChanged
              ? 'rgba(27,26,29,1.0)'
              : 'rgba(249,249,249,1.0)',
          },
        ]}>
        <TopHeader
          leftTitle={'Devices'}
          isDarkMode={this.state.themeChanged}
          onLeftIconPress={() => this.back()}
          macAddress={''}
        />
        {this._renderEmptyPage()}
        <ButtonK
          title={'Add New Device'}
          style={styles.signInButton}
          onPress={() => this.addNewDevice()}
          titleColor={'white'}
          titleFont={20}
          titleWeight={'bold'}
        />
        {this._renderLoader()}
      </View>
    );
  }
}
