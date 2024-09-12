/**
 * The BibleContext contains the bible data and vectors.
 * It handles fetching the data from the vector file 
 * and provides helper functions to retrieve the data.
 */
import {createContext, useContext, useEffect, useState} from "react";
import * as encoder from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs';
import VectorTree from "../lib/VectorTree.js";


// The url where the vector file is located.
const dataFile = '/data/bible.parquet';


/**
 * @desc The BibleContext provides the bible data and vectors.
 * @typedef {Object} BibleContext
 * @property {boolean} isLoading - True until the vector file has been fetched and loaded.
 * @property {Function} getBestResponses - A function that retrieves the top best verses for a given text input.
 * @property {Array} error - An array that stores any error messages to be rendered to the UI.
 */
export const BibleContext = createContext({
    isLoading: true,
    getBestResponses: async () => {},
    errors: [],
});


/**
 * BibleContextProvider component.
 * 
 * @component
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child components.
 * @returns {ReactNode} The rendered component.
 */
export const BibleContextProvider = ({children}) => {
    /**
     * @type {boolean} isLoading: state for loading indicator.
     */
    const [isLoading, setIsLoading] = useState(true);

    /**
     * @type {VectorTree} vectorTree: the vector tree containing the bible data and all the vector logic
     */
    const [vectorTree, setVectorTree] = useState(null);

    /**
     * @type {Object} model: the Universal Sentence Encoder model.
     */
    const [model, setModel] = useState(null)

    /**
     * @type {Array} errors: array of error messages to be rendered to the UI
     */
    const [errors, setErrors] = useState([])

    /** Fetch and load the vector file from the server, and load the model */
    useEffect(() => {
        (async () => {
            setIsLoading(true)
            const vectorTreeInstance = new VectorTree();
            setVectorTree(vectorTreeInstance)
            try {
                await Promise.all([
                    (async () => {await vectorTreeInstance.importTreeFromUrl(dataFile)})(),
                    (async () => {setModel((await encoder.load()))})(), // load the Universal Sentence Encoder model
                ]);
            } catch (e) {
                const errorMessage = 'Unable to read the data file. Please run `npm run data` on the server and try again.'
                setErrors(old => [...old, errorMessage])
                console.error('Error loading the data file: ', e)
            }
            setTimeout(() => setIsLoading(false), 1000)
        })();

        // the model contains tensorflow tensors that the garbage collector does not necessarily handle correctly,
        // so we need to dispose of them manually when the component is unmounted.
        return () => tf.disposeVariables();
    }, [])


    /**
     * getBestResponses() - Retrieve the responses with the closes vectors to the query.
     * @param query {string} : the text input for which to retrieve the best responses
     * @param nbResults {number} : the number of results to return
     * @returns
     */
    const getBestResponses = async (query, nbResults = null) => {
        const queryVector = await model.embed(query);
        const results = vectorTree.getSimilarItems(queryVector.arraySync(), nbResults)
        queryVector.dispose()
        return results
    }

    return (
        <BibleContext.Provider value={{
            isLoading,
            getBestResponses,
            errors
        }}>
            {children}
        </BibleContext.Provider>
    )
}


/**
 * Custom hook that provides access to the BibleContext.
 * @returns {BibleContext} The BibleContext object.
 */
export const useBibleContext = () => {
    return useContext(BibleContext);
}