/* jshint strict:false */

module.exports = {
  options: {
    csslintrc: 'grunt/.csslintrc'
  }, 
  
  "css": {
    src: ['<%= less.css.dest %>']
  }
}