// we import tfjs-node here to force the use of the node version of tensorflow on the server,
// because it provides much better performance when running on node
import * as tf from '@tensorflow/tfjs-node';

import VectorTree from "./VectorTree.js";
import parquetjs from "parquetjs";

/**
 * The VectorTreeNode class extends the VectorTree class
 * This is a separate class for the server side because the parquetjs library does not work on the browser 
 * and causes the bundler to crash. 
 * And the hyparquet library used in the browser only reads parquet files and does not write them.
 */
export default class VectorTreeNode extends VectorTree
{
    
    /**
     * Exports the tree data to a Parquet file.
     * 
     * @param {string} filePath - The file path where the Parquet file will be saved.
     * @returns {Promise<void>} - A promise that resolves when the export is complete.
     */
    async exportToParquet (filePath) {
        // the compression type used for the parquet file, here Gzip seems to give the best results
        const compression = 'GZIP'

        // convert the tree to an array, (compute node parents and drop children lists)
        const treeArray = this.getTreeAsArray()

        // create the parquet schema, with all the data for each node in a flat object
        const schema = new parquetjs.ParquetSchema({
            // add the fields from the tree nodes
            ...Object.keys(treeArray[0])
                .reduce((acc,field) => ({...acc, [field]: {type: 'INT32', compression}}), {}),
            // add the vector as a fields prefixed with 'v_'
            ...Object.keys(this.vectors[0])
                .reduce((acc, field) => ({...acc, ['v_' + field]: {type: 'FLOAT', compression}}), {}),
            // add the original data provided by the consumer of the class as a JSON string
            data: {type: 'UTF8', compression}
        })

        // write the file to the disk
        const writer = await parquetjs.ParquetWriter.openFile(schema, filePath);
        for (const i in treeArray) {
            const row = {...treeArray[i]}
            Object.entries(this.vectors[i]).forEach(([key, value]) => {
                row['v_' + key] = value
            })
            row.data = row.dataIndex < 0 ? '' : JSON.stringify(this.data[row.dataIndex])
            await writer.appendRow(row)
        }
        await writer.close();
    }
}