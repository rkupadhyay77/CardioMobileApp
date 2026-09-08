import TOKEN from './token';

export function setBerarToken(token) {
    return (TOKEN['BEARER_TOKEN'] = token);
}


export function setGalenToken(token) {
    return (TOKEN['GALEN_BEARER_TOKEN'] = token);
}
