import fs from 'fs';
import * as process from "process";
import {logger, parseBibleFile} from './src/lib/data-lib.js'

logger("Running the data computing script. Start time: ", (new Date()).toTimeString());

const rootDir = process.cwd();

// dataDir is where we write the generated files, these will not be commited in git.
const dataDir = rootDir + '/public/data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// bible.txt is the original file that contains the bible text, each verse is on its own line.
const inputFilePath = rootDir + '/bible.txt'

const parsedFilePath = dataDir + '/bible.json'

const inputData = parseBibleFile(inputFilePath);
fs.writeFileSync(parsedFilePath, JSON.stringify(inputData, null, 2));

logger('Input file parsed.')










