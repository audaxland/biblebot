import fs from 'fs';
import * as encoder from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs-node';
import parquetjs from 'parquetjs';


const start_time = new Date();
export const logger = (...messages) => {
    const elapsedSeconds = (new Date() - start_time) / 1000;
    const elapsedTime = (Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')) + ':'
                             + (Math.floor(elapsedSeconds % 60).toString().padStart(2, '0'));
    console.log('###', ...messages, '### Time elapsed: ' + elapsedTime);
}

export const parseBibleFile = path => {
    const inputFile = fs.readFileSync(path, 'utf8').split('\n');
    return inputFile.map((line, verseIndex) => {
        const extract = line.match(/^([^:]+)\s+(\d+):(\d+)(.*)$/);
        if (!extract) return null;
        return {
            verseIndex: verseIndex,
            book: extract[1].trim(),
            chapter: parseInt(extract[2]),
            verse: parseInt(extract[3]),
            text: extract[4].trim()
        }
    }).filter(item => item && item.text && item.text.length > 0); // remove empty lines and invalid lines
}

export const getVectors = async ({
                               orderedData,
                               getText,
                               overlap = 1,
                               overlapFiler = null,
                               progressCallback = null
}) => {
    const model = await encoder.load();

    const vectors = [];
    for (const k in orderedData) {
        const item = orderedData[k];
        const text = getText(item)
        const textWithContext = orderedData.slice(Math.max(parseInt(k) - overlap, 0), parseInt(k) + overlap + 1)
            .filter(i => (!overlapFiler) || overlapFiler(i, item))
            .map(i => getText(i))
            .join(' ')

        const vector = await model.embed(textWithContext + '.\n\n' + text)
        const vectorArray = (vector.arraySync()[0]);
        vector.dispose()
        vectors.push(vectorArray)
        if (progressCallback) progressCallback(k, item, vectorArray);
    }
    tf.disposeVariables()
    return vectors;
}

const combineItemAndVector = (item, vector) => {
    const combinedItem = {...item}
    vector.forEach((v,index) => {combinedItem['v_' + index] = v})
    return combinedItem
}


export const writeParquetFile = async (data, vectors, filePath, progressCallback = null) => {
    try {

        const schemaDetails = Object.entries(combineItemAndVector(data[0], vectors[0]))
            .reduce((acc, [key, value]) => {
                if (key.substring(0, 2) === 'v_') acc[key] = {type: 'FLOAT', compression: 'SNAPPY'};
                else acc[key] = {type: (typeof value == 'number') ? 'INT32' : 'UTF8', compression: 'SNAPPY'}
                return acc
            }, {})
        const parquetSchema = new parquetjs.ParquetSchema(schemaDetails)

        const parquetWriter = await parquetjs.ParquetWriter.openFile(parquetSchema, filePath);
        for (const index in data) {
            const item = combineItemAndVector(data[index], vectors[index])
            await parquetWriter.appendRow(item);
            if (progressCallback) progressCallback(index, item)
        }
        await parquetWriter.close()
    } catch (e) {
        logger('parquet error: ', e)
    }

}


