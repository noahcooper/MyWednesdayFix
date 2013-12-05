/* MyWednesdayFix - app.js | Version: 0.8.0 (05-DEC-2013) */
(function(e){"use strict";var t=function(e){e=e||0;var t=7*e,n=new Date,r=n.getFullYear(),i=n.getMonth(),s=n.getDate(),o=n.getDay(),u=new Date(r,i,o<3?s-o-4:s-o+3),a=new Date(r,i,o<2?s-o+2:s+(9-o));u.setDate(u.getDate()-t);a.setDate(a.getDate()-t);return{startDate:u,endDate:a}},n=function(e){return["January","February","March","April","May","June","July","August","September","October","November","December"][e]},r={};r.data={currentView:"thisWeek",filterWeek:t(),currentOffset:0,listIsLoading:true,isLastListPage:false,currentIssue:{},currentStore:{}};r.comicVine={getIssues:function(t){var n=e.extend({filterWeek:r.data.filterWeek,offset:"0",callback:e.noop},t||{});r.data.listIsLoading=true;var i=n.filterWeek.startDate,s=n.filterWeek.endDate,o="store_date:"+i.getFullYear()+"-"+(i.getMonth()+1)+"-"+i.getDate()+"|"+s.getFullYear()+"-"+(s.getMonth()+1)+"-"+s.getDate();e.ajax({dataType:"jsonp",url:"http://www.comicvine.com/api/issues/"+"?api_key=e21e187f67061d346687aeb81969a3fd2d1676fa"+"&field_list=api_detail_url,store_date,description,image,issue_number,volume"+"&filter="+o+"&sort=store_date:asc"+"&limit=24"+"&offset="+n.offset+"&format=jsonp"+"&json_callback=?",success:function(e){r.data.listIsLoading=false;r.data.currentOffset+=Number(e.number_of_page_results);if(r.data.currentOffset===Number(e.number_of_total_results)){r.data.isLastListPage=true}n.callback(e)}})},getIssue:function(t){var n=e.extend({callback:e.noop},t||{});e.ajax({dataType:"jsonp",url:"http://www.comicvine.com/api/issue/"+n.issueId+"/"+"?api_key=e21e187f67061d346687aeb81969a3fd2d1676fa"+"&field_list=store_date,description,image,issue_number,person_credits,volume"+"&format=jsonp"+"&json_callback=?",success:n.callback})}};r.googlePlaces={getComicStores:function(t){var n=e.extend({callback:e.noop},t||{});var r=new google.maps.places.PlacesService(document.getElementById("google-places")),i;if(n.latLng){i={location:"",radius:"40234",query:"comic book stores"}}else{i={query:"comic book stores near "+n.query}}r.textSearch(i,n.callback)},getComicStore:function(t){var n=e.extend({callback:e.noop},t||{});var r=new google.maps.places.PlacesService(document.getElementById("google-places"));r.getDetails({reference:n.reference},n.callback)}};r.utils={loadView:function(e,t){r.data.currentView=e;r.view[e]();if(window.history&&history.pushState&&!t){history.pushState({view:e},"",window.location.href.split("?")[0]+"?view="+e)}},showLoading:function(){e("#content-loading").show()},hideLoading:function(){e("#content-loading").hide()},setHeadline:function(t){e("#content-headline").html(t)},resetContent:function(){e("#content-wrap").html("");r.data.currentOffset=0;r.data.isLastListPage=false},formatTime:function(e){var t=e.substring(0,2),n=e.substring(0,2);if(t==0){n="12"}else if(e.substring(0,1)==0){n=e.substring(1,2)}else if(t>12){n=n-12}return n+":"+e.substring(2)+(t>=12?"pm":"am")}};r.ui={buildPanel:function(t){var n=e.extend({type:"panel-info"},t||{});return'<div class="panel '+n.type+'">'+(n.heading?'<div class="panel-heading">'+'<h3 class="panel-title">'+n.heading+"</h3>"+"</div>":"")+(n.body?'<div class="panel-body">'+n.body+"</div>":"")+"</div>"},buildIssuesList:function(t){var n=e.extend({issuesList:[]},t||{});e.each(n.issuesList,function(){var t=new Date,n=this.store_date.split("-"),i=n[0],s=n[1],o=n[2];if(e("#content-wrap .row").length===0||e("#content-wrap .row:last .feature-col").length===3){e("#content-wrap").append('<div class="row" />')}var u=this.api_detail_url.split("/issue/")[1].split("/")[0],a=this.volume.name,f=this.issue_number,l=this.description||"",c=0,h="",p,d=function(e){var t=e.lastIndexOf(". ");if(e.lastIndexOf("? ")>t){t=e.lastIndexOf("? ")}if(e.lastIndexOf("! ")>t){t=e.lastIndexOf("! ")}e=e.substr(0,t+1);return e};e("<div>"+l+"</div>").find("p, h4").each(function(){if(!p){if(e(this).is('h4:contains("List of covers and their creators")')){p=true}else{c+=e(this).text().length;if(c>=475){var t=e(this).text().substr(0,e(this).text().length-(c-475))+" ";t=d(t);e(this).html(t);p=true}h+=e(this).wrap("<div>").parent().html()}}});e("#content-wrap .row:last").append('<div class="col-sm-4 feature-col">'+r.ui.buildPanel({heading:'<a class="view-issue" href="#" data-issue="'+u+'">'+a+(f?" #"+f:"")+"</a>",body:(this.image.small_url?'<div class="feature-image-wrap">'+'<a class="view-issue" href="#" data-issue="'+u+'">'+'<img alt="" src="'+this.image.small_url+'">'+"</a>"+"</div>":"")+"<h3>In Stores "+s+"/"+o+"/"+i+"</h3>"+'<div class="issue-desc">'+h+"</div>"+"<p>"+'<a class="btn btn-primary view-issue" href="#" data-issue="'+u+'">'+"Read more &"+"raquo;"+"</a>"+"</p>"})+"</div>")})},buildIssue:function(t){var n=e.extend({issue:{}},t||{}),i=n.issue,s=i.volume.name,o=i.issue_number,u=i.store_date.split("-"),a=u[0],f=u[1],l=u[2];e("#content-wrap").append('<div class="row">'+'<div class="col-xs-12 feature-col">'+r.ui.buildPanel({heading:s+(o?" #"+o:""),body:(i.image.medium_url?'<div class="col-md-6 feature-image-wrap">'+'<img alt="" src="'+i.image.medium_url+'">'+"</div>":"")+'<h3 class="issue-store-date">'+"In Stores "+f+"/"+l+"/"+a+"</h3>"+'<div class="issue-desc">'+(i.description||"")+"</div>"})+"</div>"+"</div>");e(".issue-desc figure, .issue-desc img, .issue-desc figcaption").remove();e(".issue-desc table").addClass("table");e(".issue-desc table th").each(function(t){if(e(this).is(':contains("Sidebar Location")')){e(this).closest("table").find("td:nth-child("+(t+1)+")").remove();e(this).remove()}});e.each(i.person_credits,function(t){e("#content-wrap .panel-body").append((t>0?"<br>":"")+'<span class="issue-credits">'+this.name+(this.role?", "+this.role:"")+"</span>")})},buildStoreLookup:function(){e("#content-wrap").append('<div class="panel panel-info">'+'<div class="panel-body">'+'<div class="pull-right" id="powered-by-google">'+'<img alt="Search Powered by Google" src="images/powered-by-google-on-white.png">'+"</div>"+'<form id="store-lookup">'+'<div class="form-group">'+'<input type="text" class="form-control" id="lookup-query" placeholder="Enter a city, state, or ZIP code">'+"</div>"+'<button type="submit" class="btn btn-default">Search</button>'+"</form>"+"</div>"+'<div class="list-group" id="store-results-list"></div>'+"</div>");e("#store-lookup").submit(function(t){t.preventDefault();e("#store-results-list a").remove();if(e("#lookup-query").val().length>0){r.utils.showLoading();r.googlePlaces.getComicStores({query:e("#lookup-query").val(),callback:function(t){r.utils.hideLoading();e.each(t,function(){e("#store-results-list").append('<a class="list-group-item view-store" href="#" data-reference="'+this.reference+'">'+'<h4 class="list-group-item-heading">'+this.name+"</h4>"+'<p class="list-group-item-text">'+this.formatted_address.split(", United States")[0]+"</p>"+"</a>")})}})}})},buildStore:function(t){var n=e.extend({place:{}},t||{}),i=n.place,s=i.formatted_phone_number,o=i.website,u=i.opening_hours,a=u?true:false,f,l,c=i.reviews||[],h=0,p=i.rating;if(a){f=u.open_now,l=u.periods}if(!p&&c.length>0){e.each(c,function(){if(this.rating){if(!p){p=0}h++;p+=Number(this.rating)}});p=Math.round(p/h)}e("#content-wrap").append('<div class="row">'+'<div class="col-xs-12 feature-col">'+r.ui.buildPanel({heading:i.name,body:'<p><span class="glyphicon glyphicon-pushpin"></span> '+i.formatted_address.split(", United States")[0]+"</p>"+(s?'<p><span class="glyphicon glyphicon-earphone"></span> '+s+"</p>":"")+(o?'<p><span class="glyphicon glyphicon-globe"></span> '+'<a target="_blank" href="'+o+'">'+o+"</a></p>":"")+(a?(f?'<p class="text-success">This store is open now</p>':'<p class="text-danger">This store is currently closed</p>')+"<p><strong>Hours:</strong></p>"+"<p>Monday: "+(l[1]?r.utils.formatTime(l[1].open.time)+" to "+r.utils.formatTime(l[1].close.time):"Closed")+"<br>"+"Tuesday: "+(l[2]?r.utils.formatTime(l[2].open.time)+" to "+r.utils.formatTime(l[2].close.time):"Closed")+"<br>"+"Wednesday: "+(l[3]?r.utils.formatTime(l[3].open.time)+" to "+r.utils.formatTime(l[3].close.time):"Closed")+"<br>"+"Thursday: "+(l[4]?r.utils.formatTime(l[4].open.time)+" to "+r.utils.formatTime(l[4].close.time):"Closed")+"<br>"+"Friday: "+(l[5]?r.utils.formatTime(l[5].open.time)+" to "+r.utils.formatTime(l[5].close.time):"Closed")+"<br>"+"Saturday: "+(l[6]?r.utils.formatTime(l[6].open.time)+" to "+r.utils.formatTime(l[6].close.time):"Closed")+"<br>"+"Sunday: "+(l[0]?r.utils.formatTime(l[0].open.time)+" to "+r.utils.formatTime(l[0].close.time):"Closed")+"</p>":"")+(p?'<div id="store-rating">'+"<p><strong>Rating:</strong></p>"+"</div>"+'<div id="store-reviews">'+"<p><strong>Reviews:</strong></p>"+"</div>":"")})+"</div>"+"</div>");if(p){var d=function(e){var t="";for(var n=0;n<5;n++){t+='<span class="glyphicon glyphicon-star'+(n>=e?"-empty":"")+'"></span>'}return t};e("#store-rating").append("<p>"+d(p)+"</p>");e.each(c,function(){var t=new Date(0);t.setUTCSeconds(this.time);e("#store-reviews").append('<div class="store-review-name">'+"<strong>"+this.author_name+"</strong> "+(t.getMonth()+1)+"/"+t.getDate()+"/"+t.getFullYear()+"</div>"+(this.rating?d(this.rating):"")+'<div class="store-review-text">'+"<p>"+this.text+"</p>"+"</div>")})}}};r.view={thisWeek:function(){r.utils.setHeadline("New This Week");r.utils.resetContent();r.utils.showLoading();r.data.filterWeek=t();r.comicVine.getIssues({callback:function(e){r.utils.hideLoading();r.ui.buildIssuesList({issuesList:e.results})}})},archives:function(){r.utils.setHeadline("Archives");r.utils.resetContent();var i="";e.each([1,2,3,4,5,6,7,8,9,10,11,12],function(){var e=t(this),r=e.startDate;i+='<a class="list-group-item view-archive-week" href="#" data-week="'+this+'">'+'<h4 class="list-group-item-heading">'+"Week of "+n(r.getMonth())+" "+r.getDate()+", "+r.getFullYear()+"</h4>"+"</a>"});e("#content-wrap").append('<div class="panel panel-info">'+'<div id="archives-list">'+i+"</div>"+"</div>")},archiveWeek:function(){r.utils.setHeadline("Archives");r.utils.resetContent();r.utils.showLoading();r.comicVine.getIssues({callback:function(e){r.utils.hideLoading();r.ui.buildIssuesList({issuesList:e.results})}})},viewIssue:function(){r.utils.resetContent();r.utils.showLoading();r.comicVine.getIssue({issueId:r.data.currentIssue.issueId,callback:function(e){r.utils.hideLoading();r.ui.buildIssue({issue:e.results})}})},findStore:function(){r.utils.setHeadline("Find a Comic Book Store");r.utils.resetContent();r.ui.buildStoreLookup()},viewStore:function(){r.utils.resetContent();r.utils.showLoading();r.googlePlaces.getComicStore({reference:r.data.currentStore.reference,callback:function(e){r.utils.hideLoading();r.ui.buildStore({place:e})}})}};r.utils.loadView("thisWeek");e(window).on("popstate",function(){if(history.state&&history.state.view&&history.state.view!=r.data.currentView){r.utils.loadView(history.state.view,true)}});e(".app-nav").click(function(t){t.preventDefault();r.utils.loadView(e(this).data("view"))});e("#content-wrap").on("click",".view-issue",function(t){t.preventDefault();r.data.currentIssue.issueId=e(t.target).closest("a").data("issue");r.utils.loadView("viewIssue")});e("#content-wrap").on("click",".view-archive-week",function(n){n.preventDefault();r.data.filterWeek=t(e(n.target).closest("a").data("week"));r.utils.loadView("archiveWeek")});e("#content-wrap").on("click",".view-store",function(t){t.preventDefault();r.data.currentStore.reference=e(t.target).closest(".view-store").data("reference");r.utils.loadView("viewStore")});e(window).scroll(function(){if(e(window).scrollTop()+e(window).height()>e(document).height()-400&&(r.data.currentView==="thisWeek"||r.data.currentView==="archiveWeek")&&!r.data.listIsLoading&&!r.data.isLastListPage){r.utils.showLoading();r.comicVine.getIssues({offset:r.data.currentOffset,callback:function(e){r.utils.hideLoading();r.ui.buildIssuesList({issuesList:e.results})}})}})})(jQuery)