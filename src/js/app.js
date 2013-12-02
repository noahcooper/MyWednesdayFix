/* 
 * MyWednesdayFix - app.js
 * Version: 0.6 (01-DEC-2013) 
 */

(function($) {
  'use strict';
  
  /* establish namespace for the app */
  var myWednesdayFix = {};
  
  /* state info and other app data */
  myWednesdayFix.data = {
    currentView: 'thisWeek', 
    
    currentListOffset: '0', 
    
    listIsLoading: true, 
    
    isLastListPage: false, 
    
    currentIssue: {}, 
    
    currentStore: {}
  };
  
  /* comicvine api methods */
  myWednesdayFix.comicVine = {
    /* get a list of issues sorted by store_date */
    getIssues: function(options) {
      var settings = $.extend({
        dateFilter: 'current', 
        offset: '0', 
        callback: $.noop
      }, options || {});
      
      myWednesdayFix.data.listIsLoading = true;
      
      var today = new Date(), 
      todayYear = today.getFullYear(), 
      todayMonth = today.getMonth(), 
      todayDate = today.getDate(), 
      todayDay = today.getDay(), 
      lastWednesday = new Date(todayYear, 
                               todayMonth, 
                               (todayDay < 3 ? ((todayDate - todayDay) - 4) : ((todayDate - todayDay) + 3))), 
      nextTuesday = new Date(todayYear, 
                             todayMonth, 
                             (todayDay < 2 ? ((todayDate - todayDay) + 2) : (todayDate + (9 - todayDay)))), 
      nextWednesday = new Date(todayYear, 
                               todayMonth, 
                               (todayDay < 3 ? ((todayDate - todayDay) + 3) : (todayDate + (10 - todayDay)))), 
      filterString = 'store_date:';
      if(settings.dateFilter === 'future') {
        filterString += nextWednesday.getFullYear() + '-' + (nextWednesday.getMonth() + 1) + '-' + nextWednesday.getDate() + '|' + 
                        (nextWednesday.getFullYear() + 1) + '-' + (nextWednesday.getMonth() + 1) + '-' + nextWednesday.getDate();
      }
      else {
        filterString += lastWednesday.getFullYear() + '-' + (lastWednesday.getMonth() + 1) + '-' + lastWednesday.getDate() + '|' + 
                        nextTuesday.getFullYear() + '-' + (nextTuesday.getMonth() + 1) + '-' + nextTuesday.getDate();
      }
      
      $.ajax({
        dataType: 'jsonp', 
        url: 'http://www.comicvine.com/api/issues/' + 
             '?api_key=e21e187f67061d346687aeb81969a3fd2d1676fa' + 
             '&field_list=api_detail_url,store_date,description,image,issue_number,volume' + 
             '&filter=' + filterString + 
             '&sort=store_date:asc' + 
             '&limit=24' + 
             '&offset=' + settings.offset + 
             '&format=jsonp' + 
             '&json_callback=?', 
        success: function(response) {
          /* TODO: handle errors sent back by API */
          
          myWednesdayFix.data.listIsLoading = false;
          myWednesdayFix.data.currentOffset += Number(response.number_of_page_results);
          if(myWednesdayFix.data.currentOffset === Number(response.number_of_total_results)) {
            myWednesdayFix.data.isLastListPage = true;
          }
          
          settings.callback(response);
        }
      });
    }, 
    
    /* get an issue by its ID */
    getIssue: function(options) {
      var settings = $.extend({
        callback: $.noop
      }, options || {});
      
      $.ajax({
        dataType: 'jsonp', 
        url: 'http://www.comicvine.com/api/issue/' + settings.issueId + '/' + 
             '?api_key=e21e187f67061d346687aeb81969a3fd2d1676fa' + 
             '&field_list=store_date,description,image,issue_number,person_credits,volume' + 
             '&format=jsonp' + 
             '&json_callback=?', 
        success: settings.callback /* TODO: handle errors sent back by API */
      });
    }
  };
  
  /* google places */
  myWednesdayFix.googlePlaces = {
    getComicStores: function(options) {
      var settings = $.extend({
        callback: $.noop
      }, options || {});
      
      var placesService = new google.maps.places.PlacesService(document.getElementById('google-places')), 
      placesTextSearchRequest;
      
      if(settings.latLng) {
        placesTextSearchRequest = {
          location: '', 
          radius: '40234', /* 40,234 meters = ~25 miles */
          query: 'comic book stores'
        };
      }
      else {
        placesTextSearchRequest = {
          query: 'comic book stores near ' + settings.query
        };
      }
      
      placesService.textSearch(placesTextSearchRequest, settings.callback);
    }, 
    
    getComicStore: function(options) {
      var settings = $.extend({
        callback: $.noop
      }, options || {});
      
      var placesService = new google.maps.places.PlacesService(document.getElementById('google-places'));
      
      placesService.getDetails({
        reference: settings.reference
      }, settings.callback);
    }
  };
  
  /* helper functions */
  myWednesdayFix.utils = {
    loadView: function(newView, isPopState) {
      /* TODO: don't reload if view is already active, just scroll to top */
      myWednesdayFix.view[newView]();
      
      myWednesdayFix.data.currentView = newView;
      
      if(window.history && history.pushState && !isPopState) {
        history.pushState({
          view: newView
        }, '', window.location.href.split('?')[0] + '?view=' + newView);
      }
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
      
      myWednesdayFix.data.currentOffset = 0;
      myWednesdayFix.data.isLastListPage = false;
    }, 
    
    formatTime: function(militaryTime) {
      var militaryTimeHours = militaryTime.substring(0, 2), 
      formattedHours = militaryTime.substring(0, 2);
      if(militaryTimeHours == 0) {
        formattedHours = '12';
      }
      else if(militaryTime.substring(0, 1) == 0) {
        formattedHours = militaryTime.substring(1, 2);
      }
      else if(militaryTimeHours > 12) {
        formattedHours = formattedHours - 12;
      }
      
      return formattedHours + ':' + militaryTime.substring(2) + (militaryTimeHours >= 12 ? 'pm' : 'am');
    }
  };
  
  /* ui methods */
  myWednesdayFix.ui = {
    buildPanel: function(options) {
      var settings = $.extend({
        type: 'panel-info'
      }, options || {});
      
      return '<div class="panel ' + settings.type + '">' + 
               (settings.heading ? 
                ('<div class="panel-heading">' + 
                   '<h3 class="panel-title">' + 
                     settings.heading + 
                   '</h3>' + 
                 '</div>') : '') + 
               (settings.body ? 
                ('<div class="panel-body">' + 
                   settings.body + 
                 '</div>') : '') + 
             '</div>';
    }, 
    
    buildIssuesList: function(options) {
      var settings = $.extend({
        issuesList: []
      }, options || {});
      
      $.each(settings.issuesList, function() {
        var today = new Date(), 
        storeDate = this.store_date.split('-'), 
        storeDateYear = storeDate[0], 
        storeDateMonth = storeDate[1], 
        storeDateDate = storeDate[2];
        
        /* add a row if this is the first comic, or if the previous row is full */
        if($('#content-wrap .row').length === 0 || 
           $('#content-wrap .row:last .feature-col').length === 3) {
          $('#content-wrap').append('<div class="row" />');
        }
        
        var issueId = this.api_detail_url.split('/issue/')[1].split('/')[0], 
        volumeName = this.volume.name, 
        issueNumber = this.issue_number, 
        description = this.description || '', 
        descriptionTextLength = 0, 
        shortDescription = '', 
        shortDescriptionEnd, 
        
        trimOnPunctuation = function(string) {
          var lastPunctuationIndex = string.lastIndexOf('. ');
          
          if(string.lastIndexOf('? ') > lastPunctuationIndex) {
            lastPunctuationIndex = string.lastIndexOf('? ');
          }
          if(string.lastIndexOf('! ') > lastPunctuationIndex) {
            lastPunctuationIndex = string.lastIndexOf('! ');
          }
          string = string.substr(0, lastPunctuationIndex + 1);
          
          return string;
        };
        
        $('<div>' + description + '</div>').find('p, h4').each(function() {
          /* the API sometimes returns a list of covers in a table */
          /* if we get that back, remove it */
          if(!shortDescriptionEnd) {
            if($(this).is('h4:contains("List of covers and their creators")')) {
              shortDescriptionEnd = true;
            }
            else {
              descriptionTextLength += $(this).text().length;
              
              if(descriptionTextLength >= 475) {
                var trimmedText = $(this).text().substr(0, $(this).text().length - (descriptionTextLength - 475)) + ' ';
                
                trimmedText = trimOnPunctuation(trimmedText);
                
                $(this).html(trimmedText);
                
                shortDescriptionEnd = true;
              }
              
              shortDescription += $(this).wrap('<div>').parent().html();
            }
          }
          
          /* TODO: remove anchors */
        });
        
        $('#content-wrap .row:last').append('<div class="col-sm-4 feature-col">' + 
                                              myWednesdayFix.ui.buildPanel({
                                                heading: '<a class="view-issue" href="#" data-issue="' + issueId + '">' + 
                                                           volumeName + 
                                                           (issueNumber ? (' #' + issueNumber) : '') + 
                                                         '</a>', 
                                                body: (this.image.small_url ? 
                                                       ('<div class="feature-image-wrap">' + 
                                                          '<a class="view-issue" href="#" data-issue="' + issueId + '">' + 
                                                            '<img alt="" src="' + this.image.small_url + '">' + 
                                                          '</a>' + 
                                                        '</div>') : '') + 
                                                      '<h3>In Stores ' + storeDateMonth + '/' + storeDateDate + '/' + storeDateYear + '</h3>' + 
                                                      '<div class="issue-desc">' + 
                                                        shortDescription + 
                                                      '</div>' + 
                                                      '<p>' + 
                                                        '<a class="btn btn-primary view-issue" href="#" data-issue="' + issueId + '">' + 
                                                          'Read more &' + 'raquo;' + 
                                                        '</a>' + 
                                                      '</p>'
                                              }) + 
                                            '</div>');
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
                                    myWednesdayFix.ui.buildPanel({
                                      heading: volumeName + (issueNumber ? (' #' + issueNumber) : ''), 
                                      body: (issue.image.medium_url ? 
                                             ('<div class="col-md-6 feature-image-wrap">' + 
                                                '<img alt="" src="' + issue.image.medium_url + '">' + 
                                              '</div>') : '') + 
                                            '<h3 class="issue-store-date">' + 
                                              'In Stores ' + storeDateMonth + '/' + storeDateDate + '/' + storeDateYear + 
                                            '</h3>' + 
                                            '<div class="issue-desc">' + 
                                              (issue.description || '') + 
                                            '</div>'
                                    }) + 
                                  '</div>' + 
                                '</div>');
      
      /* TODO: remove anchors */
      $('.issue-desc figure, .issue-desc img, .issue-desc figcaption').remove();
      
      /* the API sometimes returns a list of covers in a table */
      /* if we get that back, turn it into a bootstrap table */
      /* also, remove the "Sidebar Location" column */
      $('.issue-desc table').addClass('table');
      $('.issue-desc table th').each(function(headingIndex) {
        if($(this).is(':contains("Sidebar Location")')) {
          $(this).closest('table').find('td:nth-child(' + (headingIndex + 1) + ')').remove();
          $(this).remove();
        }
      });
      
      $.each(issue.person_credits, function(personIndex) {
        $('#content-wrap .panel-body').append((personIndex > 0 ? '<br>' : '') + 
                                              '<span class="issue-credits">' + 
                                                this.name + (this.role ? (', ' + this.role) : '') + 
                                              '</span>');
      });
      
      /* TODO: add back to list button */
    }, 
    
    buildStoreLookup: function() {
      $('#content-wrap').append('<div class="panel panel-info">' + 
                                  '<div class="panel-body">' + 
                                    '<div class="pull-right" id="powered-by-google">' + 
                                      '<img alt="Search Powered by Google" src="images/powered-by-google-on-white.png">' + 
                                    '</div>' + 
                                    '<form id="store-lookup">' + 
                                      '<div class="form-group">' + 
                                        '<input type="text" class="form-control" id="lookup-query" placeholder="Enter a city, state, or ZIP code">' + 
                                      '</div>' + 
                                      '<button type="submit" class="btn btn-default">Search</button>' + 
                                    '</form>' + 
                                  '</div>' + 
                                  '<div class="list-group" id="store-results-list"></div>' + 
                                '</div>');
      
      $('#store-lookup').submit(function(e) {
        e.preventDefault();
        
        $('#store-results-list a').remove();
        
        if($('#lookup-query').val().length > 0) {
          myWednesdayFix.utils.showLoading();
          
          myWednesdayFix.googlePlaces.getComicStores({
            query: $('#lookup-query').val(), 
            callback: function(places) {
              myWednesdayFix.utils.hideLoading();
              
              $.each(places, function() {
                $('#store-results-list').append('<a class="list-group-item view-store" href="#" data-reference="' + this.reference + '">' + 
                                                  '<h4 class="list-group-item-heading">' + 
                                                    this.name + 
                                                  '</h4>' + 
                                                  '<p class="list-group-item-text">' + 
                                                    this.formatted_address.split(', United States')[0] + 
                                                  '</p>' + 
                                                '</a>');
              });
            }
          });
        }
      });
    }, 
    
    buildStore: function(options) {
      var settings = $.extend({
        place: {}
      }, options || {}), 
      place = settings.place, 
      phoneNumber = place.formatted_phone_number, 
      website = place.website, 
      hours = place.opening_hours, 
      hasHours = hours ? true : false, 
      isOpen, 
      dailyHours, 
      reviews = place.reviews || [], 
      totalNumRatings = 0, 
      totalRating;
      if(hasHours) {
        isOpen = hours.open_now, 
        dailyHours = hours.periods;
      }
      $.each(reviews, function() {
        if(this.rating) {
          if(!totalRating) {
            totalRating = 0;
          }
          totalNumRatings++;
          totalRating += Number(this.rating);
        }
      });
      totalRating = Math.round(totalRating / totalNumRatings);
      
      /* TODO: add back to list button */
      
      $('#content-wrap').append('<div class="row">' + 
                                  '<div class="col-xs-12 feature-col">' + 
                                    myWednesdayFix.ui.buildPanel({
                                      heading: place.name, 
                                      body: '<p><span class="glyphicon glyphicon-pushpin"></span> ' + 
                                            place.formatted_address.split(', United States')[0] + '</p>' + 
                                            (phoneNumber ? ('<p><span class="glyphicon glyphicon-earphone"></span> ' + 
                                             phoneNumber + '</p>') : '') + 
                                            (website ? ('<p><span class="glyphicon glyphicon-globe"></span> ' + 
                                             '<a target="_blank" href="' + website + '">' + website + '</a></p>') : '') + 
                                            (hasHours ? 
                                             ((isOpen ? 
                                               '<p class="text-success">This store is open now</p>' : 
                                               '<p class="text-danger">This store is currently closed</p>') + 
                                              '<p><strong>Hours:</strong></p>' + 
                                              '<p>Monday: ' + 
                                              (dailyHours[1] ? 
                                               (myWednesdayFix.utils.formatTime(dailyHours[1].open.time) + 
                                                ' to ' + myWednesdayFix.utils.formatTime(dailyHours[1].close.time)) : 'Closed') + '<br>' + 
                                              'Tuesday: ' + 
                                              (dailyHours[2] ? 
                                               (myWednesdayFix.utils.formatTime(dailyHours[2].open.time) + 
                                                ' to ' + myWednesdayFix.utils.formatTime(dailyHours[2].close.time)) : 'Closed') + '<br>' + 
                                              'Wednesday: ' + 
                                              (dailyHours[3] ? 
                                               (myWednesdayFix.utils.formatTime(dailyHours[3].open.time) + 
                                                ' to ' + myWednesdayFix.utils.formatTime(dailyHours[3].close.time)) : 'Closed') + '<br>' + 
                                              'Thursday: ' + 
                                              (dailyHours[4] ? 
                                               (myWednesdayFix.utils.formatTime(dailyHours[4].open.time) + 
                                                ' to ' + myWednesdayFix.utils.formatTime(dailyHours[4].close.time)) : 'Closed') + '<br>' + 
                                              'Friday: ' + 
                                              (dailyHours[5] ? 
                                               (myWednesdayFix.utils.formatTime(dailyHours[5].open.time) + 
                                                ' to ' + myWednesdayFix.utils.formatTime(dailyHours[5].close.time)) : 'Closed') + '<br>' + 
                                              'Saturday: ' + 
                                              (dailyHours[6] ? 
                                               (myWednesdayFix.utils.formatTime(dailyHours[6].open.time) + 
                                                ' to ' + myWednesdayFix.utils.formatTime(dailyHours[6].close.time)) : 'Closed') + '<br>' + 
                                              'Sunday: ' + 
                                              (dailyHours[0] ? 
                                               (myWednesdayFix.utils.formatTime(dailyHours[0].open.time) + 
                                                ' to ' + myWednesdayFix.utils.formatTime(dailyHours[0].close.time)) : 'Closed') + '</p>') : '') + 
                                            (totalRating ? '<div id="store-rating"><p></p></div><div id="store-reviews"></div>' : '')
                                    }) + 
                                  '</div>' + 
                                '</div>');
      if(totalRating) {
        for(var i = 0; i < 5; i++) {
          $('#store-rating p').append('<span class="glyphicon glyphicon-star' + (i >= totalRating ? '-empty' : '') + '"></span>');
        }
        $('#store-rating p').append(' <span class="store-num-reviews">' + 
                                     reviews.length + ' review' + (reviews.length > 1 ? 's' : '') + 
                                   '</span>');
        
        $.each(reviews, function() {
          var reviewDate = new Date(0);
          reviewDate.setUTCSeconds(this.time);
          $('#store-reviews').append('<div class="store-review-name">' + 
                                       '<strong>' + this.author_name + '</strong> ' + 
                                       (reviewDate.getMonth() + 1) + '/' + reviewDate.getDate() + '/' + reviewDate.getFullYear() + 
                                     '</div>' + 
                                     /* TODO: show review's rating */
                                     '<div class="store-review-text">' + 
                                       '<p>' + this.text + '</p>' + 
                                     '</div>');
        });
      }
      
      /* TODO: add back to list button */
    }
  };
  
  /* view handlers */
  myWednesdayFix.view = {
    thisWeek: function() {
      myWednesdayFix.utils.setHeadline('New This Week');
      
      myWednesdayFix.utils.resetContent();
      
      myWednesdayFix.utils.showLoading();
      
      myWednesdayFix.comicVine.getIssues({
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
      
      myWednesdayFix.comicVine.getIssues({
        dateFilter: 'future', 
        callback: function(response) {
          myWednesdayFix.utils.hideLoading();
          
          myWednesdayFix.ui.buildIssuesList({
            issuesList: response.results
          });
        }
      });
    }, 
    
    viewIssue: function() {
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
    }, 
    
    findStore: function() {
      myWednesdayFix.utils.setHeadline('Find a Comic Book Store');
      
      myWednesdayFix.utils.resetContent();
      
      myWednesdayFix.ui.buildStoreLookup();
    }, 
    
    viewStore: function() {
      myWednesdayFix.utils.resetContent();
      
      myWednesdayFix.utils.showLoading();
      
      myWednesdayFix.googlePlaces.getComicStore({
        reference: myWednesdayFix.data.currentStore.reference, 
        callback: function(place) {
          myWednesdayFix.utils.hideLoading();
          
          myWednesdayFix.ui.buildStore({
            place: place
          });
        }
      });
    }
  };
  
  /* default to the thisWeek view */
  /* TODO: check for view in URL onload */
  myWednesdayFix.utils.loadView('thisWeek');
  
  /* load view onpopstate */
  $(window).on('popstate', function() {
    if(history.state && 
       history.state.view && 
       history.state.view != myWednesdayFix.data.currentView) {
      myWednesdayFix.utils.loadView(history.state.view, true);
    }
  });
  
  /* handle onclick event for nav links that change views */
  $('.app-nav').click(function(e) {
    e.preventDefault();
    
    myWednesdayFix.utils.loadView($(this).data('view'));
  });
  
  /* handle onclick event for links that load an issue */
  $('#content-wrap').on('click', '.view-issue', function(e) {
    e.preventDefault();
    
    myWednesdayFix.data.currentIssue.issueId = $(e.target).closest('a').data('issue');
    myWednesdayFix.utils.loadView('viewIssue');
  });
  
  /* handle onclick event for links that load a store */
  $('#content-wrap').on('click', '.view-store', function(e) {
    e.preventDefault();
    
    myWednesdayFix.data.currentStore.reference = $(e.target).closest('.view-store').data('reference');
    myWednesdayFix.utils.loadView('viewStore');
  });
  
  /* when the user is near the bottom of a list view, automatically get the next page of results */
  /* don't get next page if the list is in the process of loading, or, if we're on the last page */
  $(window).scroll(function() {
    if(($(window).scrollTop() + $(window).height()) > ($(document).height() - 400) && 
       (myWednesdayFix.data.currentView === 'thisWeek' || 
        myWednesdayFix.data.currentView === 'comingSoon') && 
       !myWednesdayFix.data.listIsLoading && 
       !myWednesdayFix.data.isLastListPage) {
      myWednesdayFix.utils.showLoading();
      
      myWednesdayFix.comicVine.getIssues({
        dateFilter: myWednesdayFix.data.currentView === 'comingSoon' ? 'future' : 'current', 
        offset: myWednesdayFix.data.currentOffset, 
        callback: function(response) {
          myWednesdayFix.utils.hideLoading();
          
          myWednesdayFix.ui.buildIssuesList({
            issuesList: response.results
          });
        }
      });
    }
  });
})(jQuery);