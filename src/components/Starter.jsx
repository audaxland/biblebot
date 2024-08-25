import {useState} from "react";
import {useBibleContext} from "../store/BibleContext.jsx";

export const Starter = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);

    const {getRandomVerse} = useBibleContext();

    const onSubmit = (e) => {
        e.preventDefault();
        setMessages(old => [...old, {type: 'user', text: inputValue}, {type: 'bot', ...getRandomVerse()}]);
        setInputValue('');
    }

    return (
        <div
            className="h-screen flex flex-col items-center justify-center w-full"
        >
            <h1>BibleBot</h1>
            <div
                className='my-8 max-h-[80%] overflow-y-auto'
            >
                {messages.map(({type, text}, index) => (
                    <div
                        className="bg-stone-100 rounded-lg my-4 px-6 py-2"
                        key={index}
                    >
                        {type}: {text}
                    </div>
                ))}
            </div>
            <form
                className="flex flex-row gap-4 my-3"
                onSubmit={onSubmit}
            >
                <textarea
                    className="border border-gray-300 rounded-lg min-h-20 min-w-[40em]"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                ></textarea>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Send
                </button>
            </form>
        </div>
    )
}

export default Starter
