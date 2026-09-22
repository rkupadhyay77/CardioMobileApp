
import assign from 'object-assign';
import EventEmitter from 'events';

const EventLoggingChange = assign(EventEmitter.prototype, {
  addEventLoggingChangeListener: function(cb){
    this.on('EVENT_LOGGING_CHANGE', cb);
    this.on('EVENT_LOGGING_CHANGED', cb);
  },
  removeEventLoggingChangeListener: function(cb){
    this.removeListener('EVENT_LOGGING_CHANGE', cb);
    this.removeListener('EVENT_LOGGING_CHANGED', cb);
  },
  emitChange: function(){
    this.emit('EVENT_LOGGING_CHANGE');
    this.emit('EVENT_LOGGING_CHANGED');
  },
});

export default EventLoggingChange;