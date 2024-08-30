import * as tf from '@tensorflow/tfjs';
import {asyncBufferFromUrl, parquetRead} from "hyparquet";
import {compressors} from "hyparquet-compressors";


/**
 * The LEAF_SIZE is the target number of children of each node in the tree.
 * The actual number of children will vary between LEAF_SIZE/2 and LEAF_SIZE*2.
 */
const LEAF_SIZE = 5


/**
 * The VectorTree class is used to store and search for vectors in a tree structure.
 * The original data is placed in the bottom leafs of the tree (layer 0) 
 * and grouped into "leafs" of similar vectors.
 * Each parent node contains the average vector of its children, and is grouped into similar vectors.
 * 
 * A request will get the closest vectors at each layer, starting by the top layer 
 * and progressively down searchin only through the children of the best nodes from the previous layer.
 * 
 * @class
 */
export default class VectorTree
{
    /**
     * Initialization of the VectorTree class.
     * @constructor
     */
    constructor() {
        /**
         * this.data contains the original content of each item
         * @type {Object[]}
         */
        this.data = []

        /** 
         * this.vectors contains all the vectors found in the tree
         * @type {number[][]}
         */
        this.vectors = []

        /**
         * this.tree contains the tree structure of the tree, each node has a layer number, a vector and children nodes
         * @type {Object[]}
         */
        this.tree = []

        /** 
         * The LEAF_SIZE is the target number of children of each node in the tree.
         */
        this.leafSize = LEAF_SIZE

        /**
         * The maximum number of nodes to have at the top layer
         */
        this.topLayerSize = 200
    }


    /**
     * Inserts a single item in the Tree.
     * You must provide a content that must be a JSON serializable object
     * and a vector that is a 1D array of numbers.
     *
     * @param {any} content - The content of the item to insert. This must me a JSON serializable object.
     * @param {number[]} vector - The vector associated with the content.
     * @returns {void}
     */
    insert(content, vector) {
        const vectorIndex = this.vectors.length
        const dataIndex = this.data.length
        this.data.push({ content, vectorIndex })
        const normalizedVector = tf.tidy(() => {
            const tfVector = tf.tensor(vector)
            return tfVector.div(tf.norm(tfVector)).arraySync()
        })
        this.vectors.push(normalizedVector)

        // insert into the closest leaf (on layer 0), 
        // note that no optimization (tree balancing) is performed here.
        let currentLayer = this.tree;
        while (currentLayer.length > 0 && currentLayer[0].layer > 0) {
            const bestChild = this.getBestVector(normalizedVector, currentLayer.map(l => this.vectors[l.vectorIndex]))
            currentLayer = currentLayer[bestChild].children
        }

        currentLayer.push({
            layer: 0,
            vectorIndex,
            dataIndex,
            children: []
        })
    }


    /**
     * Break down a group of vectors into random groups of size LEAF_SIZE 
     * and return the average vector from each group. 
     * 
     * @param {Object[]} group - The group of vectors to break down into random chunks
     * @returns {Array} - The average vector of each chunk
     */
    getChunkVectors(group) {
        return tf.tidy(() => {
            const vectors = [];
            const shuffledGroup = group.sort(() => Math.random() - 0.5)
            for (let i = 0; i <= shuffledGroup.length - this.leafSize; i += this.leafSize) {
                const chunk = shuffledGroup.slice(i, i + this.leafSize);
                const chunkVectors = chunk.map(node => this.vectors[node.vectorIndex]);
                const meanVector = tf.mean(tf.stack(chunkVectors), 0);
                vectors.push(meanVector.div(tf.norm(meanVector)).arraySync())
            }
            return vectors;
        })
    }


    /**
     * Returns the index of the best vector in the haystackVectors array 
     * that has the highest similarity to the needleVector.
     *
     * @param {Array<number>|tf.Tensor} needleVector - The vector to compare against the haystackVectors.
     * @param {Array<Array<number>>|tf.Tensor} haystackVectors - The array of vectors to compare the needleVector against.
     * @returns {number} - The index of the best vector in the haystackVectors array.
     */
    getBestVector(needleVector, haystackVectors) {
        return tf.tidy(() => {
            const needleTensor = Array.isArray(needleVector) ? tf.tensor(needleVector) : needleVector;
            const stack = Array.isArray(haystackVectors) ? tf.stack(haystackVectors) : haystackVectors;
            const similarities = tf.matMul(stack, tf.expandDims(needleTensor).transpose())
            return parseInt(tf.argMax(similarities, 0).arraySync()[0])
        })
    }


