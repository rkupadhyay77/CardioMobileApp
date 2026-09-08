import GALEN_URL from '../config';
import TOKEN from './token';
export  function getBaseURL() {
    let endPoint = getEndPoint()
 return endPoint === 'GALEN' ? GALEN_URL.BASE_URL : GALEN_URL.NEW_BASE_URL
}

export  function getGalenBaseURL() {
 return GALEN_URL.BASE_URL
}

export  function setEndPoint(endPoint) {
    return (TOKEN['END_POINT'] = endPoint);
}

export  function getEndPoint() {
    return TOKEN['END_POINT']
}


export  function isEndPointCardio() {
    let endPoint = getEndPoint()
    return endPoint !== 'GALEN' 
}