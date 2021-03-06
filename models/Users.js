const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
		trim: true,
	},
	create: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = mongoose.model('Users', UserSchema);