/**
 * WrapperLayout component is a box with a translucid background a slight shadow.
 * This is a wrapper used around the main content of the page. 
 * 
 * @component
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child elements to be rendered inside the wrapper.
 * @param {string} [props.className=''] - Additional CSS class name(s) for the wrapper.
 * @returns {JSX.Element} The rendered WrapperLayout component.
 */
const WrapperLayout = ({children, className = ''}) => {
    return (
        <div
            className={"w-[1000px] max-w-[96%] h-[94%] bg-gradient-to-tr from-stone-400/80 to-amber-200/80 " +
                " rounded-lg border border-stone-700/90 max-h-[94%] "
                + " shadow-lg shadow-amber-100/60 flex flex-col items-center justify-center mx-auto rounded-xl overflow-hidden "
                + ' ' + className}
        >
            {children}
        </div>
    );
};

export default WrapperLayout;