    /**
     * Finds the closes vector in the list vectors for each node in the list of nodes
     * and returns for each vector the list of nodes that are closest to it.
     *
     * @param {Array} vectors - The array of vectors. (These will become the vectors of the parent nodes)
     * @param {Array} nodes - The array of nodes. (These will become the children of new the parent nodes)
     * @returns {Object[][]} - The array nodes that are closest to each vector in the vectors array.
     */
    getVectorChildren(vectors, nodes) {
        return tf.tidy(() => {
            const vectorChildren = vectors.map(() => [])
            const tfVectors = tf.stack(vectors)
            for (let n of nodes) {
                const nodeVector = this.vectors[n.vectorIndex]
                vectorChildren[this.getBestVector(nodeVector, tfVectors)].push(n)
            }
            return vectorChildren
        })
    }


    /**
     * Computes the parent layer of a group of nodes from the lower layer of the tree
     * 
     * @param {Array} group - The group of nodes of the lower layer.
     * @param {Function} [progressCallback=null] - Optional callback function to track progress.
     * @returns {Array} - An array of the new parent nodes, which forms the parent layer
     */
    getParentLayer(group, progressCallback = null) {
        const parentLayerNumber = group[0].layer + 1 // the layer number of the new parent nodes
        
        // initialize the parent vectors using random chunks of nodes from the lower layer
        let parentVectors = this.getChunkVectors(group); 

        // get the list of closes nodes to each vector
        let parentChildren = this.getVectorChildren(parentVectors, group)

        // flag to indicate if the layer is balanced (each node size is between LEAF_SIZE/2 and LEAF_SIZE*2)
        let isValidLayer = false

        // Number of iteration attempts to balance the layer so far
        let tryCount = 0

        // the size of the smallest number of children in the nodes of the new parent layer
        let minSize

        // the size of the largest number of children in the nodes of the new parent layer
        let maxSize = group.length

        // the maxSize of the previous iteration (used to detect no progress)
        let lastMaxSize = group.length

        // number of iterations with no progress
        let noProgress = 0

        while (!isValidLayer) {
            // Stop trying to optimize the new layer once the new iteration does not improve the layer
            // or once we have tried more than 5 times the LEAF_SIZE
            if (maxSize < lastMaxSize) {
                lastMaxSize = maxSize
                noProgress = 0
            }
            else noProgress++
            if ((tryCount++ > this.leafSize*5) || (noProgress > this.leafSize)) {
                console.log(`Could not balance tree after ${tryCount} iterations.`,
                    `(layer: ${parentLayerNumber}, min: ${minSize}, max: ${maxSize})`);
                break;
            }

            // initialize the layer metrics
            isValidLayer = true;
            minSize = parentChildren[0].length
            maxSize = parentChildren[0].length

            // try to compute a better parent layer (with more balanced nodes)
            let newParentVectors = []
            parentVectors.forEach((vector, index) => {
                minSize = Math.min(minSize, parentChildren[index].length)
                maxSize = Math.max(maxSize, parentChildren[index].length)
                // nodes to many children are split into random chunks
                if (parentChildren[index].length > this.leafSize * 2) {
                    isValidLayer = false;
                    newParentVectors.push(...this.getChunkVectors(parentChildren[index]))
                } else if (parentChildren[index].length > Math.ceil(this.leafSize / 2)) {
                    // nodes with insufficient children are dropped
                    newParentVectors.push(vector)
                }
            })

            // recompute the children for the new parent vectors
            parentVectors = [...newParentVectors]
            parentChildren = this.getVectorChildren(parentVectors, group)

            // drop the node with too few children, again 
            // (needed because new parent vectors may have been added when splitting the larger nodes)
            parentVectors = parentVectors.filter((_, index) => (
                parentChildren[index].length > Math.ceil(this.leafSize / 2))
            )
            parentChildren = this.getVectorChildren(parentVectors, group)

            // If the progressCallback is provided, call it to allow monitoring the progress
            if (progressCallback) {
                // the distribution shows the number of children per node. 
                const distribution = parentChildren.reduce((acc, c) => {
                    acc[c.length] = (acc[c.length] || 0) + 1
                    return acc
                }, {})
                progressCallback(isValidLayer, {
                    layer: parentLayerNumber,
                    length: parentVectors.length,
                    tryCount, minSize, maxSize, distribution
                })
            }
        }

        // return the new parent nodes
        return parentVectors.map((vector, index) => {
            const vectorIndex = this.vectors.length
            this.vectors.push(vector)
            return {
                layer: parentLayerNumber,
                vectorIndex,
                children: parentChildren[index]
            }
        })
    }


