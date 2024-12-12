import { Event } from "./types";
import { useState } from "react";

interface ComponentProps {
    event: Event,
    flagEvent: Function
}

export default function FlagBox({ event, flagEvent }: ComponentProps) {

    // Stupid, stupid hack to get the 
    // Component to re-render
    let [val,setState] = useState(true);

    return (
        <input
            type="checkbox"
            checked={event.Flagged}
            onChange={() => {
                setState(!val); 
                flagEvent(event.EventRecordID); 
            }}
        />
    )
}