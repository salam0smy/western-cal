var request = require('request');
var cheerio = require('cheerio');
var mainURL = 'http://www.westerncalendar.uwo.ca/2014/';
var timetableURL = 'http://studentservices.uwo.ca/secure/timetables/mastertt/ttindex.cfm';
var url = mainURL+'pg882.html';

var coursesLink =[];
var _ = require('underscore');



// open western calendat and get categories links
module.exports.getLinks = function(c){
	request(url, function(err, resp, body){
	if (err)
	    throw err;
		$ = cheerio.load(body, {
    normalizeWhitespace: true}
);
		$('table #_ctl0__ctl0_pageContent').children().find('.link-text').each(function(i, element){
			var coursLink = {
				name: $(this).text(),
				link: $(this).attr('href')
			}
			coursesLink.push(coursLink);
		});
		c(coursesLink);
});

};

// take the categories links and prints containing courses's informations
module.exports.getPageCoursesinfo = function(c_Links, callback){

	url_x = mainURL+c_Links.link;
	request(url_x, function(err, resp, body){
		if (err)
		    throw err;
			$ = cheerio.load(body, {
	    normalizeWhitespace: true}
	);
	var cLinks = [];
	$('.course-num').each(function(courseNum){
		var x =$(this).find('.link-text').attr('href').split('#')[1]; // get the hyperlinks to the courses in the page

		var title=[];
		$('.item-container a').filter(function(i, el){ // navigate to the hashtag hyperlink
			return $(this).attr('name') === x;
		}).parent().find('table span').each(function(el){  // find the parent of the hyperlink and get its info.. iterate on spans elements
			//if($(this).text()!=='')
				title.push($(this).text().trim());
			
		});
		// remove last three empty spans
		title.pop();
		title.pop();
		title.pop();
		cLinks.push(title);
	});
	callback(cLinks);
	
	});

}

// make a post request to western timetable service and return the body
timetableService = function(number, callBack){
	request.post(timetableURL, {
		form:{
			subject:'',
			Designation:'Any',
			catalognbr:number,
			CourseTime:'All',
			Component:'All',
			day:['m','tu','w','th','f'],
			command:'search',
			Campus:'Any'
		}}, function(err, resp, body){
			if (err)
			    console.log(err);
				callBack(body);
		});
};

// search in timetable search with given number and return useful data from the page
module.exports.loadTimetable = function loadTimetable(number, x){
	var ret = [];
	
	timetableService(number, function(body){
		$ = cheerio.load(body, {
	    	normalizeWhitespace: true}
		);
		var table =$('div .row-fluid').find('.table-striped').each(function(k){
		//	console.log(k+"-------- \n"+$(this).find('caption').text());
			var sections = {
				title: $(this).find('caption').text(),
				secs:[]
			};
			$(this).find('tbody tr').each(function(i){
				var x = [];
				//console.log($(this).text().trim());
				$(this).find('td').each(function(i){
					x.push($(this).text().trim());
				})
				
				sections.secs.push(x);
				//console.log(sections);
				
			});
			ret.push(sections);
		});
		
		x(ret);
		});
}

