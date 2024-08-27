import './App.css'
import {useBibleContext} from "./store/BibleContext.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import ChatUi from "./components/ChatUi.jsx";

function App() {
    const {isLoading, errors} = useBibleContext()

    return (
        <div
            className="flex flex-col justify-center items-center w-full h-screen "
        >
            {isLoading && (errors.length === 0) && (
                <LoadingScreen />
            )}
            {(!isLoading) && (errors.length === 0) && (
                <ChatUi />
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
