import { Server } from "http";
import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import { User } from "./src/entity/User";
import { ApolloServer, gql } from "apollo-server";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { isDefinitionNode } from "graphql";

const saltRounds = 10;

const typeDefs = gql`
  type Hello {
    hello: String
  }

  type LoginUserType {
    id: Int!
    name: String!
    email: String!
    birthDate: String!
  }
  type LoginResponse {
    user: LoginUserType!
    token: String!
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

    login(
      email: String!
      password: String!
      rememberMe: Boolean = false
    ): LoginResponse!
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

class BadCredentials extends Error {
  constructor(message) {
    super(message);
    this.code = 401;
    this.name = "BadCredentials";
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
      createUser: async (_, args, context) => {
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
            "Senha deve conter no mínimo 7 caracteres com pelo menos um número e uma letra.",
            400
          );
        }
        if (BIRTHDATE_REGEX.test(args.birthDate)) {
          user.birthDate = args.birthDate;
        } else {
          throw new ValidationError(
            "Data de Nascimento deve estar no formato yyyy-mm-dd",
            400
          );
        }

        return jwt.verify(context.authScope, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
            throw err;
          }
          else{
            return getConnection().manager.save(user);
          }
        });
      },
      login: async (_, args) => {
        if (EMAIL_REGEX.test(args.email)) {
        } else {
          throw new ValidationError("E-mail inválido.", 400);
        }
        if (PASSWORD_REGEX.test(args.password)) {
        } else {
          throw new ValidationError(
            "Senha deve conter no mínimo 7 caracteres com pelo menos um número e uma letra.",
            400
          );
        }
        const user: any = (
          await getConnection().manager.find("user", { email: args.email })
        )[0];
        var token: String = "";

        if (user) {
          const password: any = await bcrypt.hashSync(args.password, user.salt);
          if (password == user.password) {
            const expirationTime = args.rememberMe ? "2 hours" : "2 weeks";
            token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
              expiresIn: expirationTime,
            });
          } else {
            throw new BadCredentials("Credenciais inválidas.");
          }
        } else {
          throw new BadCredentials("Credenciais inválidas.");
        }
        return {
          user: user,
          token: token,
        };
      },
    },
  };

  const server = new ApolloServer({ typeDefs, resolvers, context: ({ req }) => ({
    authScope: req.headers.authorization
  }) });

  const { url } = await server.listen();
  console.log(`🚀  Server ready at ${url}`);
}
