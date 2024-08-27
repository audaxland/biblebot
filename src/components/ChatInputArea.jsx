import {useState} from "react";
import {BsSendFill} from "react-icons/bs";
import {ClipLoader} from "react-spinners";

const ChatInputArea = ({onSend}) => {
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        onSend && await onSend(input);
        setInput('');
        setSending(false);
    }

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
                {sending && (<>
                    <div><ClipLoader color={"silver"} size={'2em'}/></div>
                    Sending
                </>)}
            </button>
        </form>
    );
};

export default ChatInputArea;