    /**
     * Optimizes the vector tree.
     * This will re-compute the entire tree 
     * and try to get all nodes of have between LEAF_SIZE/2 and LEAF_SIZE*2 children
     * 
     * @param {Function} progressCallback - A callback function to track the progress of the optimization.
     */
    optimize(progressCallback) {
        // initialize to a one layer tree that contains all the data item nodes (or leafs)
        this.tree = this.data.map(({vectorIndex}, dataIndex) => ({
            layer: 0,
            vectorIndex,
            dataIndex,
            children: []
        }))

        // keep creating new layers until the top layer has less than maximum size configured
        while(this.tree.length > this.topLayerSize) {
            this.tree = this.getParentLayer(this.tree, progressCallback)
        }
    }


    /**
     * Retrieves similar items from a layer of the tree based on a given needle vector.
     * Note that we only search the subset of a layer that is formed by the selected children of the previous layer
     *
     * @param {Object[]} layer - A list of nodes from a layer of the tree to search through
     * @param {number[]} needleVector - The vector to compare against the nodes in the layer.
     * @param {number} nbResults - The number of similar items to retrieve from the provided layer subset.
     * @returns {Array} - An array of objects containing the content and similarity of the similar items.
     */
    getLayerSimilarItems(layer, needleVector, nbResults) {
        // compute the vector similarity to the needle of all the vectors from the layer param
        const similarities = tf.tidy(() => {
            const vectorStack = tf.stack(layer.map(node => this.vectors[node.vectorIndex]))
            return tf.squeeze(tf.matMul(vectorStack, tf.expandDims(needleVector).transpose())).arraySync()
        })

        // sort the nodes by descending order of similarity
        const sortedLayer = layer.map((node, index) => ({
            ...node,
            similarity: similarities[index]
        })).sort((a, b) => b.similarity - a.similarity)

        // if we are at the bottom layer, we return the top data items, along with the corresponding similarity
        if (layer[0].layer === 0) {
            return sortedLayer.slice(0, nbResults).map(({dataIndex, similarity}) => ({
                content: this.data[dataIndex].content,
                similarity
            }))
        }

        // if we are not yet at the bottom layer, 
        // only keep the top nodes to compute the subset of the next layer to search trough
        const keep = Math.max(this.leafSize, Math.floor(nbResults))
        return this.getLayerSimilarItems(
            sortedLayer.slice(0, keep).map(node => node.children).flat(),
            needleVector,
            nbResults
        )
    }


    /**
     * Retrieves similar items based on a given needle vector.
     * @param {number[]} needleVector - The needle vector to compare against.
     * @param {number|null} nbResults - The number of results to retrieve. If null, the default leaf size will be used.
     * @returns {any[]} - An array of similar items.
     */
    getSimilarItems(needleVector, nbResults = null) {
        const normalizedNeedle = tf.tidy(() => {
            let tfNeedleVector = tf.tensor(needleVector)
            if (tfNeedleVector.shape.length > 1) {
                tfNeedleVector = tf.squeeze(tfNeedleVector)
            }
            tfNeedleVector = tfNeedleVector.div(tf.norm(tfNeedleVector))
            return tfNeedleVector.arraySync()
        })
        return this.getLayerSimilarItems(this.tree, normalizedNeedle, nbResults ??  this.leafSize);
    }



    /**
     * Convert the tree into an array, this is useful to store the tree in a file of other external storage.
     * 
     * @returns {Object[]} The tree as an array.
     */
    getTreeAsArray() {
        // initialize the array with an empty array that has the correct number of items.
        // note that there is exactly as many vectors than nodes in the tree
        const treeArray = this.vectors.map(() => null)

        // instead of storing the children of each node, we store the parent of each node,
        // which is more convenient for external data storage
        // the top layer has a parent of -1, and all nodes are identified by their vectorIndex in the this.vector array
        let currentLayer = this.tree.map(item => ({parentIndex: -1, ...item}))
        while (currentLayer.length > 0) {
            currentLayer.forEach(({children, vectorIndex,  dataIndex = -1,  ...rest}) => {
                treeArray[vectorIndex] = {vectorIndex, dataIndex, ...rest}
            })
            currentLayer = currentLayer.map(({vectorIndex, children}) => {
                return children.map(child => ({parentIndex: vectorIndex, ...child}))
            }).flat()
        }
        return treeArray
    }


