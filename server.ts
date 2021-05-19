import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./src/entity/User";

const { ApolloServer, gql } = require("apollo-server");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  type Hello {
    hello: String
  }

  type Query {
    hello: Hello
  }

  type UserType {
    id: Int!,
    name: String!,
    email: String!,
    password: String!,
    birthDate: String!
  }

  type Mutation {
    createUser(
        name: String!,
        email: String!,
        password: String!,
        birthDate: String! 
        ): UserType!
        
  }

`;
const hello = [
  {
    hello: "Hello World!",
  },
];
// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    hello : () => hello,
  },
  Mutation: {
    createUser: ( _, args ) => createConnection().then(async connection => {

      console.log("Inserting a new user into the database...");
      const user = new User();
      user.name = args.name;
      user.email = args.email;
      user.password = args.password;
      user.birthDate = args.birthDate;
      await connection.manager.save(user);
      console.log("Saved a new user with id: " + user.id);
  
      console.log("Loading users from the database...");
      const users = await connection.manager.find(User);
      console.log("Loaded users: ", users);
      connection.close();
      return user;
    })
  }
};
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }: any) => {
  console.log(`🚀  Server ready at ${url}`);
});
