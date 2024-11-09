import { useState } from "react";
import { Column } from "./types";

interface ComponentProps {
    column: Column,
    setFilter: Function
}

export default function FilterButton({column, setFilter}: ComponentProps) {

    const [currentFilter, setCurrentFilter] = useState("");

    const openDialog = (e: any) => {
        let target: HTMLElement = e.target;
        let dialog = target.parentElement?.querySelector("dialog");
        dialog?.showModal();
    }

    const closeDialog = (e:any) => {
        let target: HTMLElement = e.target;
        let dialog: HTMLDialogElement = target.parentElement as HTMLDialogElement;
        dialog?.close();
        
    }

    const updateFilter = (e:any) => {
        let target: HTMLInputElement = e.target;
        setCurrentFilter(e.target.value);
        setFilter(column.name, currentFilter)
    }

    return (
        <>
            <span className="filter-btn" onClick={openDialog}> [F]</span>
            <dialog className="filter-dialog">
                <h3>Filter {column.name}</h3>
                <label>Match Pattern:</label>
                <input 
                    type="text" 
                    value={currentFilter}
                    onChange={updateFilter}
                />
                <button onClick={closeDialog}>Close</button> 
            </dialog>
        </>
    )
}