import {createContext, useContext, useEffect, useState} from "react";

const dataBaseUrl = '/data/';
const bibleUrl = dataBaseUrl + 'bible.json'

export const BibleContext = createContext({
    isLoading: true,
    getRandomVerse: () => {}
});

export const BibleContextProvider = ({children}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([])

    useEffect(() => {(async () => {
        setData(await (await fetch(bibleUrl)).json())
        setIsLoading(false)
    })()}, [])

    const getRandomVerse = () => {
        if (!data.length) return null;
        return data[Math.floor(Math.random() * data.length)]
    }
    return (
        <BibleContext.Provider value={{
            isLoading,
            getRandomVerse
        }}>
            {children}
        </BibleContext.Provider>
    )
}

export const useBibleContext = () => {
    return useContext(BibleContext);
}