'use strict';

export default function checkStatus(res) {
  // check the status of the API response, throw an error if it is not 200
  // the error will be caught by the individual request and processed accordingly

  if (res.status === 200) {
    return res;
  } else {
    throw {error: res};
  }
}
