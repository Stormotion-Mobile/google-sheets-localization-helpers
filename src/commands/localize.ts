import type { Arguments, CommandBuilder } from "yargs";
import syncLocales, { SyncLocalesProps } from "../sync_locales";

type Options = SyncLocalesProps;

export const command: string = "localize";
export const desc: string =
  "A cli for mapping google sheets into a JSON format";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    keyColumnName: {
      type: "string",
      alias: "keyCol",
      describe:
        "Specify the value of the key column title (the value of the first row)",
      default: "key",
    },
    sheetId: {
      type: "string",
      alias: "id",
      describe: "The ID of the sheet. Normally found in the URL",
      demandOption: true,
    },
    googleApiKey: {
      alias: "apiKey",
      type: "string",
      describe: "The API key to access the sheet",
      demandOption: true,
    },
    sheetIndex: {
      alias: "index",
      type: "number",
      describe: "The index of the sheet with localizations inside the file",
      default: 0,
    },
    localesDirectoryPath: {
      alias: "path",
      type: "string",
      default: "./locales",
      describe: "The path to the output folder",
    },
  });

export const handler = (props: Arguments<Options>): void => {
  syncLocales(props)
    .then(() => {
      console.log("syncing finished successfully");
    })
    .catch((e) => console.error(`There was an error when syncing: ${e}`));
};
