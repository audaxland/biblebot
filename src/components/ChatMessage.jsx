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
                className={"to-stone-100/80 py-2 px-3 max-w-[80%] " +
                    "rounded-lg border border-stone-300/90 " +
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