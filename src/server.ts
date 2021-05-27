import { Server } from "http";
import "reflect-metadata";
import { createConnection, DbOptions } from "typeorm";
import { User } from "./entity/User";
import { ApolloServer, Config} from "apollo-server";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { ValidationError, BadCredentials, NotFound } from "./types-and-classes/errors";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { PostgresConnectionCredentialsOptions } from "typeorm/driver/postgres/PostgresConnectionCredentialsOptions";
import { formatError } from "./types-and-classes/errors";

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: formatError,
  context: ({ req }) => ({
    authScope: req.headers.authorization,
  }),
});

export async function setup() {
  const config: PostgresConnectionOptions = {
    type:"postgres",
    url: process.env.DB_URL,
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

  const { url } = await server.listen(process.env.PORT);
  console.log(`🚀  Server ready at ${url}`);
}
