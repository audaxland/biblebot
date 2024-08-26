import fs from 'fs';
import * as process from "process";
import {getVectors, logger, parseBibleFile, writeParquetFile} from './src/lib/data-server.js'


logger("Running the data computing script. Start time: ", (new Date()).toTimeString());

const rootDir = process.cwd();

// dataDir is where we write the generated files, these will not be commited in git.
const dataDir = rootDir + '/public/data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// bible.txt is the original file that contains the bible text, each verse is on its own line.
const inputFilePath = rootDir + '/bible.txt';

const parsedFilePath = dataDir + '/bible.json';

const parquetFilePath = dataDir + '/bible.parquet';

(async () => {
    const inputData = parseBibleFile(inputFilePath);
    fs.writeFileSync(parsedFilePath, JSON.stringify(inputData, null, 2));

    logger('Input file parsed.')

    const vectors = await getVectors({
        orderedData: inputData,
        getText: i => i.text,
        overlapFiler: (i,j) => i.book === j.book,
        progressCallback: (k, item, vector) => {if (k % 1000 === 0) logger(k + " vectors encoded.");}
    })
    logger('Vectorization completed.')

    await writeParquetFile(inputData, vectors, parquetFilePath, (i, item) => {if (i%1000 === 0) logger(i + ' rows written in parquet file.')});
    logger('Parquet file created.')


})()









