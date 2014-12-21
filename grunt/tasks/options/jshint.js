/* jshint strict:false */

module.exports = {
  options: {
    jshintrc: 'grunt/.jshintrc'
  }, 
  
  "grunt-config": {
    files: [{
      src: [
            'Gruntfile.js', 
            'grunt/tasks/options/*.js', 
            'grunt/.jshintrc', 
            'grunt/.csslintrc', 
            'grunt/.csscomb.json'
           ]
    }]
  }, 
  
  "js": {
    files: [{
      src: [
            'src/js/app.js'
           ]
    }]
  }
}