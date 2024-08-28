import { useEffect } from "react";
import {useState, useRef} from "react";
import {BsSendFill} from "react-icons/bs";
import {ClipLoader} from "react-spinners";

/**
 * ChatInputArea component.
 * 
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onSend - The function to be called when sending a message.
 * @returns {JSX.Element} The rendered ChatInputArea component.
 */
const ChatInputArea = ({onSend}) => {
    /**
     * @type {string} input - The user input in the texarea.
     */
    const [input, setInput] = useState('');

    /**
     * @type {boolean} sending - A flag to indicate if the message is being sent.
     */
    const [sending, setSending] = useState(false);

    /**
     * @type {React.RefObject<HTMLTextAreaElement>} inputRef - Ref to the input textarea, used to set the focus on the input.
     */
    const inputRef = useRef(null);

    
    /**
     * Handles the form submission event.
     * @param {Event} e - The form submission event.
     * @returns {Promise<void>}
     */
    const onSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        // the onSend function handles the submission at the parent level.
        onSend && await onSend(input);
        setInput('');
        setSending(false);        
    }

    /**
     * Focus on the input textarea when finished handling the previous prompt.
     */
    useEffect(() => {
        if ((!sending) && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
                console.log('focus');
            }, 100);
        }
    }, [sending])

    return (
        <form
            className={"flex flex-row gap-4 px-5 py-2"}
            onSubmit={onSubmit}
        >
            <textarea
                className={"flex-1 px-4 py-2 rounded-lg min-h-20 text-lg bg-white/80" +
                    " disabled:text-stone-500"}
                onChange={e=>setInput(e.target.value)}
                onKeyUp={e=> e.key === 'Enter' && onSubmit(e)}
                disabled={sending}
                value={input}
                placeholder="Ask anything..."
                ref={inputRef}
            ></textarea>
            <button
                className={"bg-gradient-to-tr from-indigo-500 to-blue-600  text-white relative " +
                    " flex flex-col items-center justify-center font-bold min-w-24" +
                    " hover:bg-gradient-to-bl hover:-top-0.5 hover:border-white/70 " +
                    " disabled:to-stone-600 disabled:from-slate-500 disabled:border-0 disabled:text-stone-300 "
                }
                disabled={sending}
            >
                {sending || (<>
                    <BsSendFill size={"2em"} />
                    Send
                </>)}

                {/* spinner to render while handing the submitted prompt */}
                {sending && (<>
                    <div><ClipLoader color={"silver"} size={'2em'}/></div>
                    Sending
                </>)}
            </button>
        </form>
    );
};

export default ChatInputArea;
