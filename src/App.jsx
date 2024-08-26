import './App.css'
import Starter from "./components/Starter.jsx";
import {useBibleContext} from "./store/BibleContext.jsx";

function App() {
    const {isLoading, errors} = useBibleContext()

    return (
        <div
            className="flex flex-col justify-center items-center w-full h-screen"
        >
            {isLoading && (errors.length === 0) && (
                <div className="text-2xl font-bold text-stone-800">
                    Loading...
                </div>
            )}
            {(!isLoading) && (errors.length === 0) && (
                <Starter />
            )}
            {(errors.length > 0) && (
                <div className="text-xl font-bold text-stone-800">
                    {errors.map((error, index) => (
                        <div
                            key={index}
                            className="bg-red-100 p-4"
                        >
                            {error}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default App
