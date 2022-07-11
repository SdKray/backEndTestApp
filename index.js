const { ApolloServer, gql } = require('apollo-server');
const conectarDB = require('./config/db');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('./models/Users');
const PokemonSaveds = require('./models/PokemonSaved');

const createToken = (user, secretWord, expiresIn) => {
    const { id, email } = user;
    return jwt.sign({ id, email }, secretWord, { expiresIn });
};

require('dotenv').config({ path: 'variables.env' });
conectarDB();

const typeDefs = gql`
    type User {
        id: ID
        email: String
        password: String
        create: String
    }

    type PokemonSave {
        pokemonID: ID
        user: ID
    }

    type PokemonList {
        pokemonID: ID
    }

    type Token {
        token: String
        id: ID
        email: String
    }

    input userInput {
        email: String!
        password: String!
    }

    input AuthInput {
        email: String!
        password: String!
    }

    input pokemonInput {
        pokemonID: ID!
        user: ID!
    }

    type Query {
        getMyPokemons(id: ID!): [PokemonList]
    }

    type Mutation {
        newUser(input: userInput): User
        userAuth(input: AuthInput): Token
        registerPokemon(input: pokemonInput): PokemonSave
        deletePokemon(input: pokemonInput!): String
    }
`;
//resolvers
const resolvers = {
    Query: {
        getMyPokemons: async (_, { id }) => {
            const pokemons = await PokemonSaveds.find({ user: id });
            if (!pokemons) {
                throw new Error('El producto no existe ');
            }
            return pokemons;
        },
    },
    Mutation: {
        newUser: async (_, { input }) => {
            const { email, password } = input;
            const isUserExist = await Users.findOne({ email });
            if (isUserExist) {
                throw new Error('this email is already registered in an account');
            }
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            try {
                const user = new Users(input);
                user.save();
                return user;
            } catch (error) {
                return error.message;
            }
        },
        userAuth: async (_, { input }) => {
            const { email, password } = input;

            const isUserExist = await Users.findOne({ email });
            if (!isUserExist) {
                throw new Error('Username does not exist');
            }

            const correctPassword = await bcryptjs.compare(password, isUserExist.password);
            if (!correctPassword) {
                throw new Error('The password is not correct');
            }
            //Crear el token
            return {
                token: createToken(isUserExist, process.env.SECRET_PASSWORD, '24h'),
                id: isUserExist.id,
                email: isUserExist.email,
            };
        },
        registerPokemon: async (_, { input }) => {
            const { pokemonID, user } = input;
            const isPokemonRegister = await PokemonSaveds.findOne({ pokemonID, user });
            if (isPokemonRegister) {
                throw new Error('the pokemon is registered');
            }
            try {
                const pokemonRegister = new PokemonSaveds(input);
                pokemonRegister.save();
                return pokemonRegister;
            } catch (error) {
                return error.message;
            }
        },
        deletePokemon: async (_, { input }) => {
            const { pokemonID, user } = input;

            console.log(input);
            const isDataExist = await PokemonSaveds.findOne({ pokemonID, user });
            if (!isDataExist) {
                throw new Error('pokemon not deleted');
            }
            const responseDelete =await PokemonSaveds.deleteOne({ pokemonID, user });
            console.log(responseDelete )
            return 'Pokemon deleted';
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

server.listen().then(({ url }) => {
    console.log(`Server ready in the URL ${url}`);
});
