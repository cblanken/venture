import EventDetail from "./EventDetail";
import { Column, ColumnMap } from "./types";
import FilterModal from "./FilterModal";

interface ComponentProps {
    events: Object[],
    columns: ColumnMap,
    setFilter: Function
}

const EventTable = ({ events, columns, setFilter }: ComponentProps): JSX.Element => {

    const selectedColumns = Object.values(columns) 
        .filter((c: Column) => c.selected)


    const openDetailView = (e: any) => {
        let target = e.target as HTMLElement;
        target.querySelector("dialog")?.showModal();
    }


    const filterMatch = (e: {[key: string]: any}): boolean => {

        // If there are no filters, all's well
        let filteredColumns = Object.values(columns).filter((c: Column) => c.filter !== "");
        console.log(filteredColumns);
        if (filteredColumns.length == 0) return true;

        return filteredColumns.some((c: Column) => {
            if (!(c.name in e)) return false;
            return c.filter.includes(e[c.name])
        });

    }

    return (
        <>
            <h2>Loaded Events</h2>
            <table>
                <thead>
                    <tr>
                        <td>Detail View</td>
                        {selectedColumns.map((c: Column, i: number) =>
                            <td key={`col-${i}`}>
                                {c.name}
                                <FilterModal column={c} setFilter={setFilter} />
                            </td>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {
                        events.filter(filterMatch).map((e: Object, idx: number) =>
                            <tr 
                                key={idx}
                                onDoubleClick={openDetailView}
                            >
                                <td>
                                    <EventDetail event={e} />
                                </td>
                                {Object.keys(e).map((k: string, i: number) =>
                                    selectedColumns
                                    .map((c) => c.name)
                                    .includes(k) ?
                                    <td key={`${k}-${i}`}>
                                        {
                                            typeof ((e as any)[k]) == "object"
                                                ? "Object"
                                                : (e as any)[k]
                                        }
                                    </td>
                                    : null
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