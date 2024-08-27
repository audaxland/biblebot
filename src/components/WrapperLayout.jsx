const WrapperLayout = ({children, className}) => {
    return (
        <div
            className={"w-[1000px] max-w-[96%] h-[94%] bg-gradient-to-tr from-brown-200/90 to-amber-100/80 rounded-lg border border-brown-900"
                + " shadow-lg shadow-amber-100/90 flex flex-col items-center justify-center mx-auto rounded-xl "
                + ' ' + className}
        >
            {children}
        </div>
    );
};

export default WrapperLayout;