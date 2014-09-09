var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
	
	var ClassSchema = new Schema({
		days: [String],
		startT: String, 
		endT: String,
		location: String,
		instructor: String,
		notes: String,
		section: String,
		component: String,
		classNbr: Number
	});
	
	var SectionSchema = new Schema({
		title: String,
		
		classes: [ClassSchema]
	});
	
SectionSchema.methods.addClass = function(clss){
		this.classes.push(clss);
}

module.exports.Section = mongoose.model('Section', SectionSchema);


ClassSchema.methods.addDay = function(day){
	this.days.push(day);
}

module.exports.Class= mongoose.model('Class', ClassSchema);