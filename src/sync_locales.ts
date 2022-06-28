import { GoogleSpreadsheet } from "google-spreadsheet";
import { ResourceLanguage } from "i18next";
import fs from "fs";
import path from "path";

export type SyncLocalesProps = {
  keyColumnName?: string;
  sheetId: string;
  googleApiKey: string;
  sheetIndex: number;
  localesDirectoryPath: string;
};

type Translation = { [section: string]: { [key: string]: string | undefined } };

const syncLocales = async ({
  keyColumnName = "key",
  sheetId,
  googleApiKey,
  sheetIndex,
  localesDirectoryPath,
}: SyncLocalesProps) => {
  const doc = new GoogleSpreadsheet(sheetId);
  doc.useApiKey(googleApiKey);

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[sheetIndex];
  await sheet.loadHeaderRow();

  const localeFilenames = sheet.headerValues.slice(1);

  const rows = await sheet.getRows();

  const localeInfo: [ResourceLanguage, string][] = localeFilenames.map(
    (langCode) => {
      const translation: Translation = {};
      rows.forEach((row) => {
        const [section, key] = String(row[keyColumnName]).split(".", 2);

        translation[section] = {
          ...translation[section],
          [key]: row[langCode] || undefined,
        };
      });
      const languageResource: ResourceLanguage = {
        translation,
      };

      return [languageResource, langCode];
    }
  );

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

export default syncLocales;
