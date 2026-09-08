// addNewUserChange
import assign from 'object-assign';
import EventEmitter from 'events';

const LoginChange = assign(EventEmitter.prototype, {

  addLoginChangeListener: function(cb){
    this.on('LOGIN_CHANGE',cb);
  },
  removeLoginChangeListener: function(cb){
    this.removeListener('LOGIN_CHANGE',cb);
  },
});

export default LoginChange;