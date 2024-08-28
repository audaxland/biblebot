/**
 * The BibleContext contains the bible data and vectors.
 * It handles fetching the data from the vector file 
 * and provides helper functions to retrieve the data.
 */
import {createContext, useContext, useEffect, useState} from "react";
import {getBestVector, getParquetData} from "../lib/data-client.js";
import * as encoder from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs';


// The url where the vecotr file is located.
const dataFile = '/data/bible.parquet';


/**
 * @desc The BibleContext provides the bible data and vectors.
 * @typedef {Object} BibleContext
 * @property {boolean} isLoading - True until the vector file has been fetched and loaded.
 * @property {Function} getResponseFor - A function that retrieves a best verse for a given text input.
 * @property {Array} error - An array that stores any error messages to be rendered to the UI.
 */
export const BibleContext = createContext({
    isLoading: true,
    getResponseFor: () => {},
    error: [],
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
     * @type {Array} data: array of objects {item, vector} representing the verses from the bible.
     */
    const [data, setData] = useState([])


    /**
     * @type {Object} model: the Universal Sentence Encoder model.
     */
    const [model, setModel] = useState(null)

    /**
     * @type {Array} errors: array of error messages to be rendered to the UI
     */
    const [errors, setErrors] = useState([])

    useEffect(() => {
        (async () => {
            try {
                await Promise.all([
                    (async () => {setData((await getParquetData(dataFile)))})(), // fetch the vector data file
                    (async () => {setModel((await encoder.load()))})(), // load the Universal Sentence Encoder model
                ]);
            } catch (e) {
                const errorMessage = 'Unable to read the data file. Please run `npm run data` on the server and try again.'
                setErrors(old => [...old, errorMessage])
                console.error('Error loading the data file: ', e)
            }
            setIsLoading(false)
        })();

        // the model contains tensoflow tensors that the garbage collector does not necessarily handle correctly,
        // so we need to dispose of them manually when the component is unmounted.
        return () => tf.disposeVariables();
    }, [])


    /**
     * Retrieves the response for a given query.
     * This will return the closes vector within a random subset of the data.
     * @param {string} query - The text query to get the best verse for. 
     * @returns {Promise<any>} - Returns a semi-best verse for the given query.
     */
    const getResponseFor = async query => {
        // computing the closes vector is a slow process, so we only use a random subset of the data.
        const randomDataset = data.sort((a, b) => Math.random() - 0.5).slice(0, 3000)
        const bestVector = await getBestVector(model, randomDataset.map(i => i.vector), query)
        return randomDataset[bestVector].item
    }

    return (
        <BibleContext.Provider value={{
            isLoading,
            getResponseFor,
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