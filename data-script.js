/**
 * Script that is executed when running `npm run data-script`.
 * This script generates the vectors from the original bible text file
 * and saves the result in text files inside the public/data folder.
 * Also generates a versions.json file that contains the hash of the generated files.
 */
import fs from 'fs';
import * as process from "process";
import {getFileHash, getVectors, logger, parseBibleFile, writeParquetFile} from './src/lib/data-server.js'
import * as path from "node:path";


logger("Running the data computing script. Start time: ", (new Date()).toTimeString());

// absolute path to the root directory of the project
const rootDir = process.cwd();

// dataDir is where we write the generated files, these will not be commited in git.
const dataDir = rootDir + '/public/data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// bible.txt is the original file that contains the bible text, each verse is on its own line.
const inputFilePath = rootDir + '/bible.txt';

// bible.json contains the bible as an array of objects that contain the book, chapter, verse and text.
const parsedFilePath = dataDir + '/bible.json';

// bible.parquet is the parquet file that contains the bible data with the corresponding vectors.
const parquetFilePath = dataDir + '/bible.parquet';

// version file that contains the hash of the generated files.
const versionsFilePath = rootDir + '/public/versions.json';

(async () => {
    // dataVersions stores the hashes of the generated files, and its content will be written to versions.json.
    const dataVersions = {timeStamp: (new Date()).getTime(), files: {}}

    // convert the text input file in a parsed array of object {book, chapter, verse, text}
    const inputData = parseBibleFile(inputFilePath);
    fs.writeFileSync(parsedFilePath, JSON.stringify(inputData, null, 2));
    dataVersions.files[path.basename(parsedFilePath)] = getFileHash(parquetFilePath);
    logger('Input file parsed.');

    // computes the vectors for each verse. The vectors are computed using the Universal Sentence Encoder.
    const vectors = await getVectors({
        orderedData: inputData,
        getText: i => i.text,
        overlapFiler: (i,j) => i.book === j.book, // only include the surrounding verses in the embedding if they are from the same book.
        progressCallback: (k, item, vector) => {if (k % 1000 === 0) logger(k + " vectors encoded.");}
    });
    logger('Vectorization completed.');

    // write the vectors and the data to a parquet file.
    await writeParquetFile(
        inputData, 
        vectors, 
        parquetFilePath, 
        (i, item) => {if (i%10000 === 0) logger(i + ' rows written in parquet file.')}
    );
    dataVersions.files[path.basename(parquetFilePath)] = getFileHash(parquetFilePath)
    logger('Parquet file created.');

    // write the versions file
    fs.writeFileSync(versionsFilePath, JSON.stringify(dataVersions, null, 2));
    logger('Versions file created');

})()
