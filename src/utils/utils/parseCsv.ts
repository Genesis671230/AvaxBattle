import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
/**
 *
 * @param fileName name of the csv file to parse
 * @returns parsed csv in json
 */
export default async function <T>(fileName: string): Promise<T[]> {
  const result: T[] | PromiseLike<T> = [];
  const stream = fs
    .createReadStream(path.join(__dirname, '../configuration', fileName))
    .pipe(csv())
    .on('data', (data: T) => result.push(data));

  return new Promise<T[]>((resolve, reject) => {
    stream.on('end', () => {
      return resolve(result);
    });

    stream.on('error', err => {
      console.error(err);
      return reject(err);
    });
  });
}
