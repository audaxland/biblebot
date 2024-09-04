/**
 * Renders a chat message in the section of the ui that renders the conversation.
 * This is a generic component that is used for both the user prompts and the bot responses,
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
            className={"flex gap-2 sm:gap-4 m-2 sm:m-4 text-md md:text-lg " +
                (orientation === 'left' ? ' flex-row ' : ' flex-row-reverse ')}
        >
            <div>
                <div className={"bg-orange-100/50 p-1 sm:p-3 rounded-full text-md sm:text-lg md:text-xl "}>
                    {avatar}
                </div>
            </div>
            <div
                className={"to-stone-100/80 py-2 px-3 max-w-[80%] rounded-lg border border-stone-300/90 " +
                    (orientation === 'left' ? ' bg-gradient-to-tr ' : ' bg-gradient-to-tl ')
                    + ' ' + background + ' ' + className }
            >
                {children}
            </div>
        </div>
    );
};

export default ChatMessage;
