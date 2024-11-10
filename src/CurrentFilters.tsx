import { Column, ColumnMap } from "./types"

interface ComponentProps {
    columns: ColumnMap
}

export default function CurrentFilters({ columns }: ComponentProps) {
    return (
        <ul className="filter-container">
            {
                Object.values(columns)
                .map((c: Column) => (
                    c.filter !== "" ?
                    <li className="filter-item">
                        {c.name}: {c.filter}
                    </li>
                    : null
                ))
            }
        </ul>
    )
}