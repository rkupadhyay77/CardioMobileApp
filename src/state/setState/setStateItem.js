import STATE from '../state';

export default function setStateItem(key, value) {
  // used to set single item in STATE, pass key argument as STRING!!!
  return (STATE[key] = value);
}
