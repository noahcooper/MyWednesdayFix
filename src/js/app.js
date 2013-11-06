/* 
 * MyWednesdayFix - app.js
 * Version: 0.1 (06-NOV-2013) 
 */

(function($) {
  /* establish namespace for the app */
  var myWednesdayFix = {};
  
  /* view handlers */
  myWednesdayFix.view = {
    thisWeek: function() {
      $('#content-headline').html('New This Week');
      
      $('#content-wrap').html('');
      
      $('#content-loading').show();
      
      /* TODO: move out of view function */
      /* TODO: pagination */
      /* TODO: automatically paginate when list includes dates with non-matching store_date */
      /* TODO: account for comics not published on wednesday using date range for full week */
      /* TODO: account for possibility of undefined field values */
      $.ajax({
        dataType: 'jsonp', 
        url: 'http://www.comicvine.com/api/issues' + 
             '?api_key=e21e187f67061d346687aeb81969a3fd2d1676fa' + 
             '&field_list=api_detail_url,store_date,description,image,issue_number,volume' + 
             '&limit=12' + 
             '&sort=cover_date:desc' + 
             '&format=jsonp' + 
             '&json_callback=?', 
        success: function(response) {
          $('#content-loading').hide();
          
          var issues = response.results;
          $.each(issues, function() {
            console.log(this.store_date);
            var storeDate = this.store_date.split('-'), 
            today = new Date(), 
            nextPossibleWednesday = new Date();
            nextPossibleWednesday.setDate(today.getDate() + (3 - today.getDay()));
            
            if(storeDate[0] == nextPossibleWednesday.getFullYear() && 
               storeDate[1] == (nextPossibleWednesday.getMonth() + 1) && 
               storeDate[2] == nextPossibleWednesday.getDate()) {
              if($('#content-wrap .row').length === 0 || 
                 $('#content-wrap .row:last .feature-col').length === 3) {
                $('#content-wrap').append('<div class="row" />');
              }
              
              $('#content-wrap .row:last').append('<div class="col-sm-4 feature-col">' + 
                                                    '<div class="panel panel-info">' + 
                                                      '<div class="panel-heading">' + 
                                                        '<h3 class="panel-title">' + 
                                                          '<a href="#">' + /* TODO: link */
                                                            this.volume.name + ' #' + this.issue_number + 
                                                          '</a>' + 
                                                        '</h3>' + 
                                                      '</div>' + 
                                                      '<div class="panel-body">' + 
                                                        '<div class="feature-image-wrap">' + 
                                                          '<a href="#"><img alt="" src="' + this.image.small_url + '"></a>' + /* TODO: link */
                                                        '</div>' + 
                                                        this.description + /* TODO: set max length of description */
                                                        '<p><a class="btn btn-primary" href="#" role="button">Read more &raquo;</a></p>' + /* TODO: link */
                                                      '</div>' + 
                                                    '</div>' + 
                                                  '</div>');
            }
          });
        }
      });
    }, 
    
    findStore: function() {
      $('#content-headline').html('Find a Store');
      
      $('#content-wrap').html('');
      
      /* TODO */
    }
  };
  
  /* handle onclick event for nav links that change views */
  $('.app-nav').click(function() {
    /* TODO: prevent default */
    
    /* TODO: don't reload if view is already active, just scroll to top */
    myWednesdayFix.view[$(this).data('view')]();
  });
  
  $(function() {
    /* onload, default to the thisWeek view */
    myWednesdayFix.view.thisWeek();
  });
})(jQuery);