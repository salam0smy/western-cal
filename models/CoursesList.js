var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
	
	var CoursesListSchema = new Schema({
		title:String,
		link:String
	});
	


module.exports = mongoose.model('CoursesList', CoursesListSchema);