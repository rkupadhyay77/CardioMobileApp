
import assign from 'object-assign';
import EventEmitter from 'events';

const EventLoggingChange = assign(EventEmitter.prototype, {

  addEventLoggingChangeListener: function(cb){
    this.on('EVENT_LOGGING_CHANGE',cb);
  },
  removeEventLoggingChangeListener: function(cb){
    this.removeListener('EVENT_LOGGING_CHANGE',cb);
  },
});

export default EventLoggingChange;