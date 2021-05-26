import { Server } from "http";
import "reflect-metadata";
import { ContainerInterface, createConnection, DbOptions, getConnection, UseContainerOptions } from "typeorm";
import { User } from "./entity/User";
import { ApolloServer, Config} from "apollo-server";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { isDefinitionNode } from "graphql";
import { ValidationError, BadCredentials, NotFound } from "./errors";
import { resolvers } from "./resolvers";
import {typeDefs} from "./schema";
import { ConnectionOptions } from "tls";
import { BaseConnectionOptions } from "typeorm/connection/BaseConnectionOptions";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    authScope: req.headers.authorization,
  }),
});

export async function setup() {
  const config: PostgresConnectionOptions = {
    type: "postgres",
    host: "localhost",
    port: Number(process.env.DB_PORT),
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

  const { url } = await server.listen();
  console.log(`🚀  Server ready at ${url}`);
}
