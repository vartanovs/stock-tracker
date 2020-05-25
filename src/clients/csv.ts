import csvParser from 'csv-parser';
import fs from 'fs';

class CSVClient {
  constructor(
    private filePath: string,
    private headers: string[],
  ) {}

  public async readCSV<T = Record<string, number | string | undefined>>() {
    const csvData: T[] = [];

    return new Promise<T[]>((resolve, reject) => {
      fs.createReadStream(this.filePath)
        .pipe(csvParser())
        .on('data', (data: T) => { csvData.push(data); })
        .on('error', (err) => reject(err))
        .on('end', () => resolve(csvData));
    });
  }

  public writeCSV<T extends Record<string, number | string | undefined>>(dataSet: T[]) {
    const writeStream = fs.createWriteStream(this.filePath);

    return new Promise((resolve, reject) => {
      try {
        writeStream.write(`${this.headers.join(',')}\n`);

        dataSet.forEach((data) => {
          const csvRow = this.headers.map((header) => data[header] ?? '').join(',');
          writeStream.write(`${csvRow}\n`);
        });

        writeStream.end();
        resolve();
      } catch (err) {
        console.error(`Unable to write CSV at ${this.filePath}`, { err }); // eslint-disable-line
        reject(err);
      }
    });
  }
}

export default CSVClient;
