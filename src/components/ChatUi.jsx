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
     * @type {Function} getResponseFor - A function that retrieves a best verse for a given text input.
     */
    const {getResponseFor} = useBibleContext();

    
    /**
     * Handles the sending of user input and receiving bot response.
     * @param {string} input - The user input.
     * @returns {Promise<void>} 
     */
    const onSend = async input => {
        setMessages(old => [...old, {type: "user", text: input}]);
        const botResponse = await getResponseFor(input)
        setMessages(old => [...old, {type: 'bot', ...botResponse}]);
    }

    /**
     * @type {React.RefObject<HTMLElement>} Ref to the bottom div, used to auto-scroll to the bottom of the chat.
     */
    const bottomRef = useRef(null);

    // Auto-scroll to the bottom of the chat when new messages are added.
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages])

    return (
        <WrapperLayout>
            <div
                className={"flex flex-col w-full h-full"}
            >
                <div className={"bg-gradient-to-b from-yellow-700/30 to-stone-700/50 py-2"}>
                    <h1>BibleBot</h1>
                </div>

                <div className={"flex-1 px-4 overflow-auto h-fit"} >
                    {/* Text to render before the user has provided the first prompt */}
                    {(messages.length === 0) && (
                        <div className={"flex flex-col w-full h-full items-center justify-center text-2xl"}>
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

                <div className={"bg-gradient-to-b to-yellow-700/30 from-stone-700/50 py-2"}>
                    <ChatInputArea onSend={onSend} />
                </div>
            </div>
        </WrapperLayout>
    )
}

export default ChatUi
