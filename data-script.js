/**
 * Script that is executed when running `npm run data-script`.
 * This script generates the vectors from the original bible text file
 * and saves the result in text files inside the public/data folder.
 * Also generates a versions.json file that contains the hash of the generated files.
 */
import fs from 'fs';
import * as process from "process";
import {getFileHash, getVectors, logger, parseBibleFile} from './src/lib/data-server.js'
import * as path from "node:path";
import VectorTreeNode from "./src/lib/VectorTreeNode.js";


logger("Running the data computing script. Start time: ", (new Date()).toTimeString());
logger("This script will create a static parquet file that contains the vectors and the data \n" +
    "It only needs to be ran once, and takes about 20 minutes to execute on a i7 CPU")

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
    dataVersions.files[path.basename(parsedFilePath)] = getFileHash(parsedFilePath);
    logger('Input file parsed.');

    // computes the vectors for each verse. The vectors are computed using the Universal Sentence Encoder.
    const vectors = await getVectors({
        orderedData: inputData,
        getText: i => i.text,
        overlapFiler: (i,j) => i.book === j.book, // only include the surrounding verses in the embedding if they are from the same book.
        progressCallback: (k, item, vector) => {if (k % 1000 === 0) logger(k + " vectors encoded.");}
    });
    logger('Vectorization completed.');

    // the vectorTree will contain all the data with the corresponding vectors and the tree structure to search later
    const vectorTree = new VectorTreeNode()
    inputData.forEach((content, index) => {
        vectorTree.insert(content, vectors[index])
    });

    logger('VectorTree initialized.');

    // we optimize the tree on the server, because this takes typically 20 minutes and only needs to be done once
    vectorTree.optimize((isValidLayer, {layer,length, tryCount, maxSize}) => {
        if (isValidLayer) {
            logger(`Tree layer ${layer} optimized: (rounds: ${tryCount}, nodes: ${length}, maxSize: ${maxSize})`)
        } else if((tryCount % 5 === 0)) {
            logger(`Optimizing tree layer ${layer}: (rounds: ${tryCount}, nodes: ${length}, maxSize: ${maxSize})`)
        }
    })

    logger('VectorTree Optimized.')

    // save the vectorTree as a static  parquet file that the app will load from the browser
    await vectorTree.exportToParquet(parquetFilePath)

    logger('Parquet file created.')

    // write the versions file
    dataVersions.files[path.basename(parquetFilePath)] = getFileHash(parquetFilePath)
    fs.writeFileSync(versionsFilePath, JSON.stringify(dataVersions, null, 2));
    logger('Versions file created');

})()
