import {createContext, useContext, useEffect, useState} from "react";
import {getBestVector, getParquetData} from "../lib/data-client.js";
import * as encoder from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs';

const dataBaseUrl = '/data/';
const bibleUrl = dataBaseUrl + 'bible.json'

export const BibleContext = createContext({
    isLoading: true,
    getRandomVerse: () => {},
    getResponseFor: () => {},
    error: [],
});

export const BibleContextProvider = ({children}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([])
    const [model, setModel] = useState(null)
    const [errors, setErrors] = useState([])

    useEffect(() => {
        (async () => {
            try {
                await Promise.all([
                    (async () => {setData((await getParquetData('/data/bible.parquet')))})(),
                    (async () => {setModel((await encoder.load()))})(),
                ]);
            } catch (e) {
                const errorMessage = 'Unable to read the data file. Please run `npm run data` on the server and try again.'
                setErrors(old => [...old, errorMessage])
            }
            setIsLoading(false)
        })();

        return () => tf.disposeVariables();
    }, [])

    const getRandomVerse = () => {
        if (!data.length) return null;
        return data[Math.floor(Math.random() * data.length)].item
    }

    const getResponseFor = async query => {
        const randomDataset = data.sort((a, b) => Math.random() - 0.5).slice(0, 1000)
        const bestVector = await getBestVector(model, randomDataset.map(i => i.vector), query)
        return randomDataset[bestVector].item
    }

    return (
        <BibleContext.Provider value={{
            isLoading,
            getRandomVerse,
            getResponseFor,
            errors
        }}>
            {children}
        </BibleContext.Provider>
    )
}

export const useBibleContext = () => {
    return useContext(BibleContext);
}