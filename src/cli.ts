#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .scriptName("sheet-localizer")
  .commandDir("commands")
  .strict()
  .alias({ h: "help" }).argv;
