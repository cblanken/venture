import EventDetail from "./EventDetail";
import { Column } from "./types";

interface AppScope {
    events: Object[],
    columns: Column[]
}

const EventTable = ({ events, columns }: AppScope): JSX.Element => {

    const selectedColumns = columns
        .filter((c) => c.selected)
        .map((c) => c.name);

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
                        {selectedColumns.map((c: string, i: number) =>
                            <td key={`col-${i}`}>
                                {c}
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
                                {Object.keys(e).map((k: string, i: number) =>
                                    selectedColumns.includes(k) ?
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