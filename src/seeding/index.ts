import * as dotenv from "dotenv";

dotenv.config({ path: "./.env" });

import {userSeeding} from "./seeding";

userSeeding();