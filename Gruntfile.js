module.exports = function(grunt) {
  'use strict';
  
  require('time-grunt')(grunt);
  
  var config = {
    pkg: grunt.file.readJSON('package.json')
  }, 
  
  /* load option files based on their names */
  loadConfig = function(path) {
    var glob = require('glob'), 
    object = {}, 
    key;
    
    glob.sync('*', {
      cwd: path
    }).forEach(function(option) {
      key = option.replace(/\.js$/, '');
      object[key] = require(path + option);
    });
    
    return object;
  }, 
  
  runTargetedTask = function(tasks, taskTarget) {
    if(taskTarget) {
      for(var i = 0; i < tasks.length; i++) {
        if(config[tasks[i]][taskTarget]) {
          tasks[i] += ':' + taskTarget;
        }
      }
    }
    
    grunt.task.run(tasks);
  };
  
  /* load all of the tasks' options */
  grunt.util._.extend(config, loadConfig('./grunt/tasks/options/'));
  grunt.initConfig(config);
  
  /* load tasks based on dependencies defined in package.json */
  require('load-grunt-tasks')(grunt);
  
  grunt.registerTask('js-dist', function(taskTarget) {
    runTargetedTask(['concat', 'uglify'], taskTarget);
  });
  grunt.registerTask('js-test', function(taskTarget) {
    runTargetedTask(['jshint'], taskTarget);
  });
  
  grunt.registerTask('css-dist', function(taskTarget) {
    runTargetedTask(['less', 'autoprefixer', 'csscomb', 'cssmin'], taskTarget);
  });
  grunt.registerTask('css-test', function(taskTarget) {
    runTargetedTask(['csslint'], taskTarget);
  });
  
  grunt.registerTask('html-inject', function(taskTarget) {
    runTargetedTask(['injector'], taskTarget);
  });
  
  grunt.registerTask('html-dist', function(taskTarget) {
    runTargetedTask(['dom_munger'], taskTarget);
  });
  
  grunt.registerTask('default', ['watch']);
};