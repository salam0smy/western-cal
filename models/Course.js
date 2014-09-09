var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
	
var CourseSchema = new Schema({
	
	subject:{
		type: String,
		default: '',
		trim:true
	},
	number:{
		type: String,
		default: '',
		trim:true
	},
	name:{
		type: String,
		default: '',
		trim:true
	},
	description:{
		type: String,
		default: '',
		trim:true
	},
	antirequisite:{
		type: String,
		default: '',
		trim:true
	},
	prerequisite:{
		type: String,
		default: '',
		trim:true
	},
	corequisite:{
		type: String,
		default: '',
		trim:true
	},
	pre_or_corequisite:{
		type: String,
		default: '',
		trim:true
	},
	extra:{
		type: String,
		default: '',
		trim:true
	},
	title:{
		type: String
	}
		
});

// validations
CourseSchema.path('number').validate(function(number){
	return title.length;
}, 'Course Number cannot be empty');



module.exports = mongoose.model('Course', CourseSchema);