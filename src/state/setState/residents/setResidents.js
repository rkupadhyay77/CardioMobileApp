import {ResidentsChange} from '../../emitters';
import setStateItem from '../setStateItem';
import DeviceInfo from './deviceInfo';
import Residents from './residents';
import {DB_KEY} from '../../../common/helper/keys';
import moment from 'moment';

export default function setResidentsData(res) {
  let username = res.username ? res.username : '';
  let customer = res.customer ? res.customer : '';

  let devices = res.devices ? res.devices : '';
  let profile = res.profile ? res.profile : '';

  let deviceInfo = res.deviceInfo ? createDeviceInfoModel(res.deviceInfo) : [];

  let lastSynced = moment().format('Do MMMM YYYY, h:mm:ss a');

  let residents = new Residents(
    username,
    customer,
    devices,
    profile,
    deviceInfo,
    lastSynced,
  );

  setStateItem(DB_KEY.TOTAL_ARRAY_COUNT, deviceInfo.length);
  setStateItem(DB_KEY.RESIDENT_DATA, residents);

  ResidentsChange.emit('RESIDENTS_CHANGE');
}
export function createDeviceInfoModel(res) {
  var array = [];
  for (var index = 0; index < res.length; index++) {
    let sdnnEnabled = res[index].sdnnEnabled ? res[index].sdnnEnabled : '';
    let rmssdEnabled = res[index].rmssdEnabled ? res[index].rmssdEnabled : '';
    let rrMin = res[index].rrMin ? res[index].rrMin : '';
    let sdnnMax = res[index].sdnnMax ? res[index].sdnnMax : '';
    let hrMin = res[index].hrMin ? res[index].hrMin : '';
    let devid = res[index].devid ? res[index].devid : '';
    let name = res[index].name ? res[index].name : '';
    let rmssdMax = res[index].rmssdMax ? res[index].rmssdMax : '';
    let rrEnabled = res[index].rrEnabled ? res[index].rrEnabled : '';
    let hrEnabled = res[index].hrEnabled ? res[index].hrEnabled : '';
    let rrMax = res[index].rrMax ? res[index].rrMax : '';
    let sdnnMin = res[index].sdnnMin ? res[index].sdnnMin : '';
    let hrMax = res[index].hrMax ? res[index].hrMax : '';
    let customer = res[index].customer ? res[index].customer : '';
    let position = res[index].position ? res[index].position : '';

    let deviceInfo = new DeviceInfo(
      sdnnEnabled,
      rmssdEnabled,
      rrMin,
      rrMax,
      name,
      rmssdMax,
      sdnnMax,
      sdnnMin,
      hrMin,
      hrMax,
      devid,
      rrEnabled,
      hrEnabled,
      customer,
      position,
    );

    array.push(deviceInfo);
  }
  return array;
}