    /**
     * Generates a tree structure from an array of tree nodes.
     * This is used when loading the tree from an exterally stored tree
     *
     * @param {Object[]} treeArray - The array of tree nodes.
     * @returns {Object} - The generated tree structure.
     */
    getTreeFromArray(treeArray) {
        // split the data by layer number, to optimize computing the children of each node
        const layers = treeArray.reduce((acc, curr) => {
            if (!acc[curr.layer]) acc[curr.layer] = [];
            acc[curr.layer].push(curr);
            return acc;
        }, {});

        // identify the top layer
        const topLayer = Math.max(...Object.keys(layers).map(k => parseInt(k)))

        
        /**
         * Local function to compute recursively the children of node
         *
         * @param {number} parent - The parent node index.
         * @param {string} searchLayer - The layer to search through.
         * @returns {Array} - An array of nodes representing the tree layer.
         */
        const getTreeLayerForParent = (parent, searchLayer) => {
            return layers[searchLayer].filter(({parentIndex}) => parentIndex === parent)
                .map(({parentIndex, vectorIndex, dataIndex, layer}) => {
                    const node = {
                        layer,
                        vectorIndex,
                        dataIndex,
                        children: (layer === 0) ? [] : getTreeLayerForParent(vectorIndex, (parseInt(searchLayer) - 1).toString())
                    }
                    if (dataIndex < 0) delete node.dataIndex; // only include the dataIndex in the leaf nodes
                    return node;
                })
        }
        return getTreeLayerForParent(-1, topLayer.toString())
    }


    /**
     * Loads the vector tree with the given data, vectors, and tree.
     *
     * @param {Object[]} data - The data to be loaded into the vector tree.
     * @param {number[][]} vectors - The vectors to be loaded into the vector tree.
     * @param {Object[]} tree - The tree to be loaded with the data and vectors.
     */
    loadVectorTree(data, vectors, tree) {
        this.data = data
        this.vectors = vectors
        this.tree = tree
    }


    /**
     * Imports a tree from a parquet file at a specified URL.
     * Note: hyparquet only reads parquet files and does not write them, and parquetjs does not work in the browser
     * The parquet file is generated by the VectorTreeNode class, because parquetjs cannot be used in the browser
     * 
     * @param {string} url - The URL of the parquet file from which to import the tree.
     * @returns {Promise<void>} - A promise that resolves when the tree is imported.
     */
    async importTreeFromUrl (url) {
        await parquetRead({
            file: await asyncBufferFromUrl(url),
            rowFormat: 'object',
            compressors,
            onComplete: parquetData => {
                // extract dynamically the number of dimensions of the vector
                const vectorSize = Object.keys(parquetData[0])
                    .filter(k => k.substring(0,2) === 'v_')
                    .length
                
                // find the number of data items and initialize the dataArray 
                const dataArraySize = parquetData.filter(({dataIndex}) => (dataIndex > -1)).length
                const dataArray = [...Array(dataArraySize)]

                // initialize the vector array to the number of nodes in the tree
                const vectors = [...Array(parquetData.length)]

                const treeArray = []

                parquetData.forEach(({data, parentIndex, vectorIndex, dataIndex, layer, ...rest}) => {
                    // extract the data items
                    // dataIndex is the index of the item in the this.data array
                    if (dataIndex > -1) dataArray[dataIndex] = JSON.parse(data);

                    // extract the vectors
                    // vectorIndex is the index of the vector in the this.vectors array
                    vectors[vectorIndex] = ([...Array(vectorSize)].map((_,k) => rest['v_' + k]))

                    // extract the tree as an array
                    treeArray.push({parentIndex, vectorIndex, dataIndex, layer});
                })

                // convert the tree array into a tree
                const tree = this.getTreeFromArray(treeArray);

                // overwrite the instance attributes with the imported tree data
                this.loadVectorTree(dataArray, vectors, tree)
            }
        })
    }


}