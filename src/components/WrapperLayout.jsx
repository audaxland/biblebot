const WrapperLayout = ({children, className}) => {
    return (
        <div
            className={"w-[1000px] max-w-[96%] h-[94%] bg-gradient-to-tr from-stone-400/80 to-amber-200/80 " +
                " rounded-lg border border-stone-700/90 max-h-[94%]"
                + " shadow-lg shadow-amber-100/60 flex flex-col items-center justify-center mx-auto rounded-xl overflow-hidden "
                + ' ' + className}
        >
            {children}
        </div>
    );
};

export default WrapperLayout;