import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BibleContextProvider} from "./store/BibleContext.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BibleContextProvider>
            <App />
        </BibleContextProvider>
    </StrictMode>,
)
