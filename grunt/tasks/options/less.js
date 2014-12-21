/* jshint strict:false */

module.exports = {
  "css": {
    src: ['src/less/app.less'], 
    dest: 'src/css/app.' + '<%= pkg.version %>' + '.css'
  }
}