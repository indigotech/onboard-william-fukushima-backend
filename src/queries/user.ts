import { createConnection, getConnection } from "typeorm";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { ValidationError, BadCredentials, NotFound } from "../errors";

export const user = async (_, args, context) => {
  return jwt.verify(
    context.authScope,
    process.env.JWT_SECRET,
    async (err, decoded) => {
      if (err) {
        throw err;
      } else {
        const user: any = (
          await getConnection().manager.find("user", { id: args.id })
        )[0];
        if (!user) {
          throw new NotFound("ID não listado.");
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          birthDate: user.birthDate,
        };
      }
    }
  );
};
