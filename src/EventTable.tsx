import EventDetail from "./EventDetail";
import { Column, ColumnMap } from "./types";
import FilterModal from "./FilterModal";

interface ComponentProps {
    events: Object[],
    columns: ColumnMap,
    setFilter: Function,
    setSortColumn: Function,
    getPage: Function
}

const EventTable = ({ 
    events, 
    columns, 
    setFilter, 
    setSortColumn, 
    getPage 
}: ComponentProps): JSX.Element => {

    const selectedColumns = Object.values(columns) 
        .filter((c: Column) => c.selected)


    const openDetailView = (e: any) => {
        let target = e.target as HTMLElement;
        target.querySelector("dialog")?.showModal();
    }

    return (
        <>
            <h2>Loaded Events</h2>
            <table>
                <thead>
                    <tr>
                        <td>Detail View</td>
                        {selectedColumns.map((c: Column, i: number) =>
                            <td 
                                key={`col-${i}`}
                                onClick={() => {
                                    setSortColumn(c);
                                    getPage(1, selectedColumns);
                                }}
                            >
                                {c.name}
                                <FilterModal column={c} setFilter={setFilter} />
                            </td>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {
                        events.map((e: Object, idx: number) =>
                            <tr 
                                key={idx}
                                onDoubleClick={openDetailView}
                            >
                                <td>
                                    <EventDetail event={e} />
                                </td>
                                {selectedColumns.map((c: Column, i: number) =>
                                    Object.keys(e)
                                    .includes(c.name) ?
                                    <td key={`${c.name}-${i}`}>
                                        {
                                            typeof ((e as any)[c.name]) == "object"
                                                ? "Object"
                                                : (e as any)[c.name]
                                        }
                                    </td>
                                    : ""
                                )}
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </>
    )

}

export default EventTable;