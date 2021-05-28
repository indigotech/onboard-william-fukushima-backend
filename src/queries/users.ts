import { createConnection, getRepository } from "typeorm";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import {
  ValidationError,
  BadCredentials,
  NotFound,
} from "../types-and-classes/errors";

export const users = async (_, args, context) => {
  jwt.verify(context.authScope, process.env.JWT_SECRET);
  const response = await getRepository(User).findAndCount({
    relations: ["addresses"],
    select: ["name", "email", "id", "birthDate"],
    order: {
      name: "ASC",
    },
    skip: args.offset,
    take: args.limit,
  });
  const hasPreviousPage = args.offset > 0 ? true : false;
  const hasNextPage =
    args.offset + args.limit < Number(response[1]) ? true : false;
  return {
    users: response[0],
    limit: args.limit,
    offset: args.offset,
    count: response[1],
    hasPreviousPage,
    hasNextPage,
  };
};
