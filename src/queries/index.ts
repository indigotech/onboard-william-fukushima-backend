import { URLSearchParams } from "url";
import { helloWorld } from "./hello-world";
import { user } from "./user";
import { users } from "./users";

export const queries = {
  hello: helloWorld,
  user: user,
  users: users,
};
