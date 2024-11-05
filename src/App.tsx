import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { homeDir } from '@tauri-apps/api/path';
import { open, DialogFilter } from "@tauri-apps/plugin-dialog";
import EventTable from "./EventTable"

import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [events, setEvents]: [Object[], Function] = useState([]);

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
    console.log(selected);
    let records: string[] = await invoke("load_evtx", { selected });
    let parsed: Object[] = records.map( (j: string) => {
      
      let json = JSON.parse(j);
      return Object.assign({}, json.Event.EventData, json.Event.System);
    });
    console.log(parsed);
    setEvents(parsed);
  }

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="container">
      <h1>Venture</h1>
      <button type="button" onClick={async () =>{await getFile()}}>Open</button>
      {
        events.length > 0 ?
        <EventTable events={events}></EventTable>
        : null
      }
    </main>
  );
}

export default App;
