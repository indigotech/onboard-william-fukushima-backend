import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import { User } from "./src/entity/User";

const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  type Hello {
    hello: String
  }

  type Query {
    hello: Hello
  }

  type UserType {
    id: Int!
    name: String!
    email: String!
    password: String!
    birthDate: String!
  }

  type Mutation {
    createUser(
      name: String!
      email: String!
      password: String!
      birthDate: String!
    ): UserType!
  }
`;
const hello = [
  {
    hello: "Hello World!",
  },
];

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

const EMAIL_REGEX = /([a-z0-9])+@([a-z0-9])+.com/;
const PASSWORD_REGEX = /(?=.*[0-9])(?=.*([A-Za-z])).{7,}/;
const BIRTHDATE_REGEX =
  /(^(19|20)\d\d)[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])/;

(async function setup() {
  await createConnection();

  const resolvers = {
    Query: {
      hello: () => hello,
    },
    Mutation: {
      createUser: async (_, args) => {
        const user = new User();
        user.name = args.name;
        if (EMAIL_REGEX.test(args.email)) {
          user.email = args.email;
        } else throw new ValidationError("E-mail inválido.");
        if (PASSWORD_REGEX.test(args.password)) {
          user.password = args.password;
        } else
          throw new ValidationError(
            "Senha deve conter no mínimo 7 caracteres com pelo menos um número e uma letra."
          );
        if (BIRTHDATE_REGEX.test(args.birthDate)) {
          user.birthDate = args.birthDate;
        } else
          throw new ValidationError(
            "Data de Nascimento deve estar no formato yyyy-mm-dd"
          );
        await getConnection().manager.save(user);

        return user;
      },
    },
  };

  const server = new ApolloServer({ typeDefs, resolvers });

  server.listen().then(({ url }: any) => {
    console.log(`🚀  Server ready at ${url}`);
  });
})();
