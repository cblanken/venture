import { Column, ColumnMap } from "./types"

interface ComponentProps {
    columns: ColumnMap,
    setFilter: Function
}

export default function CurrentFilters({ columns, setFilter }: ComponentProps) {

    return (
        <ul className="filter-container">
            {
                Object.values(columns)
                .map((c: Column) => (
                    c.filter !== "" ?
                    <li key={`filter-${c.name}`} className="filter-item">
                        {c.name}: {c.filter}
                        <span 
                            className="remove-filter"
                            onClick={() => (setFilter(c.name, ""))}
                        >
                            [X]
                        </span>
                    </li>
                    : null
                ))
            }
        </ul>
    )
}