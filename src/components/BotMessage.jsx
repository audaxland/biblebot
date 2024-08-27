import ChatMessage from "./ChatMessage.jsx";
import {BsRobot} from "react-icons/bs";

const BotMessage = ({text, book, chapter, verse}) => {
    return (
        <ChatMessage
            avatar={
                <div className={"bg-orange-100/50 p-3 rounded-full"}>
                    <BsRobot size={"2.5em"} color={"darkred"} />
                </div>
            }
            background="from-red-200/60"
        >
            <div className="">
                {text}
            </div>
            <div className="italic text-sm text-right ">
                ({book} {chapter}:{verse})
            </div>
        </ChatMessage>
    );
};

export default BotMessage;