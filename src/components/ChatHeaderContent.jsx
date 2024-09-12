/**
 * Renders the content of the chat ui header.
 * @param isChatEmpty {boolean} true if there are no messages yet in the chat
 * @param clearChat {function} callback to call when clicking on the "clear" button
 * @returns {Element}
 * @constructor
 */
const ChatHeaderContent = ({isChatEmpty = true, clearChat}) => {
    return (
        <>
            <h1 className={
                "app-name-font text-red-900 font-bold text-lg sm:text-2xl md:text-4xl px-4 py-1 sm:py-2 " +
                " bg-gradient-to-t from-white/50 to-amber-200/5 rounded-lg"}
            >
                BibleBot
            </h1>
            <div>
                {(!isChatEmpty) && (
                    <button
                        className={'border border-stone-600/90 py-1 px-4 rounded-lg font-bold shadow-sm shadow-stone-600' +
                            ' bg-stone-300/50 hover:bg-stone-400 hover:shadow-stone-100 text-stone-800 '}
                        onClick={clearChat}
                    >
                        Clear Chatt
                    </button>
                )}
            </div>
        </>
    );
};

export default ChatHeaderContent;