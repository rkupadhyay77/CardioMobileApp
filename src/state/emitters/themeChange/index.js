
import assign from 'object-assign';
import EventEmitter from 'events';

const ThemeChange = assign(EventEmitter.prototype, {

  addThemeChangeListener: function(cb){
    this.on('THEME_CHANGE',cb);
  },
  removeThemeChangeListener: function(cb){
    this.removeListener('THEME_CHANGE',cb);
  },
});

export default ThemeChange;