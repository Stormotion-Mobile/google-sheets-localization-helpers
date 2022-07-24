import { GoogleSpreadsheet } from "google-spreadsheet";
import { ResourceLanguage } from "i18next";
import fs from "fs";
import path from "path";
// @ts-ignore
import { getAndParse } from "tsv-parser";
import R from "ramda";

type TransformFunc = (translation: Translation) => object;

const DEFAULT_TRANSFORM_FUNCTION: TransformFunc = (translation) => ({
  translation,
});

export enum SyncLocalesSourceType {
  GoogleSheet = "GoogleSheet",
  Tsv = "Tsv",
}

export type SyncLocalesBaseProps = {
  localesDirectoryPath: string;
  transformOutput?: TransformFunc;
  keyColumnName?: string;
};

export type SyncLocalesProps = (
  | {
      sheetId: string;
      googleApiKey: string;
      sheetIndex: number;
      sourceType: SyncLocalesSourceType.GoogleSheet;
    }
  | {
      sourceType: SyncLocalesSourceType.Tsv;
      sourceLink: string;
    }
) &
  SyncLocalesBaseProps;

type LocaleInfo = [object, string][];

const rowsDataToLocaleInfo = ({
  keyColumnName,
  localeFilenames,
  rows,
  transformOutput,
}: {
  localeFilenames: string[];
  rows: Array<Record<string, string>>;
  keyColumnName: string;
  transformOutput: (translation: Translation) => object;
}) => {
  const localeInfo: LocaleInfo = localeFilenames.map((langCode) => {
    let translation: Translation = {};

    rows.forEach((row) => {
      if (!row[keyColumnName]) {
        throw Error("no such key in sheet");
      }
      const keys = row[keyColumnName].split(".");

      translation = R.assocPath(keys, row[langCode], translation);
    });

    const languageResource = transformOutput(translation);
    return [languageResource, langCode];
  });

  return localeInfo;
};

const writeLocaleInfoToFiles = ({
  localesDirectoryPath,
  localeInfo,
}: {
  localesDirectoryPath: string;
  localeInfo: LocaleInfo;
}) => {
  !fs.existsSync(localesDirectoryPath) &&
    fs.promises.mkdir(localesDirectoryPath).catch(console.log);

  const writeOperations = localeInfo.map(([resource, code]) =>
    fs.promises.writeFile(
      path.join(localesDirectoryPath, `${code}.json`),
      JSON.stringify(resource, null, 2),
      { encoding: "utf-8" }
    )
  );

  return Promise.all(writeOperations);
};

type Translation = object;
const syncLocales = async (props: SyncLocalesProps) => {
  const {
    sourceType,
    keyColumnName = "key",
    transformOutput = DEFAULT_TRANSFORM_FUNCTION,
    localesDirectoryPath,
  } = props;

  if (
    sourceType !== SyncLocalesSourceType.Tsv &&
    sourceType !== SyncLocalesSourceType.GoogleSheet
  ) {
    throw Error("Unknown source type. Choose either 'Tsv' or 'GoogleSheet'");
  }

  if (sourceType === SyncLocalesSourceType.Tsv) {
    getAndParse(props.sourceLink).subscribe(
      (rows: Array<Record<string, string>>) => {
        const localeFilenames = Object.keys(R.dissoc(keyColumnName, rows[0]));

        const localeInfo = rowsDataToLocaleInfo({
          keyColumnName,
          localeFilenames,
          rows,
          transformOutput,
        });

        writeLocaleInfoToFiles({ localeInfo, localesDirectoryPath }).catch(
          console.error
        );
      }
    );
    return;
  }

  const { sheetId, sheetIndex, googleApiKey } = props;

  const doc = new GoogleSpreadsheet(sheetId);
  doc.useApiKey(googleApiKey);

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[sheetIndex];
  await sheet.loadHeaderRow();

  const localeFilenames = sheet.headerValues.slice(1);

  const rows = await sheet.getRows();

  const localeInfo: [object, string][] = rowsDataToLocaleInfo({
    keyColumnName,
    localeFilenames,
    rows,
    transformOutput,
  });

  writeLocaleInfoToFiles({ localeInfo, localesDirectoryPath }).catch(
    console.error
  );
};

export default syncLocales;
