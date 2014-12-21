/* jshint strict:false */

module.exports = {
  options: {
    config: 'grunt/.csscomb.json'
  }, 
  
  "css": {
    src: '<%= less.css.dest %>', 
    dest: '<%= less.css.dest %>'
  }
}