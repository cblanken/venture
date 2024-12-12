import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
  AppPhase,
  PageResult, 
  ColumnMap, 
  Column,
  SortBy,
  Event
} from "./types";
import { homeDir } from '@tauri-apps/api/path';
import { open } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from '@tauri-apps/api/window';
import ColumnSelector from "./ColumnSelector";
import CurrentFilters from "./CurrentFilters";
import EventTable from "./EventTable";
import Paginator from "./Paginator";
import PageSizeSelector from "./PageSizeSelector";

import "./App.css";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZES = [
  10,
  50,
  100
]

function App() {
  // const [selectedFile, setSelectedFile] = useState("");
  const [appPhase, setAppPhase]: [AppPhase, Function] = useState(AppPhase.INIT);
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents]: [Event[], Function] = useState([]);
  const [columns, setColumns]: [ColumnMap, Function] = useState({});
  const [sortBy, setSortBy]: [SortBy | null, Function] = useState(null);
  const [totalEvents, setTotalEvents]: [number, Function] = useState(0);
  const [pageSize, setPageSize]: [number, Function] = useState(DEFAULT_PAGE_SIZE);

  async function getPage(selected: number, pageSize: number, newColumns: {[key: string]: Column} | null) {
    let cols = newColumns || columns; 
    let filteredColumns = Object.values(cols)
      .filter((c: Column) => c.filter != "");
    setAppPhase(AppPhase.PAGE_LOADING);
    let res: PageResult = await invoke("select_page", { selected, pageSize, filteredColumns, sortBy });
    console.log(res);
    setCurrentPage(res.page_num);
    setEvents(res.events);
    setTotalEvents(res.total_events);
    setAppPhase(AppPhase.PAGE_LOADED);
  }

  function flagEvent(eventId: number) {
    console.log(eventId);
    let event = events.find((e: Event) => (e.EventRecordID === eventId));
    if (event) {
      // Modify it here on the loaded page. The backend will be handled
      // by the invoke
      event.Flagged = !event.Flagged
      invoke("flag_event", { eventId });

    }
  }

  async function getFile() {
    const selected = await open({
      directory: false,
      multiple: false,
      defaultPath: await homeDir(),
      title: "Select Event File",
      filters: [{
        extensions: ["evtx"],
        name: ""
      }]
    });

    setAppPhase(AppPhase.FILE_LOADING);

    let res: PageResult = await invoke("load_evtx", { selected });
    let events: Object[] = await res.events;
    let columns: ColumnMap = {}; 

    // Transform the column names into proper Columns
    res.column_names.forEach((c: string) => {
      columns[c] = { 
        name: c,
        selected: true,
        filter: ""
      }
    });

    setCurrentPage(res.page_num);
    setTotalEvents(res.total_events);
    setPageSize(res.page_size);
    setEvents(events);
    setColumns(columns);

    setAppPhase(AppPhase.FILE_LOADED);
  }

  const setFilter = (columnName: string, filter: string) => {
    console.log(`Updating ${columnName}`)
    let oldCol: Column = columns[columnName];
    let newCol: Column = {
      name: oldCol.name,
      selected: oldCol.selected,
      filter
    };
    console.log(newCol.filter);
    let newColumns = {...columns};
    newColumns[columnName] = newCol;
    console.log(newColumns[columnName]);
    setColumns(newColumns);
    getPage(1, pageSize, newColumns);
  }


  const UiPhase = () => {
    switch(Number(appPhase)) {
      case AppPhase.INIT:
        return  <h2>Open a <code>.evtx</code> file to begin.</h2>;
      case AppPhase.FILE_LOADING:
        return <h2>Loading...</h2>
      default:
        return (
          <>
            <ColumnSelector columns={columns} setColumns={setColumns} />
            <CurrentFilters columns={columns} setFilter={setFilter} />
            <EventTable 
              events={events} 
              columns={columns} 
              setFilter={setFilter} 
              sortBy={sortBy}
              setSortBy={setSortBy}
              getPage={getPage}
              pageSize={pageSize}
              flagEvent={flagEvent}
            />
            <PageSizeSelector 
              pageSizes={PAGE_SIZES}
              pageSize={pageSize}
              setPageSize={setPageSize}
              getPage={getPage}
            />
            <Paginator
              currentPage={currentPage}
              pageSize={pageSize}
              getPage={getPage}
              totalEvents={totalEvents}
            />
          </>
        );
    }
  }

  const openColumnSelector = () => {
    const columnSelector = document.querySelector(".column-selector") as HTMLDialogElement;
    columnSelector.showModal();

  }
  

  return (
    <main className="container">
      <h1>Venture</h1>
      <nav className="button-container">
        <button type="button" onClick={async () =>{await getFile()}}>Open</button>
        { Number(appPhase) == AppPhase.FILE_LOADED || Number(appPhase) == AppPhase.PAGE_LOADED ?
          <button onClick={openColumnSelector}>Select Columns</button>
          : null
        }
        <button type="button" onClick={ async () => {await getCurrentWindow().close();} }>Quit</button>
      </nav>
      {
        UiPhase()
      }
    </main>
  );
}

export default App;
