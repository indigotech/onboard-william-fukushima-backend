import { createConnection, getRepository } from "typeorm";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import {
  ValidationError,
  BadCredentials,
  NotFound,
} from "../types-and-classes/errors";

export const user = async (_, args, context) => {
  jwt.verify(context.authScope, process.env.JWT_SECRET);
  const user = await getRepository(User).findOne({ id: args.id }, {relations:["addresses"]});
  if (!user) {
    throw new NotFound("ID não listado.");
  }
  return user;
};
