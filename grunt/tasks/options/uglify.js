/* jshint strict:false */

module.exports = {
  "js": {
    files: [{
      src: ['src/js/app.' + '<%= pkg.version %>' + '.js'], 
      dest: 'dist/js/app.' + '<%= pkg.version %>' + '.min.js'
    }]
  }
}