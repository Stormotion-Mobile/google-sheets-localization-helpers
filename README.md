# Sheet Localization Helpers

Node helpers & a CLI for syncing TSVs or Google Sheets into a JSON format for further use in localization or content management.

## Features:

- Has two source options: Google Sheets and TSVs
- Ability to customize the output format for any localization library
- Can be run both as a CLI and in a Node script
- Imaginative people can even use it as a CMS!

## Installation

```
yarn add @stormotion/google-sheets-localization-helpers
```

## Props

### Common props

Regardless of whether the source TSV of Google Sheet, there are the following props:

| Prop name            | Type                   | Required? | Default                                            | Note                                                                            |
| -------------------- | ---------------------- | --------- | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| localesDirectoryPath | string                 | true      | -                                                  | Sets the path to the folder where the localization files will be saved          |
| transformOutput      | function               | false     | A function mapping {...} into {translation: {...}} | Allows you to map the end object with localizations into any other object shape |
| keyColumnName        | string                 | false     | "key"                                              | The title of the column with the locale keys                                    |
| sourceType           | "GoogleSheet" \| "Tsv" | true      | -                                                  | Specifies the source of the sheet                                               |

<br />
<br />
### Google Sheet props

If the prop `sourceType` equals "GoogleSheet", then there are the following props:

| Prop name    | Type   | Required? | Default | Note                                                                                                                                                    |
| ------------ | ------ | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sheetId      | string | true      | -       | The id of the Google sheet. Normally, can be found in the URL                                                                                           |
| googleApiKey | string | true      | -       | The API key that allows the library to fetch the sheet data. For more info, see [the docs](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication?id=api-key) |
| sheetIndex   | number | true      | -       | The index of the sheet inside the file                                                                                                                  |

<br />
<br />
### TSV props

If the prop `sourceType` equals "Tsv", then there are the following props:

| Prop name  | Type   | Required? | Default | Note                                                                 |
| ---------- | ------ | --------- | ------- | -------------------------------------------------------------------- |
| sourceLink | string | true      | -       | The link to the TSV file. Can be anything, not only hosted by Google |

## Usage

### Google Sheet usage inside a Node script

The following is an example of how this library could be used inside a Node script.
Let's say that we want to sync this sheet:
https://docs.google.com/spreadsheets/d/1_qfMegQgGUW_udIjpPblyDYY4HGt0IwiRVmeXjmHnSE/edit#gid=0

As you can see from the URL, the `sheetId` is `1_qfMegQgGUW_udIjpPblyDYY4HGt0IwiRVmeXjmHnSE`, so that's what we give to the helper.

```ts
import { syncLocales } from "@stormotion/google-sheets-localization-helpers";
import { SyncLocalesSourceType } from "@stormotion/google-sheets-localization-helpers/build/sync_locales";
import dotenv from "dotenv";

dotenv.config();

const LOCALES_DIRECTORY_PATH = "./src/strings";

const main = () => {
  const sheetId = "1_qfMegQgGUW_udIjpPblyDYY4HGt0IwiRVmeXjmHnSE";
  const googleApiKey = process.env.GCP_API_KEY ?? "";

  syncLocales({
    sheetId,
    googleApiKey,
    sheetIndex: 0,
    localesDirectoryPath: LOCALES_DIRECTORY_PATH,
    sourceType: SyncLocalesSourceType.GoogleSheet,
    keyColumnName: "tag",
  })
    .then(() => console.log("locales were synced successfully"))
    .catch((e) => console.log(`There was an error when syncing locales: ${e}`));
};

main();
```

As a result of running the file, in the folder `./src/strings/` we get 3 files: `en.json`, `fr.json`, `sp.json` (The locales are taken from the sheet - feel free to check it out how it is structured). Here's the content of the en.json file:

```json
{
  "translation": {
    "projectName": "Helpers",
    "main": {
      "ok": "OK"
    },
    "support": {
      "contact": "Contact us"
    }
  }
}
```

### TSV usage, run as a CLI

Let's say that we publish that sheet from the above as a TSV accessible via this URL:

https://docs.google.com/spreadsheets/d/e/2PACX-1vSBY3OfUTGMEtQDy8R87FeqFZK3eVKc3l9MRs043QS7rPxCLzbSzNtjsxHv2L5UtyApQ2SWay3jchN9/pub?gid=0&single=true&output=tsv

Then, we can run the CLI as follows:

`sheet-localizer sync --src="Tsv" --sourceLink="https://docs.google.com/spreadsheets/d/e/2PACX-1vS8yRE2oE9C0Xm1EHZZtMP_0WH5Qq1L_aPj9dnRQ_L9ytum5IRqhu1MrHEoVNFbx5ccYqDY3unyDpeZ/pub?gid=0&single=true&output=tsv" --keyColumnName="tag" --path="./src/locales"`

And you get the same files as running from a Node script.

Wonder why the prop names aren't the same as in the props table above? These are aliases, feel free to check out more of them by running `sheet-localizer sync --help`

### Tips on further usage

A nice way to use this library is to create, for example, a `syncLocales.ts` file at root, and add the following line to package.json's scripts: `"localize": "ts-node syncLocales"`. Then, you can add `yarn localize` to `postinstall`, or just run it anytime you change the content of the sheet. Bingo!

## Known issues

- **"TypeError: Cannot convert undefined or null to object" at Function.keys**. Probably, you didn't pass the correct sourceLink. Check that it doesn't escape characters like `&` or `=`
