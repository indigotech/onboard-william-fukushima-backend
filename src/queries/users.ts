import { createConnection, getRepository } from "typeorm";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { ValidationError, BadCredentials, NotFound } from "../types-and-classes/errors";

export const users = async (_, args, context) => {
    jwt.verify(context.authScope, process.env.JWT_SECRET);
    const users = await getRepository(User).query(
      `SELECT name, email, id, "birthDate"
      FROM public.user
      ORDER BY name
      OFFSET ` + String(args.offset) + 
      `LIMIT `+ String(args.limit)
      );
      const countAll = await getRepository(User).query(
        `SELECT COUNT(*) as count
        FROM public.user`
        );
    const hasPreviousPage = ((args.offset > 0) ? true : false);
    const hasNextPage = ( args.offset + args.limit < Number(countAll[0].count)) ? true : false;
  return {
      users: users,
      limit: args.limit,
      offset: args.offset,
      count: users.length,
      hasPreviousPage: hasPreviousPage,
      hasNextPage: hasNextPage
    };
};
