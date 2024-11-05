interface AppScope {
    events: Object[]
}

const EventTable = ({events}: AppScope): JSX.Element => (
    <>
    <h2>Loaded Events</h2>
    <table>
        <thead>
          <tr>
            {
              Object.keys(events[0]).map( (k: string, i: number) =>
                <th key={i}>{k}</th>
              )
            }
          </tr>
        </thead>
        <tbody>
        {     
            events.map((e: Object, idx: number) => 
                <tr key={idx}>
                  {Object.keys(e).map((k: string, i: number) =>
                      <td key={`${k}-${i}`}>
                        {
                            typeof((e as any)[k]) == "object"
                            ? "Object"
                            : (e as any)[k]
                        }
                    </td>
                    )}
                </tr>
              )
        }
        </tbody>
      </table>
    </>
)

export default EventTable;