/**
 * JavaScript helper functions used on the server when running the `npm run data` command.
 */
import fs from 'fs';
import * as encoder from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs-node';
import crypto from "crypto";


/**
 * Start time used by the logger() function to display the time elapsed at different stages of the script.
 * @type {Date}
 */
const start_time = new Date();


/**
 * Logs the given messages to the console along with the elapsed time since the script started.
 * 
 * @param {...any} messages - The messages to be logged.
 * @returns {void}
 */
export const logger = (...messages) => {
    const elapsedSeconds = (new Date() - start_time) / 1000;
    const elapsedTime = (Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')) + ':'
                             + (Math.floor(elapsedSeconds % 60).toString().padStart(2, '0'));
    console.log('###', ...messages, '### Time elapsed: ' + elapsedTime);
}


/**
 * Parses a Bible text file and extracts the book, chapter, verse and text for each verse into an array of objects.
 *
 * @param {string} path - The path to the Bible file.
 * @returns {Array<Object>} - An array of verse objects containing the {verseIndex, book, chapter, verse, text}.
 */
export const parseBibleFile = path => {
    const inputFile = fs.readFileSync(path, 'utf8').split('\n');
    return inputFile.map((line, verseIndex) => {
        const extract = line.match(/^([^:]+)\s+(\d+):(\d+)(.*)$/);
        if (!extract) return null; // skip invalid lines
        return {
            verseIndex: verseIndex,
            book: extract[1].trim(),
            chapter: parseInt(extract[2]),
            verse: parseInt(extract[3]),
            text: extract[4].trim()
        }
    }).filter(item => item && item.text && item.text.length > 0); // remove empty lines and invalid lines
}


/**
 * Generate the vector embeddings for the given list of data objects and returns the vectors as an array.
 * The provided list of objects must be presented in the correct oder for the overlapping to work correctly,
 * as each embedding will include the text from the previous and following items to provide context for the embedding.
 * 
 * @param {Object} obj - The parameter is deconstructed into the following:
 * @param {Array} obj.orderedData - A list of objects containing the data to embed.
 * @param {Function} obj.getText - The function to convert an item to the text that will be embedded
 * @param {number} [obj.overlap=1] - The number of overlapping items before and after the item to include in the embedding.
 * @param {Function} [obj.overlapFiler=null] - A callback function that allows to filter out items from the overlapping phase.
 * @param {Function} [obj.progressCallback=null] - A callback function to monitor the progress of the embedding.
 * @returns {Promise<Array>} The array of vectors.
 */
export const getVectors = async ({
    orderedData,
    getText,
    overlap = 1,
    overlapFiler = null,
    progressCallback = null
}) => {
    // The Universal Sentence Encoder model
    const model = await encoder.load();

    const vectors = [];

    for (const k in orderedData) {
        const item = orderedData[k];
        
        // convert the object to text
        const text = getText(item)

        // add previous and following items to the text to provide context for the embedding
        const textWithContext = orderedData.slice(Math.max(parseInt(k) - overlap, 0), parseInt(k) + overlap + 1)
            .filter(i => (!overlapFiler) || overlapFiler(i, item))
            .map(i => getText(i))
            .join(' ')

        // embed the text, here we duplicate the items' text to provide more weight to the current item than to the surrounding context
        const vector = await model.embed(textWithContext + '.\n\n' + text)

        // convert from tensor to javascript array
        const vectorArray = (vector.arraySync()[0]);

        // garbage collection is not always automatic for tf tensors, so we need to dispose the tensor manually.
        vector.dispose()

        vectors.push(vectorArray)
        
        // the progress callback can be used to monitor the progress of the embedding
        if (progressCallback) progressCallback(k, item, vectorArray);
    }

    // the model contains tensorflow vectors that need to be disposed manually, which is done here.
    tf.disposeVariables()

    return vectors;
}

/**
 * Calculates the SHA256 hash of a file.
 *
 * @param {string} filePath - The path to the file.
 * @returns {Object} - An object containing the SHA256 hash.
 */
export const getFileHash = filePath => {
    const fileContent = fs.readFileSync(filePath);
    let sha256 = crypto.createHash('sha256');
    sha256.update(fileContent);
    const sha256hex = sha256.digest('hex')
    return {sha256hex};
}

