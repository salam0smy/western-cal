var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
	

	var CoursesScheduleListSchema = new Schema({
		list:{},
	});
	


module.exports = mongoose.model('CoursesScheduleList', CoursesScheduleListSchema);