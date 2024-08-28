import ChatMessage from "./ChatMessage.jsx";
import {BsRobot} from "react-icons/bs";

/**
 * Renders a message from the bot in the section of the ui that renders the conversation.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.text - The message text.
 * @param {string} props.book - The book name.
 * @param {number} props.chapter - The chapter number.
 * @param {number} props.verse - The verse number.
 * @returns {JSX.Element} The rendered BotMessage component.
 */
const BotMessage = ({text, book, chapter, verse}) => {
    return (
        <ChatMessage
            avatar={
                <BsRobot size={"1.5em"} color={"darkred"} />
            }
            background="from-red-200/60"
        >
            {/* render the verse */}
            <div className="">
                {text}
            </div>

            {/* render the reference */}
            <div className="text-sm italic text-right ">
                ({book} {chapter}:{verse})
            </div>
        </ChatMessage>
    );
};

export default BotMessage;