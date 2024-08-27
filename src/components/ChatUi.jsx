import WrapperLayout from "./WrapperLayout.jsx";
import ChatInputArea from "./ChatInputArea.jsx";
import {useEffect, useRef, useState} from "react";
import BotMessage from "./BotMessage.jsx";
import UserMessage from "./UserMessage.jsx";
import {useBibleContext} from "../store/BibleContext.jsx";

export const ChatUi = () => {
    const [messages, setMessages] = useState([]);
    const {getResponseFor} = useBibleContext();

    const onSend = async input => {
        setMessages(old => [...old, {type: "user", text: input}]);
        const botResponse = await getResponseFor(input)
        setMessages(old => [...old, {type: 'bot', ...botResponse}]);
    }

    const bottomRef = useRef(null);

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
                    {(messages.length === 0) && (
                        <div className={"flex flex-col w-full h-full items-center justify-center text-2xl"}>
                            Ask anything.... <br />
                            ...BibleBot will respond with a verse from the Bible.
                        </div>
                    )}
                    {messages.map(({type, ...rest}, index) => {
                        if (type === "bot") return <BotMessage key={index} {...rest} />
                        return <UserMessage key={index} {...rest} />
                    })}
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
