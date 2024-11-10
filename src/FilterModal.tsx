import { FormEvent, useState } from "react";
import { Column } from "./types";

interface ComponentProps {
    column: Column,
    setFilter: Function
}

export default function FilterModal({column, setFilter}: ComponentProps) {

    const [filterInput, setFilterInput] = useState("");

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
        setFilterInput(e.target.value);
    }

    return (
        <>
            <span className="filter-btn" onClick={openDialog}> [F]</span>
            <dialog className="filter-dialog">
                <h3>Filter {column.name}</h3>
                <form 
                    onSubmit={(e: any) => {
                        e.preventDefault();
                        let target: HTMLFormElement | null = e.target;
                        let input = target?.querySelector("input");
                        setFilter(column.name, input?.value)
                    }}
                >
                    <label>Match Pattern:</label>
                    <input 
                        type="text" 
                        value={filterInput}
                        onChange={updateFilter}
                    />
                    <button type="submit">Set Filter</button>
                </form>
                <button type="button" onClick={closeDialog}>Close</button> 
            </dialog>
        </>
    )
}