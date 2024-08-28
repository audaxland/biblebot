/**
 * JavaScript helper functions used in the browser.
 */
import {asyncBufferFromUrl, parquetRead} from "hyparquet";
import { compressors } from 'hyparquet-compressors'
import * as tf from "@tensorflow/tfjs";


/**
 * Retrieves Parquet data from the specified URL.
 * 
 * @param {string} url - The URL of the Parquet file.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of objects {item, vector} representing the Parquet data.
 */
export const getParquetData = async url => {
    let vectorData = null
    let format = null
    await parquetRead({
        file: await asyncBufferFromUrl(url),
        rowFormat: 'object',
        compressors,
        onComplete: parquetData => {
            vectorData = parquetData.map(row => {
                if (!format) {
                    format = {
                        dataFields: Object.keys(row).filter(k => k.substring(0,2) !== 'v_'),
                        vectorFields: Object.keys(row).filter(k => k.substring(0,2) === 'v_').length
                    }
                }
                return {
                    item: format.dataFields.reduce((acc, field) => ({...acc, [field]: row[field]}), {}),
                    vector: [...Array(format.vectorFields)].map((_,k) => row['v_' + k])
                }
            })
        }
    })
    return vectorData;
}


/**
 * Retrieves the index of the best vector in the given array of vectors that is most similar to the provided query.
 *
 * @param {Object} model - The model used for embedding.
 * @param {Array} vectors - The array of vectors to compare against the query.
 * @param {string} query - The query to compare against the vectors.
 * @returns {Promise<number>} The index of the best vector found in the vectors array.
 */
export const getBestVector = async (model, vectors, query) => {
    const queryVector = await model.embed(query);
    const bestVectorIndex = tf.tidy(() => {
        const vectorStack = tf.stack(vectors)
        const similaritiesResult = tf.matMul(vectorStack, queryVector.transpose())
        return parseInt(tf.argMax(similaritiesResult, 0).arraySync()[0])

    })
    queryVector.dispose()
    return bestVectorIndex;
}