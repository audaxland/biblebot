import {asyncBufferFromUrl, parquetRead} from "hyparquet";
import * as tf from "@tensorflow/tfjs";


export const getParquetData = async url => {
    let vectorData = null
    let format = null
    await parquetRead({
        file: await asyncBufferFromUrl(url),
        rowFormat: 'object',
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