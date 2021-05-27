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
      LIMIT `+ String(args.limit)
      );
      const countAll = await getRepository(User).query(
        `SELECT COUNT(*) as count
        FROM public.user`
        );
    const hasPreviousPage = (args.offset !== 0);
    const hasNextPage = (args.offset + args.limit <= countAll.count);
  return {
      users: users,
      limit: args.limit,
      offset: args.offset,
      count: users.length,
      hasPreviousPage: hasPreviousPage,
      hasNextPage: hasNextPage
    };
};
