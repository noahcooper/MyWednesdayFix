/* MyWednesdayFix - app.js | Version: 0.11.0 (10-FEB-2014) */
(function(e){"use strict";var t=function(e){e=e||0;var t=7*e,n=new Date,r=n.getFullYear(),i=n.getMonth(),s=n.getDate(),o=n.getDay(),u=new Date(r,i,o<3?s-o-4:s-o+3),a=new Date(r,i,o<2?s-o+2:s+(9-o));u.setDate(u.getDate()-t);a.setDate(a.getDate()-t);return{startDate:u,endDate:a}},n=function(e){return["January","February","March","April","May","June","July","August","September","October","November","December"][e]},r={};r.data={filterWeek:0,currentOffset:0,listIsLoading:true,isLastListPage:false,currentIssue:{},currentStore:{}};r.comicVine={getIssues:function(n){var i=e.extend({filterWeek:r.data.filterWeek,offset:"0",callback:e.noop},n||{});r.data.listIsLoading=true;var s=t(i.filterWeek),o=s.startDate,u=s.endDate,a="store_date:"+o.getFullYear()+"-"+(o.getMonth()+1)+"-"+o.getDate()+"|"+u.getFullYear()+"-"+(u.getMonth()+1)+"-"+u.getDate();e.ajax({dataType:"jsonp",url:"http://www.comicvine.com/api/issues/"+"?api_key=e21e187f67061d346687aeb81969a3fd2d1676fa"+"&field_list=api_detail_url,store_date,description,image,issue_number,volume"+"&filter="+a+"&sort=store_date:asc"+"&limit=24"+"&offset="+i.offset+"&format=jsonp"+"&json_callback=?",success:function(e){r.data.listIsLoading=false;r.data.currentOffset+=Number(e.number_of_page_results);if(r.data.currentOffset===Number(e.number_of_total_results)){r.data.isLastListPage=true}i.callback(e)}})},getIssue:function(t){var n=e.extend({callback:e.noop},t||{});e.ajax({dataType:"jsonp",url:"http://www.comicvine.com/api/issue/"+n.issueId+"/"+"?api_key=e21e187f67061d346687aeb81969a3fd2d1676fa"+"&field_list=store_date,description,image,issue_number,person_credits,volume"+"&format=jsonp"+"&json_callback=?",success:n.callback})}};r.googlePlaces={getComicStores:function(t){var n=e.extend({callback:e.noop},t||{});var r=new google.maps.places.PlacesService(document.getElementById("google-places")),i;if(n.latLng){i={location:n.latLng,radius:"40234",query:"comic book stores"}}else{i={query:"comic book stores near "+n.query}}r.textSearch(i,n.callback)},getComicStore:function(t){var n=e.extend({callback:e.noop},t||{});var r=new google.maps.places.PlacesService(document.getElementById("google-places"));r.getDetails({reference:n.reference},n.callback)}};r.utils={getQueryParam:function(e){var t=window.location.href.split("?")[1],n;if(t){t="&"+t.replace(new RegExp("&"+"amp;","g"),"&");if(t.indexOf("&"+e+"=")!=-1){n=t.split("&"+e+"=")[1].split("&")[0]}}return n},loadView:function(t){var n=e.extend({isPopState:false},t||{}),i=n.view,s=n.data;if(r.data.currentView===i){e("html, body").animate({scrollTop:0},"slow")}else{r.data.currentView=i;r.utils.resetContent();r.utils.hideLoading();r.view[i]();window.scrollTo(0,0);if(window.history&&history.pushState&&!n.isPopState){history.pushState({view:i,data:s},"",window.location.href.split("?")[0]+"?view="+i+(s?"&"+s:""))}ga("send","pageview",{page:"/"+i+(s?"?"+s:"")})}},showLoading:function(){e("#content-loading").show()},hideLoading:function(){e("#content-loading").hide()},setHeadline:function(t){e("#content-headline").html(t).removeClass("hide")},resetContent:function(){e("#content-wrap").html("");r.data.currentOffset=0;r.data.isLastListPage=false},formatTime:function(e){var t=e.substring(0,2),n=e.substring(0,2);if(t==0){n="12"}else if(e.substring(0,1)==0){n=e.substring(1,2)}else if(t>12){n=n-12}return n+":"+e.substring(2)+(t>=12?"pm":"am")}};r.ui={buildPanel:function(t){var n=e.extend({type:"panel-info"},t||{});return'<div class="panel '+n.type+'">'+(n.heading?'<div class="panel-heading">'+'<h3 class="panel-title">'+n.heading+"</h3>"+"</div>":"")+(n.body?'<div class="panel-body">'+n.body+"</div>":"")+"</div>"},buildIssuesList:function(t){var n=e.extend({issuesList:[]},t||{});e.each(n.issuesList,function(){var t=new Date,n=this.store_date.split("-"),i=n[0],s=n[1],o=n[2];if(e("#content-wrap .row").length===0||e("#content-wrap .row:last .feature-col").length===3){e("#content-wrap").append('<div class="row" />')}var u=this.api_detail_url.split("/issue/")[1].split("/")[0],a=this.volume.name,f=this.issue_number,l=this.description||"",c=0,h="",p,d=function(e){var t=e.lastIndexOf(". ");if(e.lastIndexOf("? ")>t){t=e.lastIndexOf("? ")}if(e.lastIndexOf("! ")>t){t=e.lastIndexOf("! ")}e=e.substr(0,t+1);return e};e("<div>"+l+"</div>").find("p, h4").each(function(){if(!p){if(e(this).is('h4:contains("List of covers and their creators")')){p=true}else{c+=e(this).text().length;if(c>=475){var t=e(this).text().substr(0,e(this).text().length-(c-475))+" ";t=d(t);e(this).html(t);p=true}h+=e(this).wrap("<div>").parent().html()}}});e("#content-wrap .row:last").append('<div class="col-sm-4 feature-col">'+r.ui.buildPanel({heading:'<a class="view-issue" href="#" data-issue="'+u+'">'+a+(f?" #"+f:"")+"</a>",body:(this.image.small_url?'<div class="feature-image-wrap">'+'<a class="view-issue" href="#" data-issue="'+u+'">'+'<img alt="" src="'+this.image.small_url+'">'+"</a>"+"</div>":"")+"<h3>In Stores "+s+"/"+o+"/"+i+"</h3>"+'<div class="issue-desc">'+h+"</div>"+"<p>"+'<a class="btn btn-primary view-issue" href="#" data-issue="'+u+'">'+"Read more &"+"raquo;"+"</a>"+"</p>"})+"</div>")})},buildIssue:function(t){var n=e.extend({issue:{}},t||{}),i=n.issue,s=i.volume.name,o=i.issue_number,u=i.store_date.split("-"),a=u[0],f=u[1],l=u[2];e("#content-wrap").append('<div class="row">'+'<div class="col-xs-12 feature-col">'+r.ui.buildPanel({heading:s+(o?" #"+o:""),body:(i.image.medium_url?'<div class="col-md-6 feature-image-wrap">'+'<img alt="" src="'+i.image.medium_url+'">'+"</div>":"")+'<h3 class="issue-store-date">'+"In Stores "+f+"/"+l+"/"+a+"</h3>"+'<div class="issue-desc">'+(i.description||"")+"</div>"})+"</div>"+"</div>");e(".issue-desc figure, .issue-desc img, .issue-desc figcaption").remove();e(".issue-desc table").addClass("table");e(".issue-desc table th").each(function(t){if(e(this).is(':contains("Sidebar Location")')){e(this).closest("table").find("td:nth-child("+(t+1)+")").remove();e(this).remove()}});e.each(i.person_credits,function(t){e("#content-wrap .panel-body").append((t>0?"<br>":"")+'<span class="issue-credits">'+this.name+(this.role?", "+this.role:"")+"</span>")})},buildStoreLookup:function(){e("#content-wrap").append('<div class="panel panel-info">'+'<div class="panel-body">'+'<div class="pull-right" id="powered-by-google">'+'<img alt="Search Powered by Google" src="images/powered-by-google-on-white.png">'+"</div>"+'<form id="store-lookup">'+'<div class="form-group">'+'<input type="text" class="form-control" id="lookup-query" placeholder="Enter a ZIP/Postal Code">'+"</div>"+'<button type="submit" class="btn btn-default">Search</button>'+"</form>"+"</div>"+'<div class="list-group" id="store-results-list"></div>'+"</div>");var t=function(t){if(r.data.currentView==="findStore"){r.utils.hideLoading();e.each(t,function(){var t=this.name,n=this.types||[];if(t&&t!=""&&(e.inArray("store",n)>=0||e.inArray("book_store",n)>=0||e.inArray("establishment",n)>=0)){e("#store-results-list").append('<a class="list-group-item view-store" href="#" data-reference="'+this.reference+'">'+'<h4 class="list-group-item-heading">'+t+"</h4>"+'<p class="list-group-item-text">'+this.formatted_address.split(", United States")[0]+"</p>"+"</a>")}});if(e("#store-results-list .view-store").length===0){}}};if(navigator.geolocation){var n=function(e){r.utils.showLoading();r.googlePlaces.getComicStores({latLng:new google.maps.LatLng(e.coords.latitude,e.coords.longitude),callback:t})};navigator.geolocation.getCurrentPosition(n)}e("#store-lookup").submit(function(n){n.preventDefault();e("#store-results-list a").remove();var i=e("#lookup-query").val();if(i.length>0){r.utils.showLoading();r.googlePlaces.getComicStores({query:i,callback:t})}})},buildStore:function(t){var n=e.extend({place:{}},t||{}),i=n.place;if(!i){r.utils.loadView({view:"findStore"})}else{var s=i.formatted_phone_number,o=i.website,u=i.opening_hours,a=u?true:false,f,l,c=i.reviews||[],h=0,p=i.rating;if(a){f=u.open_now,l=u.periods}if(!p&&c.length>0){e.each(c,function(){if(this.rating){if(!p){p=0}h++;p+=Number(this.rating)}});p=Math.round(p/h)}e("#content-wrap").append('<div class="row">'+'<div class="col-xs-12 feature-col">'+r.ui.buildPanel({heading:i.name,body:'<p><span class="glyphicon glyphicon-pushpin"></span> '+i.formatted_address.split(", United States")[0]+"</p>"+(s?'<p><span class="glyphicon glyphicon-earphone"></span> '+s+"</p>":"")+(o?'<p><span class="glyphicon glyphicon-globe"></span> '+'<a target="_blank" href="'+o+'">'+o+"</a></p>":"")+(a?(f?'<p class="text-success">This store is open now</p>':'<p class="text-danger">This store is currently closed</p>')+"<p><strong>Hours:</strong></p>"+"<p>Monday: "+(l[1]?r.utils.formatTime(l[1].open.time)+" to "+r.utils.formatTime(l[1].close.time):"Closed")+"<br>"+"Tuesday: "+(l[2]?r.utils.formatTime(l[2].open.time)+" to "+r.utils.formatTime(l[2].close.time):"Closed")+"<br>"+"Wednesday: "+(l[3]?r.utils.formatTime(l[3].open.time)+" to "+r.utils.formatTime(l[3].close.time):"Closed")+"<br>"+"Thursday: "+(l[4]?r.utils.formatTime(l[4].open.time)+" to "+r.utils.formatTime(l[4].close.time):"Closed")+"<br>"+"Friday: "+(l[5]?r.utils.formatTime(l[5].open.time)+" to "+r.utils.formatTime(l[5].close.time):"Closed")+"<br>"+"Saturday: "+(l[6]?r.utils.formatTime(l[6].open.time)+" to "+r.utils.formatTime(l[6].close.time):"Closed")+"<br>"+"Sunday: "+(l[0]?r.utils.formatTime(l[0].open.time)+" to "+r.utils.formatTime(l[0].close.time):"Closed")+"</p>":"")+(p?'<div id="store-rating">'+"<p><strong>Rating:</strong></p>"+"</div>"+'<div id="store-reviews">'+"<p><strong>Reviews:</strong></p>"+"</div>":"")})+"</div>"+"</div>");if(p){var d=function(e){var t="";for(var n=0;n<5;n++){t+='<span class="glyphicon glyphicon-star'+(n>=e?"-empty":"")+'"></span>'}return t};e("#store-rating").append("<p>"+d(p)+"</p>");e.each(c,function(){var t=new Date(0);t.setUTCSeconds(this.time);e("#store-reviews").append('<div class="store-review-name">'+"<strong>"+this.author_name+"</strong> "+(t.getMonth()+1)+"/"+t.getDate()+"/"+t.getFullYear()+"</div>"+(this.rating?d(this.rating):"")+'<div class="store-review-text">'+"<p>"+this.text+"</p>"+"</div>")})}}}};r.view={thisWeek:function(){r.utils.setHeadline("New This Week");r.utils.showLoading();r.data.filterWeek=0;r.comicVine.getIssues({callback:function(e){if(r.data.currentView==="thisWeek"){if(r.data.isLastListPage){r.utils.hideLoading()}r.ui.buildIssuesList({issuesList:e.results})}}})},archives:function(){r.utils.setHeadline("Archives");var i="";e.each(new Array(52),function(e){var r=e+1,s=t(r),o=s.startDate;i+='<a class="list-group-item view-archive-week" href="#" data-week="'+r+'">'+'<h4 class="list-group-item-heading">'+"Week of "+n(o.getMonth())+" "+o.getDate()+", "+o.getFullYear()+"</h4>"+"</a>"});e("#content-wrap").append('<div class="panel panel-info">'+'<div class="list-group" id="archives-list">'+i+"</div>"+"</div>")},archiveWeek:function(){r.utils.setHeadline("Archives");r.utils.showLoading();r.comicVine.getIssues({callback:function(e){if(r.data.currentView==="archiveWeek"){if(r.data.isLastListPage){r.utils.hideLoading()}r.ui.buildIssuesList({issuesList:e.results})}}})},viewIssue:function(){var e=r.utils.getQueryParam("filterWeek");if(e){r.utils.setHeadline(e==="0"?"New This Week":"Archives")}r.utils.showLoading();r.comicVine.getIssue({issueId:r.data.currentIssue.issueId,callback:function(e){if(r.data.currentView==="viewIssue"){r.utils.hideLoading();r.ui.buildIssue({issue:e.results})}}})},findStore:function(){r.utils.setHeadline("Find a Comic Book Store");r.ui.buildStoreLookup()},viewStore:function(){r.utils.setHeadline("Find a Comic Book Store");r.utils.showLoading();r.googlePlaces.getComicStore({reference:r.data.currentStore.reference,callback:function(e){if(r.data.currentView==="viewStore"){r.utils.hideLoading();r.ui.buildStore({place:e})}}})}};var i=r.utils.getQueryParam("view");if(!i||!r.view[i]){r.utils.loadView({view:"thisWeek"})}else{var s=true,o;if(i==="viewIssue"){var u=r.utils.getQueryParam("filterWeek"),a=r.utils.getQueryParam("issueId");if(!a){s=false}else{r.data.currentIssue.issueId=a;o="filterWeek="+u+"&issueId="+a}}else if(i==="archiveWeek"){var u=r.utils.getQueryParam("filterWeek");if(!u||isNaN(u)||u<0){s=false}else{r.data.filterWeek=Number(u);o="filterWeek="+u}}else if(i==="viewStore"){var f=r.utils.getQueryParam("reference");if(!f){s=false}else{r.data.currentStore.reference=f;o="reference="+f}}if(!s){r.utils.loadView({view:"thisWeek"})}else{r.utils.loadView({view:i,data:o,isPopState:true})}}e(window).on("popstate",function(){if(history.state&&history.state.view&&history.state.view!=r.data.currentView){r.utils.loadView({view:history.state.view,data:history.state.data,isPopState:true})}});e(".app-nav").click(function(t){t.preventDefault();r.utils.loadView({view:e(this).data("view")})});e("#content-wrap").on("click",".view-issue",function(t){t.preventDefault();var n=e(t.target).closest("a").data("issue");r.data.currentIssue.issueId=n;r.utils.loadView({view:"viewIssue",data:"filterWeek="+r.data.filterWeek+"&issueId="+n})});e("#content-wrap").on("click",".view-archive-week",function(t){t.preventDefault();var n=e(t.target).closest("a").data("week");r.data.filterWeek=Number(n);r.utils.loadView({view:"archiveWeek",data:"filterWeek="+n})});e("#content-wrap").on("click",".view-store",function(t){t.preventDefault();r.data.currentStore.reference=e(t.target).closest(".view-store").data("reference");r.utils.loadView({view:"viewStore",data:"reference="+e(t.target).closest(".view-store").data("reference")})});e(window).scroll(function(){if(e(window).scrollTop()+e(window).height()>e(document).height()-400&&(r.data.currentView==="thisWeek"||r.data.currentView==="archiveWeek")&&!r.data.listIsLoading&&!r.data.isLastListPage){r.utils.showLoading();var t=r.data.currentView;r.comicVine.getIssues({offset:r.data.currentOffset,callback:function(e){if(r.data.currentView===t){if(r.data.isLastListPage){r.utils.hideLoading()}r.ui.buildIssuesList({issuesList:e.results})}}})}})})(jQuery)