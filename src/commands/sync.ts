import type { Arguments, CommandBuilder } from "yargs";
import syncLocales, {
  SyncLocalesBaseProps,
  SyncLocalesProps,
  SyncLocalesSourceType,
} from "../sync_locales";

type CliOptions = {
  sourceType: string;
  sheetId?: string;
  googleApiKey?: string;
  sheetIndex?: number;
  sourceLink?: string;
} & Omit<SyncLocalesBaseProps, "transformOutput">;

export const command: string = "sync";
export const desc: string =
  "A cli for mapping google sheets into a JSON format";

export const builder: CommandBuilder<CliOptions, CliOptions> = (yargs) =>
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
    },
    googleApiKey: {
      alias: "apiKey",
      type: "string",
      describe: "The API key to access the sheet",
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
    sourceLink: {
      alias: "link",
      type: "string",
      describe: "The URL to the TSV",
    },
    sourceType: {
      alias: "src",
      type: "string",
      default: "GoogleSheet",
      describe: "Either 'GoogleSheet' or 'Tsv'",
    },
  });

type ERROR_STRING = string;

const getProps = (props: CliOptions): SyncLocalesProps | ERROR_STRING => {
  const baseProps = {
    localesDirectoryPath: props.localesDirectoryPath ?? "./locales",
    keyColumnName: props.keyColumnName,
  };

  if (props.sourceType === SyncLocalesSourceType.GoogleSheet) {
    if (!props.googleApiKey) {
      return "You should specify 'googleApiKey'";
    }

    if (!props.sheetId) {
      return "You should specify 'sheetId'";
    }

    return {
      ...baseProps,
      sourceType: SyncLocalesSourceType.GoogleSheet,
      googleApiKey: props.googleApiKey,
      sheetId: props.sheetId,
      sheetIndex: props.sheetIndex ?? 0,
    };
  } else if (props.sourceType === SyncLocalesSourceType.Tsv) {
    if (!props.sourceLink) {
      return "You should specify 'src' (the URL to TSV file)";
    }

    return {
      ...baseProps,
      sourceType: SyncLocalesSourceType.Tsv,
      sourceLink: props.sourceLink,
    };
  } else {
    return "The sourceType option should be either 'GoogleSheet' or 'Tsv'";
  }
};

export const handler = (props: Arguments<CliOptions>): void => {
  const syncProps = getProps(props);

  if (typeof syncProps === "string") {
    console.log(syncProps, "\n Sync error. See the log above.");
    return;
  }

  syncLocales(syncProps)
    .then(() => {
      console.log("Syncing finished successfully");
    })
    .catch((e) => console.error(`There was an error when syncing: ${e}`));
};
