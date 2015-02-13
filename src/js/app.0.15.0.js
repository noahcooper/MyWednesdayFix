/* 
 * MyWednesdayFix - app.js
 * Version: 0.15.0 (13-FEB-2015)
 */

(function($) {
  'use strict';
  
  /* get a week range, relative to this week */
  var getWeek = function(weeksBack) {
    weeksBack = weeksBack || 0;
    
    var daysBack = 7 * weeksBack, 
    today = new Date(), 
    todayYear = today.getFullYear(), 
    todayMonth = today.getMonth(), 
    todayDate = today.getDate(), 
    todayDay = today.getDay(), 
    wednesdayDate = new Date(todayYear, 
                             todayMonth, 
                             (todayDay < 3 ? ((todayDate - todayDay) - 4) : ((todayDate - todayDay) + 3))), 
    tuesdayDate = new Date(todayYear, 
                           todayMonth, 
                           (todayDay < 2 ? ((todayDate - todayDay) + 2) : (todayDate + (9 - todayDay))));
    
    wednesdayDate.setDate(wednesdayDate.getDate() - daysBack);
    tuesdayDate.setDate(tuesdayDate.getDate() - daysBack);
    
    return {
      startDate: wednesdayDate, 
      endDate: tuesdayDate
    };
  }, 
  
  /* get the name of the specified month */
  getMonthName = function(monthNum) {
    return ['January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'][monthNum];
  }, 
  
  /* establish namespace for the app */
  myWednesdayFix = {};
  
  /* state info and other app data */
  myWednesdayFix.data = {
    filterWeek: 0, 
    
    currentOffset: 0, 
    
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
        filterWeek: myWednesdayFix.data.filterWeek, 
        offset: '0', 
        callback: $.noop
      }, options || {});
      
      myWednesdayFix.data.listIsLoading = true;
      
      var filterWeek = getWeek(settings.filterWeek), 
      filterWeekStart = filterWeek.startDate, 
      filterWeekEnd = filterWeek.endDate, 
      filterString = 'store_date:' + 
                     filterWeekStart.getFullYear() + '-' + 
                     (filterWeekStart.getMonth() + 1) + '-' + 
                     filterWeekStart.getDate() + '|' + 
                     filterWeekEnd.getFullYear() + '-' + 
                     (filterWeekEnd.getMonth() + 1) + '-' + 
                     filterWeekEnd.getDate();
      
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
          location: settings.latLng, 
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
    getQueryParam: function(paramName) {
      var queryParams = window.location.href.split('?')[1], 
      queryParam;
      if(queryParams) {
        queryParams = '&' + queryParams.replace(new RegExp('&' + 'amp;', 'g'), '&');
        if(queryParams.indexOf('&' + paramName + '=') != -1) {
           queryParam = queryParams.split('&' + paramName + '=')[1].split('&')[0];
        }
      }
      return queryParam;
    }, 
    loadView: function(options) {
      var settings = $.extend({
        isPopState: false
      }, options || {}), 
      newView = settings.view, 
      viewDataString = settings.data;
      
      if(myWednesdayFix.data.currentView === newView) {
        $('html, body').animate({
          scrollTop: 0
        }, 'slow');
      }
      else {
        myWednesdayFix.data.currentView = newView;
        
        myWednesdayFix.utils.resetContent();
        myWednesdayFix.utils.hideLoading();
        
        myWednesdayFix.view[newView]();
        
        window.scrollTo(0, 0);
        
        if(window.history && history.pushState && !settings.isPopState) {
          history.pushState({
            view: newView, 
            data: viewDataString
          }, '', window.location.href.split('?')[0] + '?view=' + newView + 
                 (viewDataString ? ('&' + viewDataString) : ''));
        }
        
        ga('send', 'pageview', {
          'page': '/' + newView + (viewDataString ? ('?' + viewDataString) : '')
        });
      }
    }, 
    
    showLoading: function() {
      $('#content-loading').show();
    }, 
    
    hideLoading: function() {
      $('#content-loading').hide();
    }, 
    
    setHeadline: function(headlineText) {
      $('#content-headline').html(headlineText).removeClass('hidden');
    }, 
    
    resetContent: function() {
      $('#content-wrap').html('');
      
      myWednesdayFix.data.currentOffset = 0;
      myWednesdayFix.data.isLastListPage = false;
    }, 
    
    formatTime: function(militaryTime) {
      var militaryTimeHours = militaryTime.substring(0, 2), 
      formattedHours = militaryTime.substring(0, 2);
      if(militaryTimeHours === 0) {
        formattedHours = '12';
      }
      else if(militaryTime.substring(0, 1) === 0) {
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
        var storeDate = this.store_date.split('-'), 
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
                                        '<input type="text" class="form-control" id="lookup-query" placeholder="Enter a ZIP/Postal Code">' + 
                                      '</div>' + 
                                      '<button type="submit" class="btn btn-default">Search</button>' + 
                                    '</form>' + 
                                  '</div>' + 
                                  '<div class="list-group" id="store-results-list"></div>' + 
                                '</div>');
      
      var getComicStoresCallback = function(places) {
        if(myWednesdayFix.data.currentView === 'findStore') {
          myWednesdayFix.utils.hideLoading();
          
          $.each(places, function() {
            var placeName = this.name, 
            placeTypes = this.types || [];
            if(placeName && placeName !== '' && 
               ($.inArray('store', placeTypes) >= 0 || 
                $.inArray('book_store', placeTypes) >= 0 || 
                $.inArray('establishment', placeTypes) >= 0)) {
              $('#store-results-list').append('<a class="list-group-item view-store" href="#" data-reference="' + this.reference + '">' + 
                                                '<h4 class="list-group-item-heading">' + 
                                                  placeName + 
                                                '</h4>' + 
                                                '<p class="list-group-item-text">' + 
                                                  this.formatted_address.split(', United States')[0] + 
                                                '</p>' + 
                                              '</a>');
            }
          });
          
          if($('#store-results-list .view-store').length === 0) {
            $('#store-results-list').append('<div class="list-group-item">' + 
                                              '<p class="list-group-item-text">No results found.</p>' + 
                                            '</div>');
          }
        }
      };
      
      if(navigator.geolocation) {
        var getPositionCallback = function(location) {
          myWednesdayFix.utils.showLoading();
          
          myWednesdayFix.googlePlaces.getComicStores({
            latLng: new google.maps.LatLng(location.coords.latitude, location.coords.longitude), 
            callback: getComicStoresCallback
          });
        };
        navigator.geolocation.getCurrentPosition(getPositionCallback);
      }
      
      $('#store-lookup').submit(function(e) {
        e.preventDefault();
        
        $('#store-results-list .list-group-item').remove();
        
        var queryValue = $('#lookup-query').val();
        if(queryValue.length > 0) {
          myWednesdayFix.utils.showLoading();
          
          myWednesdayFix.googlePlaces.getComicStores({
            query: queryValue, 
            callback: getComicStoresCallback
          });
        }
      });
    }, 
    
    buildStore: function(options) {
      var settings = $.extend({
        place: {}
      }, options || {}), 
      place = settings.place;
      if(!place) {
        myWednesdayFix.utils.loadView({
          view: 'findStore'
        });
      }
      else {
        var phoneNumber = place.formatted_phone_number, 
        website = place.website, 
        hours = place.opening_hours, 
        hasHours = hours ? true : false, 
        isOpen, 
        dailyHours, 
        reviews = place.reviews || [], 
        totalNumRatings = 0, 
        totalRating = place.rating;
        if(hasHours) {
          isOpen = hours.open_now, 
          dailyHours = hours.periods;
        }
        if(!totalRating && reviews.length > 0) {
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
        }
        
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
                                              (totalRating ? ('<div id="store-rating">' + 
                                                                '<p><strong>Rating:</strong></p>' + 
                                                              '</div>' + 
                                                              '<div id="store-reviews">' + 
                                                                '<p><strong>Reviews:</strong></p>' + 
                                                              '</div>') : '')
                                      }) + 
                                    '</div>' + 
                                  '</div>');
        if(totalRating) {
          var buildStars = function(numStars) {
            var starsHtml = '';
            
            for(var i = 0; i < 5; i++) {
              starsHtml += '<span class="glyphicon glyphicon-star' + (i >= numStars ? '-empty' : '') + '"></span>';
            }
            
            return starsHtml;
          };
          
          $('#store-rating').append('<p>' + buildStars(totalRating) + '</p>');
          
          $.each(reviews, function() {
            var reviewDate = new Date(0);
            reviewDate.setUTCSeconds(this.time);
            $('#store-reviews').append('<div class="store-review-name">' + 
                                         '<strong>' + this.author_name + '</strong> ' + 
                                         (reviewDate.getMonth() + 1) + '/' + reviewDate.getDate() + '/' + reviewDate.getFullYear() + 
                                       '</div>' + 
                                       (this.rating ? buildStars(this.rating) : '') + 
                                       '<div class="store-review-text">' + 
                                         '<p>' + this.text + '</p>' + 
                                       '</div>');
          });
        }
        
        /* TODO: add back to list button */
      }
    }
  };
  
  /* view handlers */
  myWednesdayFix.view = {
    thisWeek: function() {
      myWednesdayFix.utils.setHeadline('New This Week');
      
      myWednesdayFix.utils.showLoading();
      
      myWednesdayFix.data.filterWeek = 0;
      
      myWednesdayFix.comicVine.getIssues({
        callback: function(response) {
          if(myWednesdayFix.data.currentView === 'thisWeek') {
            if(myWednesdayFix.data.isLastListPage) {
              myWednesdayFix.utils.hideLoading();
            }
            
            myWednesdayFix.ui.buildIssuesList({
              issuesList: response.results
            });
          }
        }
      });
    }, 
    
    archives: function() {
      myWednesdayFix.utils.setHeadline('Archives');
      
      var archivesWeekListHtml = '';
      
      $.each(new Array(52), function(arrayIndex) {
        var weekIndex = arrayIndex + 1, 
        filterWeek = getWeek(weekIndex), 
        filterWeekStart = filterWeek.startDate;
        
        archivesWeekListHtml += '<a class="list-group-item view-archive-week" href="#" data-week="' + weekIndex + '">' + 
                                  '<h4 class="list-group-item-heading">' + 
                                    'Week of ' + 
                                    getMonthName(filterWeekStart.getMonth()) + ' ' + 
                                    filterWeekStart.getDate() + ', ' + 
                                    filterWeekStart.getFullYear() + 
                                  '</h4>' + 
                                '</a>';
      });
      
      $('#content-wrap').append('<div class="panel panel-info">' + 
                                  '<div class="list-group" id="archives-list">' + 
                                    archivesWeekListHtml + 
                                  '</div>' + 
                                '</div>');
    }, 
    
    archiveWeek: function() {
      myWednesdayFix.utils.setHeadline('Archives');
      
      myWednesdayFix.utils.showLoading();
      
      myWednesdayFix.comicVine.getIssues({
        callback: function(response) {
          if(myWednesdayFix.data.currentView === 'archiveWeek') {
            if(myWednesdayFix.data.isLastListPage) {
              myWednesdayFix.utils.hideLoading();
            }
            
            myWednesdayFix.ui.buildIssuesList({
              issuesList: response.results
            });
          }
        }
      });
    }, 
    
    viewIssue: function() {
      var filterWeek = myWednesdayFix.utils.getQueryParam('filterWeek');
      if(filterWeek) {
        myWednesdayFix.utils.setHeadline(filterWeek === '0' ? 'New This Week' : 'Archives');
      }
      
      myWednesdayFix.utils.showLoading();
      
      myWednesdayFix.comicVine.getIssue({
        issueId: myWednesdayFix.data.currentIssue.issueId, 
        callback: function(response) {
          if(myWednesdayFix.data.currentView === 'viewIssue') {
            myWednesdayFix.utils.hideLoading();
            
            myWednesdayFix.ui.buildIssue({
              issue: response.results
            });
          }
        }
      });
    }, 
    
    findStore: function() {
      myWednesdayFix.utils.setHeadline('Find a Comic Book Store');
      
      myWednesdayFix.ui.buildStoreLookup();
    }, 
    
    viewStore: function() {
      myWednesdayFix.utils.setHeadline('Find a Comic Book Store');
      
      myWednesdayFix.utils.showLoading();
      
      myWednesdayFix.googlePlaces.getComicStore({
        reference: myWednesdayFix.data.currentStore.reference, 
        callback: function(place) {
          if(myWednesdayFix.data.currentView === 'viewStore') {
            myWednesdayFix.utils.hideLoading();
            
            myWednesdayFix.ui.buildStore({
              place: place
            });
          }
        }
      });
    }
  };
  
  var initialView = myWednesdayFix.utils.getQueryParam('view');
  if(!initialView || !myWednesdayFix.view[initialView]) {
    myWednesdayFix.utils.loadView({
      view: 'thisWeek'
    });
  }
  else {
    var initialViewIsValid = true, 
    viewDataString, 
    filterWeek;
    if(initialView === 'viewIssue') {
      filterWeek = myWednesdayFix.utils.getQueryParam('filterWeek'), 
      issueId = myWednesdayFix.utils.getQueryParam('issueId');
      if(!issueId) {
        initialViewIsValid = false;
      }
      else {
        myWednesdayFix.data.currentIssue.issueId = issueId;
        viewDataString = 'filterWeek=' + filterWeek + '&issueId=' + issueId;
      }
    }
    else if(initialView === 'archiveWeek') {
      filterWeek = myWednesdayFix.utils.getQueryParam('filterWeek');
      if(!filterWeek || isNaN(filterWeek) || filterWeek < 0) {
        initialViewIsValid = false;
      }
      else {
        myWednesdayFix.data.filterWeek = Number(filterWeek);
        viewDataString = 'filterWeek=' + filterWeek;
      }
    }
    else if(initialView === 'viewStore') {
      var reference = myWednesdayFix.utils.getQueryParam('reference');
      if(!reference) {
        initialViewIsValid = false;
      }
      else {
        myWednesdayFix.data.currentStore.reference = reference;
        viewDataString = 'reference=' + reference;
      }
    }
    
    if(!initialViewIsValid) {
      myWednesdayFix.utils.loadView({
        view: 'thisWeek'
      });
    }
    else {
      myWednesdayFix.utils.loadView({
        view: initialView, 
        data: viewDataString, 
        isPopState: true
      });
    }
  }
  
  /* load view onpopstate */
  $(window).on('popstate', function() {
    if(history.state && 
       history.state.view && 
       history.state.view != myWednesdayFix.data.currentView) {
      myWednesdayFix.utils.loadView({
        view: history.state.view, 
        data: history.state.data, 
        isPopState: true
      });
    }
  });
  
  /* handle onclick event for nav links that change views */
  $('.app-nav').click(function(e) {
    e.preventDefault();
    
    myWednesdayFix.utils.loadView({
      view: $(this).data('view')
    });
  });
  
  /* handle onclick event for links that load an issue */
  $('#content-wrap').on('click', '.view-issue', function(e) {
    e.preventDefault();
    
    var issueId = $(e.target).closest('a').data('issue');
    myWednesdayFix.data.currentIssue.issueId = issueId;
    myWednesdayFix.utils.loadView({
      view: 'viewIssue', 
      data: 'filterWeek=' + myWednesdayFix.data.filterWeek + '&issueId=' + issueId
    });
  });
  
  /* handle onclick event for links that load an archive week */
  $('#content-wrap').on('click', '.view-archive-week', function(e) {
    e.preventDefault();
    
    var filterWeek = $(e.target).closest('a').data('week');
    myWednesdayFix.data.filterWeek = Number(filterWeek);
    myWednesdayFix.utils.loadView({
      view: 'archiveWeek', 
      data: 'filterWeek=' + filterWeek
    });
  });
  
  /* handle onclick event for links that load a store */
  $('#content-wrap').on('click', '.view-store', function(e) {
    e.preventDefault();
    
    myWednesdayFix.data.currentStore.reference = $(e.target).closest('.view-store').data('reference');
    myWednesdayFix.utils.loadView({
      view: 'viewStore', 
      data: 'reference=' + $(e.target).closest('.view-store').data('reference')
    });
  });
  
  /* when the user is near the bottom of a list view, automatically get the next page of results */
  /* don't get next page if the list is in the process of loading, or, if we're on the last page */
  $(window).scroll(function() {
    if(($(window).scrollTop() + $(window).height()) > ($(document).height() - 400) && 
       (myWednesdayFix.data.currentView === 'thisWeek' || 
        myWednesdayFix.data.currentView === 'archiveWeek') && 
       !myWednesdayFix.data.listIsLoading && 
       !myWednesdayFix.data.isLastListPage) {
      myWednesdayFix.utils.showLoading();
      
      var currentView = myWednesdayFix.data.currentView;
      myWednesdayFix.comicVine.getIssues({
        offset: myWednesdayFix.data.currentOffset, 
        callback: function(response) {
          if(myWednesdayFix.data.currentView === currentView) {
            if(myWednesdayFix.data.isLastListPage) {
              myWednesdayFix.utils.hideLoading();
            }
            
            myWednesdayFix.ui.buildIssuesList({
              issuesList: response.results
            });
          }
        }
      });
    }
  });
  
  $(function() {
    FastClick.attach(document.body);
  });
})(jQuery);