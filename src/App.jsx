import './App.css'
import {useBibleContext} from "./store/BibleContext.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import ChatUi from "./components/ChatUi.jsx";
import RenderErrors from './components/RenderErrors.jsx';


/**
 * Renders the main application component.
 *
 * @returns {JSX.Element} The rendered application component.
 */
function App() {
    // The BibleContext fetches the vector file from the server and stores the bible data and vectors.
    const {isLoading, errors} = useBibleContext()

    return (
        <div
            className="flex flex-col items-center justify-center w-full h-screen max-w-[1000px] mx-auto"
        >
            {isLoading && (errors.length === 0) && (<LoadingScreen />)}
            {(!isLoading) && (errors.length === 0) && (<ChatUi />)}
            {(errors.length > 0) && (<RenderErrors errors={errors} />)}
        </div>
    )
}

export default App;
