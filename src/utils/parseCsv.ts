import csv from 'csv-parser';
import fs from 'fs';
/**
 *
 * @param fileName name of the csv file to parse
 * @returns parsed csv in json
 */
export default async function <T>(filePathWithName: string): Promise<T[]> {
  const result: T[] | PromiseLike<T> = [];
  const stream = fs
    .createReadStream(filePathWithName)
    .pipe(csv())
    .on('data', (data: T) => result.push(data));

  return new Promise<T[]>((resolve, reject) => {
    stream.on('end', () => {
      return resolve(result);
    });

    stream.on('error', (err: unknown) => {
      console.error(err);
      return reject(err);
    });
  });
}
