/* jshint strict:false */

module.exports = {
  options: {
    min: true
  }, 
  
  "js": {
    options: {
      transform: function(filepath) {
        return '<script src="..' + filepath + '"></script>';
      }
    }, 
    files: [{
      'src/index.html': ['dist/js/app.' + '<%= pkg.version %>' + '.min.js']
    }]
  }, 
  
  "css": {
    options: {
      transform: function(filepath) {
        return '<link rel="stylesheet" href="..' + filepath + '">';
      }
    }, 
    files: [{
      'src/index.html': ['dist/css/app.' + '<%= pkg.version %>' + '.min.css']
    }]
  }
}