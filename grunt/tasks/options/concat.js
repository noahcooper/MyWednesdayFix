/* jshint strict:false */

module.exports = {
  "js": {
    files: [{
      src: ['src/js/app.js'], 
      dest: 'src/js/app.' + '<%= pkg.version %>' + '.js'
    }]
  }
}