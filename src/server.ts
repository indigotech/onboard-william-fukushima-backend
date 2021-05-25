import { Server } from "http";
import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import { User } from "./entity/User";
import { ApolloServer} from "apollo-server";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { isDefinitionNode } from "graphql";
import { ValidationError, BadCredentials, NotFound } from "./errors";
import { resolvers } from "./resolvers";
import {typeDefs} from "./schema";


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

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      authScope: req.headers.authorization,
    }),
  });

  const admin = new User();
  admin.email = "admin@taqtile.com";
  admin.name = "admin";
  admin.birthDate = "2000-01-01";
  admin.salt = await bcrypt.genSaltSync(10);
  admin.password = await bcrypt.hashSync(process.env.ADMIN_PASS, admin.salt);
  try {
    await getConnection().manager.save(admin);
  } catch (err) {}

  const { url } = await server.listen();
  console.log(`🚀  Server ready at ${url}`);
}
