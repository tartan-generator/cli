#! /usr/bin/env node

import { createTartan } from "./program.js";

await createTartan().parseAsync(process.argv.slice(2));
