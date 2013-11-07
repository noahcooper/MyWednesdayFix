/* 
 * MyWednesdayFix - app.js
 * Version: 0.2 (07-NOV-2013) 
 */

(function($) {
  'use strict';
  
  /* establish namespace for the app */
  var myWednesdayFix = {};
  
  /* state info and other app data */
  myWednesdayFix.data = {
    currentIssue: {}
  };
  
  /* comicvine api methods */
  myWednesdayFix.comicVine = {
    /* get a list of issues sorted by store_date */
    getIssuesByStoreDate: function(options) {
      var settings = $.extend({
        limit: '24', 
        callback: $.noop
      }, options || {});
      
      $.ajax({
        dataType: 'jsonp', 
        url: 'http://www.comicvine.com/api/issues' + 
             '?api_key=e21e187f67061d346687aeb81969a3fd2d1676fa' + 
             '&field_list=api_detail_url,store_date,description,image,issue_number,volume' + 
             '&limit=' + settings.limit + 
             /* TODO: pagination */
             '&sort=store_date:desc' + 
             '&format=jsonp' + 
             '&json_callback=?', 
        success: settings.callback /* TODO: handle errors sent back by API */
      });
    }, 
    
    /* get an issue by its ID */
    getIssue: function(options) {
      var settings = $.extend({
        callback: $.noop
      }, options || {});
      
      $.ajax({
        dataType: 'jsonp', 
        url: 'http://www.comicvine.com/api/issue/' + settings.issueId + 
             '?api_key=e21e187f67061d346687aeb81969a3fd2d1676fa' + 
             '&field_list=store_date,description,image,issue_number,person_credits,volume' + 
             '&format=jsonp' + 
             '&json_callback=?', 
        success: settings.callback /* TODO: handle errors sent back by API */
      });
    }
  };
  
  /* helpers */
  myWednesdayFix.utils = {
    loadView: function(newView) {
      myWednesdayFix.view[newView]();
    }, 
    
    showLoading: function() {
      $('#content-loading').show();
    }, 
    
    hideLoading: function() {
      $('#content-loading').hide();
    }, 
    
    setHeadline: function(headlineText) {
      $('#content-headline').html(headlineText);
    }, 
    
    resetContent: function() {
      $('#content-wrap').html('');
    }
  };

  /* ui methods */
  myWednesdayFix.ui = {
    buildIssuesList: function(options) {
      var settings = $.extend({
        issuesList: [], 
        dateFilter: 'current'
      }, options || {});
      
      /* TODO: pagination */
      $.each(settings.issuesList, function() {
        var today = new Date(), 
        storeDateParts = this.store_date.split('-'), 
        storeDateYear = storeDateParts[0], 
        storeDateMonth = storeDateParts[1], 
        storeDateDate = storeDateParts[2], 
        storeDate = new Date(storeDateYear, 
                             storeDateMonth - 1, 
                             storeDateDate, 
                             today.getHours(), 
                             today.getMinutes(), 
                             today.getSeconds(), 
                             today.getMilliseconds()), 
        daysUntilStoreDate = (storeDate - today) / 86400000, 
        storeDateIsThisWeek = -1 < (today.getDay() + daysUntilStoreDate) && (today.getDay() + daysUntilStoreDate) < 7;
        
        if((settings.dateFilter === 'current' && storeDateIsThisWeek) || 
           (settings.dateFilter === 'future' && daysUntilStoreDate > 0 && !storeDateIsThisWeek)) {
          /* add a row if this is the first comic, or if the previous row is full */
          if($('#content-wrap .row').length === 0 || 
             $('#content-wrap .row:last .feature-col').length === 3) {
            $('#content-wrap').append('<div class="row" />');
          }
          
          var issueId = this.api_detail_url.split('/issue/')[1].split('/')[0], 
          volumeName = this.volume.name, 
          issueNumber = this.issue_number;
          
          $('#content-wrap .row:last').append('<div class="col-sm-4 feature-col">' + 
                                                '<div class="panel panel-info">' + 
                                                  '<div class="panel-heading">' + 
                                                    '<h3 class="panel-title">' + 
                                                      '<a class="view-issue" href="#issue=' + issueId + '" data-issue="' + issueId + '">' + 
                                                        volumeName + 
                                                        (issueNumber ? (' #' + issueNumber) : '') + 
                                                      '</a>' + 
                                                    '</h3>' + 
                                                  '</div>' + 
                                                  '<div class="panel-body">' + 
                                                    (this.image.small_url ? 
                                                     ('<div class="feature-image-wrap">' + 
                                                        '<a href="#"><img alt="" src="' + this.image.small_url + '"></a>' + /* TODO: link */
                                                      '</div>') : '') + 
                                                    '<h3>In Stores ' + storeDateMonth + '/' + storeDateDate + '/' + storeDateYear + '</h3>' + 
                                                    (this.description || '') + /* TODO: set max length of description */
                                                    '<p>' + 
                                                      '<a class="btn btn-primary view-issue" href="#issue=' + issueId + '" data-issue="' + issueId + '">' + 
                                                        'Read more &raquo;' + 
                                                      '</a>' + 
                                                    '</p>' + 
                                                  '</div>' + 
                                                '</div>' + 
                                              '</div>');
        }
      });
    }, 
    
    buildIssue: function(options) {
      var settings = $.extend({
        issue: {}
      }, options || {}), 
      issue = settings.issue, 
      volumeName = issue.volume.name, 
      issueNumber = issue.issue_number, 
      storeDate = issue.store_date.split('-'), 
      storeDateYear = storeDate[0], 
      storeDateMonth = storeDate[1], 
      storeDateDate = storeDate[2];
      
      /* TODO: add back to list button */
      
      $('#content-wrap').append('<div class="row">' + 
                                  '<div class="col-xs-12 feature-col">' + 
                                    '<div class="panel panel-info">' + 
                                      '<div class="panel-heading">' + 
                                        '<h3 class="panel-title">' + 
                                          volumeName + 
                                          (issueNumber ? (' #' + issueNumber) : '') +  
                                        '</h3>' + 
                                      '</div>' + 
                                      '<div class="panel-body">' + 
                                        (issue.image.medium_url ? 
                                         ('<div class="col-md-6 feature-image-wrap">' + 
                                            '<a href="#"><img alt="" src="' + issue.image.medium_url + '"></a>' + /* TODO: link */
                                          '</div>') : '') + 
                                        '<h3>In Stores ' + storeDateMonth + '/' + storeDateDate + '/' + storeDateYear + '</h3>' + 
                                        (issue.description || '') + 
                                      '</div>' + 
                                    '</div>' + 
                                  '</div>' + 
                                '</div>');
      
      $.each(issue.person_credits, function(personIndex) {
        $('#content-wrap .panel-body').append((personIndex > 0 ? '<br>' : '') + 
                                              '<span class="issue-credits">' + 
                                                this.name + (this.role ? (', ' + this.role) : '') + 
                                              '</span>');
      });
      
      /* TODO: add back to list button */
    }
  };
  
  /* view handlers */
  myWednesdayFix.view = {
    findStore: function() {
      myWednesdayFix.utils.setHeadline('Find a Store');
      
      myWednesdayFix.utils.resetContent();
      
      /* TODO */
    }, 
    
    thisWeek: function() {
      myWednesdayFix.utils.setHeadline('New This Week');
      
      myWednesdayFix.utils.resetContent();
      
      myWednesdayFix.utils.showLoading();
      
      myWednesdayFix.comicVine.getIssuesByStoreDate({
        limit: '100', 
        callback: function(response) {
          myWednesdayFix.utils.hideLoading();
          
          myWednesdayFix.ui.buildIssuesList({
            issuesList: response.results
          });
        }
      });
    }, 
    
    comingSoon: function() {
      myWednesdayFix.utils.setHeadline('Coming Soon');
      
      myWednesdayFix.utils.resetContent();
      
      myWednesdayFix.utils.showLoading();
      
      myWednesdayFix.comicVine.getIssuesByStoreDate({
        callback: function(response) {
          myWednesdayFix.utils.hideLoading();
          
          myWednesdayFix.ui.buildIssuesList({
            issuesList: response.results, 
            dateFilter: 'future'
          });
        }
      });
    }, 
    
    viewIssue: function() {
      myWednesdayFix.utils.setHeadline('');
      
      myWednesdayFix.utils.resetContent();
      
      myWednesdayFix.utils.showLoading();
      
      myWednesdayFix.comicVine.getIssue({
        issueId: myWednesdayFix.data.currentIssue.issueId, 
        callback: function(response) {
          myWednesdayFix.utils.hideLoading();
          
          myWednesdayFix.ui.buildIssue({
            issue: response.results
          });
        }
      });
    }
  };
  
  /* handle onclick event for nav links that change views */
  $('.app-nav').click(function() {
    /* TODO: prevent default */
    
    /* TODO: don't reload if view is already active, just scroll to top */
    myWednesdayFix.utils.loadView($(this).data('view'));
  });
  
  /* handle onclick event for links that load an issue */
  $('#content-wrap').on('click', '.view-issue', function(e) {
    /* TODO: prevent default */
    
    /* TODO: don't reload if view is already active, just scroll to top */
    myWednesdayFix.data.currentIssue.issueId = $(e.target).data('issue');
    myWednesdayFix.utils.loadView('viewIssue');
  });
  
  $(function() {
    /* onload, default to the thisWeek view */
    myWednesdayFix.view.thisWeek();
  });
})(jQuery);