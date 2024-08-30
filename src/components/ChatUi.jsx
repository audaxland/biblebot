import WrapperLayout from "./WrapperLayout.jsx";
import ChatInputArea from "./ChatInputArea.jsx";
import {useEffect, useRef, useState} from "react";
import BotMessage from "./BotMessage.jsx";
import UserMessage from "./UserMessage.jsx";
import {useBibleContext} from "../store/BibleContext.jsx";

/**
 * ChatUi component for displaying a chat interface.
 *
 * @returns {JSX.Element} The rendered ChatUi component.
 */
/**
 * ChatUi component.
 * 
 * @returns {JSX.Element} The rendered ChatUi component.
 */
export const ChatUi = () => {

    /**
     * @type {Array} messages - The array of message objects {type, text, ...rest} that contains the chat conversation
     */
    const [messages, setMessages] = useState([]);

    /**
     * @type {Array} history - An array of verse indices that have already been used in the conversation. 
     *                          Used to prevent returning the same verse multiple times.
     */
    const [history, setHistory] = useState([]);

    /**
     * @type {Function} getResponseFor - A function that retrieves a best verse for a given text input.
     */
    const {getBestResponses} = useBibleContext();

    
    /**
     * Handles the sending of user input and receiving bot response.
     * @param {string} input - The user input.
     * @returns {Promise<void>} 
     */
    const onSend = async input => {
        setMessages(old => [...old, {type: "user", text: input}]);
        // Get the 400 best responses for the input.
        // This number needs to be high enough to have a better chance of finding the best response,
        // as we only compare a subset of all the verses. 
        // But This also needs to be low enough to not slow down the response time too much.
        const botResponses = (await getBestResponses(input, 400)).map(i => i.content)
        // Select the best verse that has not yet been returned in the current conversation
        const selectedResponse = botResponses.find(i => !history.includes(i.verseIndex)) || botResponses[0]
        setMessages(old => [...old, {type: 'bot', ...selectedResponse}]);
        setHistory(old => [...old, selectedResponse.verseIndex]);
    }

    /**
     * @type {React.RefObject<HTMLElement>} Ref to the bottom div, used to auto-scroll to the bottom of the chat.
     */
    const bottomRef = useRef(null);

    // Auto-scroll to the bottom of the chat when new messages are added.
    useEffect(() => {
        if (messages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages])

    return (
        <WrapperLayout>
            <div
                className={"flex flex-col w-full h-full"}
            >
                {/* Chat header - with branding and "clear" button */}
                <div
                    className={
                        "bg-gradient-to-b from-yellow-700/30 to-stone-700/50 py-2 flex flex-row px-5 items-center"
                        + (messages.length > 0 ? ' justify-between ' : ' justify-center ')
                    }
                >
                    <h1 className={
                        "app-name-font text-red-900 font-bold text-lg sm:text-2xl md:text-4xl px-4 py-1 sm:py-2 " +
                        " bg-gradient-to-t from-white/50 to-amber-200/5 rounded-lg"
                    }>
                        BibleBot
                    </h1>
                    <div>
                        {(messages.length > 0) && (
                            <button
                                className={
                                    'border border-stone-600/90 py-1 px-4 rounded-lg font-bold shadow-sm shadow-stone-600' +
                                    ' bg-stone-300/50 hover:bg-stone-400 hover:shadow-stone-100 text-stone-800 '
                                }
                                onClick={e => setMessages([])}
                            >
                                Clear Chat
                            </button>
                        )}
                    </div>

                </div>
                
                {/* Chat conversation area */}
                <div className={"flex-1 px-1 sm:px-4 overflow-auto h-fit"} >
                    {/* Text to render before the user has provided the first prompt */}
                    {(messages.length === 0) && (
                        <div className={"flex flex-col w-full h-full items-center justify-center text-2xl text-center "}>
                            Ask anything.... <br />
                            ...BibleBot will respond with a verse from the Bible.
                        </div>
                    )}

                    {/* Render the conversation */}
                    {messages.map(({type, ...rest}, index) => {
                        if (type === "bot") return <BotMessage key={index} {...rest} />
                        return <UserMessage key={index} {...rest} />
                    })}

                    {/* Empty div to auto-scroll to the bottom of the chat */}
                    <div ref={bottomRef}></div>
                </div>

                {/* Chat input area */}
                <div className={"bg-gradient-to-b to-yellow-700/30 from-stone-700/50 py-2"}>
                    <ChatInputArea onSend={onSend} />
                </div>
            </div>
        </WrapperLayout>
    )
}

export default ChatUi
