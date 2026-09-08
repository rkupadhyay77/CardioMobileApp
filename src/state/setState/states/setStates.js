import CountryDataChange from '../../emitters/countryDataChange/countryDataChange';
import setStateItem from '../../setState/setStateItem';
import States from './states';

export default function setStatesData(res) {
  var array = [];
  for (var index = 0; index < res.length; index++) {
    let StateId = res[index].StateId ? res[index].StateId : '';
    let StateName = res[index].StateName ? res[index].StateName : '';

    array.push(new States(StateName, StateId));
  }

  setStateItem('statesArray', array);
  CountryDataChange.emit('COUNTRY_DATA_CHANGE');
}
