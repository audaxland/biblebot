import WrapperLayout from "./WrapperLayout.jsx";

/**
 * Renders a list of errors.
 * This is used when the app is unable to load the bible data or the vectors.
 * 
 * @component
 * @param {Object} props - The component props.
 * @param {Array} props.errors - The array of errors to render.
 * @returns {JSX.Element} The rendered component.
 */
const RenderErrors = ({errors = []}) => {
    return (

        <WrapperLayout className="overflow-hidden text-xl font-bold border-red-900 rounded-lg text-stone-800">
            <h1>Sorry... we are having some issues: </h1>
            {errors.map((error, index) => (
                <div
                    key={index}
                    className="p-4 m-2 bg-red-100"
                >
                    {error}
                </div>
            ))}
        </WrapperLayout>
    );
};

export default RenderErrors;
