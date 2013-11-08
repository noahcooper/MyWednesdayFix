/* MyWednesdayFix - app.js | Version: 0.3 (08-NOV-2013) */
(function(e){"use strict";var t={};t.data={currentView:"thisWeek",currentListOffset:"0",listIsLoading:true,isLastListPage:false,currentIssue:{}};t.comicVine={getIssues:function(n){var r=e.extend({dateFilter:"current",offset:"0",callback:e.noop},n||{});t.data.listIsLoading=true;var i=new Date,s=i.getFullYear(),o=i.getMonth(),u=i.getDate(),a=i.getDay(),f=new Date(s,o,u-a),l=new Date(s,o,u+(6-a)),c=new Date(s,o,u+(7-a)),h="store_date:";if(r.dateFilter==="future"){h+=c.getFullYear()+"-"+(c.getMonth()+1)+"-"+c.getDate()+"|"+(c.getFullYear()+1)+"-"+(c.getMonth()+1)+"-"+c.getDate()}else{h+=f.getFullYear()+"-"+(f.getMonth()+1)+"-"+f.getDate()+"|"+l.getFullYear()+"-"+(l.getMonth()+1)+"-"+l.getDate()}e.ajax({dataType:"jsonp",url:"http://www.comicvine.com/api/issues/"+"?api_key=e21e187f67061d346687aeb81969a3fd2d1676fa"+"&field_list=api_detail_url,store_date,description,image,issue_number,volume"+"&filter="+h+"&sort=store_date:asc"+"&limit=24"+"&offset="+r.offset+"&format=jsonp"+"&json_callback=?",success:function(e){t.data.listIsLoading=false;t.data.currentOffset+=Number(e.number_of_page_results);if(t.data.currentOffset===Number(e.number_of_total_results)){t.data.isLastListPage=true}r.callback(e)}})},getIssue:function(t){var n=e.extend({callback:e.noop},t||{});e.ajax({dataType:"jsonp",url:"http://www.comicvine.com/api/issue/"+n.issueId+"/"+"?api_key=e21e187f67061d346687aeb81969a3fd2d1676fa"+"&field_list=store_date,description,image,issue_number,person_credits,volume"+"&format=jsonp"+"&json_callback=?",success:n.callback})}};t.utils={loadView:function(e){t.view[e]();t.data.currentView=e},showLoading:function(){e("#content-loading").show()},hideLoading:function(){e("#content-loading").hide()},setHeadline:function(t){e("#content-headline").html(t)},resetContent:function(){e("#content-wrap").html("");t.data.currentOffset=0;t.data.isLastListPage=false}};t.ui={buildIssuesList:function(t){var n=e.extend({issuesList:[]},t||{});e.each(n.issuesList,function(){var t=new Date,n=this.store_date.split("-"),r=n[0],i=n[1],s=n[2];if(e("#content-wrap .row").length===0||e("#content-wrap .row:last .feature-col").length===3){e("#content-wrap").append('<div class="row" />')}var o=this.api_detail_url.split("/issue/")[1].split("/")[0],u=this.volume.name,a=this.issue_number,f=this.description||"";f=f.split("<h4>List of covers and their creators:</h4>")[0];e("#content-wrap .row:last").append('<div class="col-sm-4 feature-col">'+'<div class="panel panel-info">'+'<div class="panel-heading">'+'<h3 class="panel-title">'+'<a class="view-issue" href="#issue='+o+'" data-issue="'+o+'">'+u+(a?" #"+a:"")+"</a>"+"</h3>"+"</div>"+'<div class="panel-body">'+(this.image.small_url?'<div class="feature-image-wrap">'+'<a href="#"><img alt="" src="'+this.image.small_url+'"></a>'+"</div>":"")+"<h3>In Stores "+i+"/"+s+"/"+r+"</h3>"+f+"<p>"+'<a class="btn btn-primary view-issue" href="#issue='+o+'" data-issue="'+o+'">'+"Read more &"+"raquo;"+"</a>"+"</p>"+"</div>"+"</div>"+"</div>")})},buildIssue:function(t){var n=e.extend({issue:{}},t||{}),r=n.issue,i=r.volume.name,s=r.issue_number,o=r.store_date.split("-"),u=o[0],a=o[1],f=o[2];e("#content-wrap").append('<div class="row">'+'<div class="col-xs-12 feature-col">'+'<div class="panel panel-info">'+'<div class="panel-heading">'+'<h3 class="panel-title">'+i+(s?" #"+s:"")+"</h3>"+"</div>"+'<div class="panel-body">'+(r.image.medium_url?'<div class="col-md-6 feature-image-wrap">'+'<a href="#"><img alt="" src="'+r.image.medium_url+'"></a>'+"</div>":"")+'<h3 class="issue-store-date">'+"In Stores "+a+"/"+f+"/"+u+"</h3>"+(r.description||"")+"</div>"+"</div>"+"</div>"+"</div>");e.each(r.person_credits,function(t){e("#content-wrap .panel-body").append((t>0?"<br>":"")+'<span class="issue-credits">'+this.name+(this.role?", "+this.role:"")+"</span>")})}};t.view={findStore:function(){t.utils.setHeadline("Find a Store");t.utils.resetContent()},thisWeek:function(){t.utils.setHeadline("New This Week");t.utils.resetContent();t.utils.showLoading();t.comicVine.getIssues({callback:function(e){t.utils.hideLoading();t.ui.buildIssuesList({issuesList:e.results})}})},comingSoon:function(){t.utils.setHeadline("Coming Soon");t.utils.resetContent();t.utils.showLoading();t.comicVine.getIssues({dateFilter:"future",callback:function(e){t.utils.hideLoading();t.ui.buildIssuesList({issuesList:e.results})}})},viewIssue:function(){t.utils.resetContent();t.utils.showLoading();t.comicVine.getIssue({issueId:t.data.currentIssue.issueId,callback:function(e){t.utils.hideLoading();t.ui.buildIssue({issue:e.results})}})}};t.view.thisWeek();e(".app-nav").click(function(){t.utils.loadView(e(this).data("view"))});e("#content-wrap").on("click",".view-issue",function(n){t.data.currentIssue.issueId=e(n.target).data("issue");t.utils.loadView("viewIssue")});e(window).scroll(function(){if(e(window).scrollTop()+e(window).height()>e(document).height()-100&&(t.data.currentView==="thisWeek"||t.data.currentView==="comingSoon")&&!t.data.listIsLoading&&!t.data.isLastListPage){t.utils.showLoading();t.comicVine.getIssues({dateFilter:t.data.currentView==="comingSoon"?"future":"current",offset:t.data.currentOffset,callback:function(e){t.utils.hideLoading();t.ui.buildIssuesList({issuesList:e.results})}})}})})(jQuery)