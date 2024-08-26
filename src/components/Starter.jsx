import {useState} from "react";
import {useBibleContext} from "../store/BibleContext.jsx";

export const Starter = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);

    const {getRandomVerse, getResponseFor} = useBibleContext();

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isSending) return;
        setIsSending(true);
        setMessages(old => [...old, {type: 'user', text: inputValue}]);
        const botResponse = await getResponseFor(inputValue)
        setMessages(old => [...old, {type: 'bot', ...botResponse}]);
        setInputValue('');
        setIsSending(false);
    }

    return (
        <div
            className="h-screen flex flex-col items-center justify-center w-full"
        >
            <h1>BibleBot</h1>
            <div
                className='my-8 max-h-[80%] overflow-y-auto'
            >
                {messages.map(({type, text, book, chapter, verse}, index) => (
                    <div
                        className="bg-stone-100 rounded-lg my-4 px-6 py-2"
                        key={index}
                    >
                        {type}: {text}
                        {(type === 'bot') && (
                            <div className="italic">({book} {chapter}:{verse})</div>
                        )}
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
                    disabled={isSending}
                ></textarea>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-200"
                    disabled={isSending}
                >
                    Send
                </button>
            </form>
        </div>
    )
}

export default Starter
