import ChatMessage from "./ChatMessage.jsx";
import {BsPerson} from "react-icons/bs";

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