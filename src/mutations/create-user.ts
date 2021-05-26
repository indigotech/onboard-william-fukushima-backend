import { getConnection } from "typeorm";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { ValidationError } from "../errors";

const saltRounds = 10;

const EMAIL_REGEX = /([a-z0-9])+@([a-z0-9])+.com/;
const PASSWORD_REGEX = /(?=.*[0-9])(?=.*([A-Za-z])).{7,}/;
const BIRTHDATE_REGEX =
  /(^(19|20)\d\d)[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])/;

export const createUser = async (_, args, context) => {
  
  jwt.verify(context.authScope, process.env.JWT_SECRET);

  const user = new User();
  user.name = args.name;
  if (EMAIL_REGEX.test(args.email)) {
    user.email = args.email;
  } else {
    throw new ValidationError("E-mail inválido.", 400);
  }
  if (PASSWORD_REGEX.test(args.password)) {
    user.salt = await bcrypt.genSaltSync(saltRounds);
    user.password = await bcrypt.hashSync(args.password, user.salt);
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
  return getConnection().manager.save(user);
};
