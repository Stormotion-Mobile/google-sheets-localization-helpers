# google-sheets-localization-helpers

Helpers for syncing locales data from Google sheets

## Installation

```
yarn add @stormotion/google-sheets-localization-helpers
```

# Props

## Common props

Regardless of whether the source TSV of Google Sheet, there are the following props:

| Prop name            | Type                   | Required? | Default                                            | Note                                                                            |
| -------------------- | ---------------------- | --------- | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| localesDirectoryPath | string                 | true      | -                                                  | Sets the path to the folder where the localization files will be saved          |
| transformOutput      | function               | false     | A function mapping {...} into {translation: {...}} | Allows you to map the end object with localizations into any other object shape |
| keyColumnName        | string                 | false     | "key"                                              | The title of the column with the locale keys                                    |
| sourceType           | "GoogleSheet" \| "Tsv" | true      | -                                                  | Specifies the source of the sheet                                               |

<br />
<br />
If the prop `sourceType` equals "GoogleSheet", then there are the following props:

| Prop name    | Type   | Required? | Default | Note                                                                                                                                                    |
| ------------ | ------ | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sheetId      | string | true      | -       | The id of the Google sheet. Normally, can be found in the URL                                                                                           |
| googleApiKey | string | true      | -       | The API key that allows the library to fetch the sheet data. For more info, see [the docs](https://developers.google.com/sheets/api/guides/authorizing) |
| sheetIndex   | number | true      | -       | The index of the sheet inside the file                                                                                                                  |

<br />
<br />
If the prop `sourceType` equals "Tsv", then there are the following props:

| Prop name  | Type   | Required? | Default | Note                                                                 |
| ---------- | ------ | --------- | ------- | -------------------------------------------------------------------- |
| sourceLink | string | true      | -       | The link to the TSV file. Can be anything, not only hosted by Google |
