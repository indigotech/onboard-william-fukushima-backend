import * as dotenv from "dotenv";
import { setup, shutdown } from "../server";
dotenv.config({ path: "./.env" });

import { userSeeding } from "./seeding";
(async () => {
  await setup();
  await userSeeding();
  await shutdown();
})();
