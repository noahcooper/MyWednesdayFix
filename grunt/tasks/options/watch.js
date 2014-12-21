/* jshint strict:false */

module.exports = {
  "grunt-config": {
    files: [
            'Gruntfile.js', 
            'grunt/tasks/options/*.js', 
            'grunt/.jshintrc', 
            'grunt/.csslintrc', 
            'grunt/.csscomb.json'
           ], 
    tasks: ['jshint:grunt-config']
  }, 
  
  "js": {
    files: [
            'src/js/app.js'
           ], 
    tasks: [
            'js-dist:js', 
            'js-test:js', 
            'html-inject:js'
           ]
  }, 
  
  "css": {
    files: [
            'src/less/app.less'
           ], 
    tasks: [
            'css-dist:css', 
            'css-test:css', 
            'html-inject:css'
           ]
  }, 
  
  "html": {
    files: [
            'src/index.html'
           ], 
    tasks: [
            'html-dist:html'
           ]
  }
}