
import assign from 'object-assign';
import EventEmitter from 'events';

const LoginNewChange = assign(EventEmitter.prototype, {

  addLoginNewChangeListener: function(cb){
    this.on('LOGIN_NEW_CHANGE',cb);
  },
  removeLoginNewChangeListener: function(cb){
    this.removeListener('LOGIN_NEW_CHANGE',cb);
  },
});

export default LoginNewChange;