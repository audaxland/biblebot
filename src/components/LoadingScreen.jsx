import WrapperLayout from "./WrapperLayout";
import {BarLoader} from "react-spinners";


/**
 * Renders a loading screen component.
 * This is rendered while the app is fetching and loading the data from the server.
 *
 * @returns {JSX.Element} The loading screen component.
 */
function LoadingScreen() {
    return (
        <div className="w-[100%] sm:w-[40em] max-w-[96%]">
            <WrapperLayout className="p-2 pb-16 sm:p-10">
                <h1
                    className={"px-5 m-6 text-3xl sm:text-5xl md:text-6xl font-bold text-red-900 rounded-lg " +
                        " bg-gradient-to-b from-amber-100/5 to-white/40 app-name-font"}
                >
                    BibleBot
                </h1>
                <h2 className="m-2 text-lg italic font-bold text-center text-stone-800">
                    Ask anything... <br /> ...it responds with a verse from the Bible
                </h2>

                <p className="m-6 text-xl italic font-bold text-red-900">
                    Loading...
                </p>
                <p><BarLoader color={'maroon'} /></p>
            </WrapperLayout>
        </div>

    )
}

export default LoadingScreen;