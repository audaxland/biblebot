import './App.css'
import Starter from "./components/Starter.jsx";
import {useBibleContext} from "./store/BibleContext.jsx";

function App() {
    const {isLoading} = useBibleContext()
  return (
    <div
        className="flex flex-col justify-center items-center w-full h-screen"
    >
        {isLoading && (
            <div className="text-2xl font-bold text-stone-800">
                Loading...
            </div>
        )}
        {(!isLoading) && (
            <Starter />
        )}
    </div>
  )
}

export default App
