import WrapperLayout from "./WrapperLayout";
import {BarLoader} from "react-spinners";


function LoadingScreen() {
    return (
        <div className="w-[40em] ">
            <WrapperLayout className="p-10">
                <h1 className="px-5 m-6 text-6xl font-bold text-red-900 rounded-lg bg-gradient-to-b from-amber-100/5 to-white/50 ">
                    BibleBot
                </h1>
                <h2 className="m-6 text-lg italic font-bold text-center text-brown-800">
                    Ask anything... <br /> ...it responds with a verse from the Bible
                </h2>

                <p className="m-6 text-xl italic font-bold text-blue-gray-800">
                    Loading...
                </p>
                <p><BarLoader /></p>
            </WrapperLayout>
        </div>

    )
}

export default LoadingScreen;