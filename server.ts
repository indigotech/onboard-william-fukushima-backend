import { Server } from "http";
import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import { User } from "./src/entity/User";
import { ApolloServer, gql } from "apollo-server";
import * as bcrypt from "bcrypt";

const saltRounds = 10;

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
    salt: String!
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
const hello = {
  hello: "Hello World!",
};

class ValidationError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "ValidationError";
  }
  code = 0;
}

const EMAIL_REGEX = /([a-z0-9])+@([a-z0-9])+.com/;
const PASSWORD_REGEX = /(?=.*[0-9])(?=.*([A-Za-z])).{7,}/;
const BIRTHDATE_REGEX =
  /(^(19|20)\d\d)[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])/;

export async function setup() {
  const config: any = {
    type: "postgres",
    host: "localhost",
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber",
    },
  };

  await createConnection(config);

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
        } else {
          throw new ValidationError("E-mail inválido.", 400);
        }
        if (PASSWORD_REGEX.test(args.password)) {
          user.salt = bcrypt.genSaltSync(saltRounds);
          user.password = bcrypt.hashSync(args.password, user.salt);
        } else {
          throw new ValidationError(
            "Senha deve conter no mínimo 7 caracteres com pelo menos um número e uma letra.", 400
          );
        }
        if (BIRTHDATE_REGEX.test(args.birthDate)) {
          user.birthDate = args.birthDate;
        } else {
          throw new ValidationError(
            "Data de Nascimento deve estar no formato yyyy-mm-dd", 400
          );
        }
        return getConnection().manager.save(user);
      },
    },
  };

  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await server.listen();
  console.log(`🚀  Server ready at ${url}`);
}
