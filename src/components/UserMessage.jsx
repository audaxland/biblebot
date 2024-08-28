import ChatMessage from "./ChatMessage.jsx";
import {BsPerson} from "react-icons/bs";


/**
 * UserMessage component renders a prompt from the user, with an avatar and a background color.
 * This is used in the part of the chat interface where the conversation is displayed.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.text - The text to be displayed in the chat message.
 * @returns {JSX.Element} The rendered UserMessage component.
 */
const UserMessage = ({text}) => {
    return (
        <ChatMessage
            avatar={
                <div className={"bg-orange-100/50 p-3 rounded-full"}>
                    <BsPerson size={"2em"} color={"darkblue"} />
                </div>
            }
            orientation={"right"}
            background="from-blue-200/70"
        >
            {text}
        </ChatMessage>
    );
};

export default UserMessage;