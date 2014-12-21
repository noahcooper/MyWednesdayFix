/* jshint strict:false */

module.exports = {
  options: {
    compatibility: 'ie8', 
    noAdvanced: true
  }, 
  
  "css": {
    src: '<%= less.css.dest %>', 
    dest: 'dist/css/app.' + '<%= pkg.version %>' + '.min.css'
  }
}