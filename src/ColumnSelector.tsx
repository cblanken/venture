import { useState } from "react";
import { Column } from "./types";

interface ComponentProps {
    columns: Column[],
    setColumns: Function
}


export default function ColumnSelector({columns, setColumns}: ComponentProps) {
    
    const selectColumns = (e: any) => {
        let target: HTMLSelectElement = e.target as HTMLSelectElement;
        let newColumns = Array.from(target.selectedOptions)
            .map((o) => o.value);
        setColumns(
            columns.map((c) => ({
                    name: c.name,
                    selected: newColumns.includes(c.name)
            }))
        );
    }
    return (
        <>
            <label>Select Columns</label>
            <select 
                multiple={true} 
                value={
                    columns
                    .filter((c) => c.selected)
                    .map((c) => c.name)
                }
                onChange={selectColumns}
                size={10}
            >
                { columns.map((c) => c.name).sort().map((c: string, idx: number) => (
                    <option 
                        key={`col-${idx}`} 
                        value={c} 
                    >
                        {c}
                    </option>
                ))}
            </select>
        </>
    )
}