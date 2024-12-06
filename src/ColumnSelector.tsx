import { Column, ColumnMap } from "./types";

interface ComponentProps {
    columns: ColumnMap,
    setColumns: Function
}


export default function ColumnSelector({ columns, setColumns }: ComponentProps) {

    const selectColumns = (e: any) => {
        let target: HTMLSelectElement = e.target as HTMLSelectElement;
        let newColumns = { ...columns };
        let selectedColumns: Array<string> = Array.from(target.selectedOptions)
            .map((o: HTMLOptionElement) => o.value);
        Object.keys(newColumns).forEach((k: string) => {
            let col: Column = newColumns[k];
            if (selectedColumns.includes(k)) {
                col.selected = true;
            } else {
                col.selected = false;
            }
        })
        setColumns(newColumns);
    }

    const dialogClose = (e: any) => {
        let dialog = e.target.parentElement as HTMLDialogElement;
        dialog.close();
    }

    return (
        <dialog className="column-selector">
            <h3>Select Columns</h3>
            <select
                multiple={true}
                value={
                    Object.values(columns)
                        .filter((c) => c.selected)
                        .map((c) => c.name)
                }
                onChange={selectColumns}
                size={10}
            >
                {Object.values(columns).map((c) => c.name).sort().map((c: string, idx: number) => (
                    <option
                        key={`col-${idx}`}
                        value={c}
                    >
                        {c}
                    </option>
                ))}
            </select>
            <button onClick={dialogClose}>Close</button>
        </dialog >
    )
}