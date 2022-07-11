const mongoose = require('mongoose');

const PokemonSavedSchema = mongoose.Schema({
	pokemonID: {
		type: String,
		required: true,
		trim: true,
	},
	user: {
		type: String,
		required: true,
		trim: true,
	}
});

module.exports = mongoose.model('PokemonSaveds', PokemonSavedSchema);