import hljs from "highlight.js";
import { useEffect } from "react";
import "highlight.js/styles/github.css";


interface ComponentProps {
    event: Object
}

const dialogOpen = (e: any) => {
    let target = e.target as HTMLElement;
    let dialog = target.parentElement?.querySelector("dialog");
    dialog?.showModal();
    dialog?.scrollTo(0,0);
    
}

const dialogClose = (e: any) => {
    let dialog = e.target.parentElement as HTMLDialogElement;
    dialog.close();
}

const EventDetail = ({event}: ComponentProps) => {

    useEffect(() => {
        hljs.highlightAll();
      });

    return (
        <div className="event-detail-container">
            <button onClick={dialogOpen}>+</button>
            <dialog className="event-detail">
                <h3>Event Detail</h3>
                <pre dangerouslySetInnerHTML={{__html: hljs.highlight(
                        JSON.stringify(event,null," "), 
                        {language: "json"}
                    ).value}}>
                    
                </pre>
                <button onClick={dialogClose}>Close</button>
            </dialog>

        </div>
    )
}

export default EventDetail