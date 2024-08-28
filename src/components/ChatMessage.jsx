
/**
 * Renders a chat message in the section of the ui that renders the conversation.
 * This is a generic component that is used for both the user promts and the bot responses, 
 * so its options allow to customize for either user or bot messages to be rendered differently.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {JSX.Element} props.avatar - The avatar image to be rendered next to the chat message.
 * @param {ReactNode|string} props.children - The content of the chat message.
 * @param {string} [props.orientation='left'] - The orientation of the chat message vs the avatar ('left' or 'right').
 * @param {string} [props.className=''] - Additional CSS classes for the chat message.
 * @param {string} [props.background='from-amber-900/50'] - The background gradient color for the chat message, this is a tailwind class
 * @returns {JSX.Element} The rendered chat message component.
 */
const ChatMessage = ({
    avatar,
    children,
    orientation = 'left',
    className = '',
    background = "from-amber-900/50"
}) => {
    return (
        <div
            className={"flex gap-4 m-4 text-lg " +
                (orientation === 'left' ? ' flex-row ' : ' flex-row-reverse ')}
        >
            <div>{avatar}</div>
            <div
                className={"to-stone-100/80 py-2 px-3 max-w-[80%] rounded-lg border border-stone-300/90 " +
                    (orientation === 'left' ? ' bg-gradient-to-tr ' : ' bg-gradient-to-tl ')
                    + ' ' + background + ' ' + className
                }
            >
                {children}
            </div>
        </div>
    );
};

export default ChatMessage;
