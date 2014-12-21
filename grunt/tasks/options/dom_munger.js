/* jshint strict:false */

module.exports = {
  "html": {
    options: {
      callback: function($) {
        var $html = $('html'), 
        html = $html.html(), 
        updatedHTML = html.replace(/\n\s+/g, '')
                          .replace(/\n/g, '')
                          .replace(/<!--[^\[]*?-->/g, '')
                          .replace(/\.\.\/dist\//gi, '');
        
        $html.html(updatedHTML);
      }
    }, 
    src: 'src/index.html', 
    dest: 'dist/index.html'
  }
}