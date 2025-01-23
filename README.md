# Venture: Windows Event Viewing Made Easy

![header](header.png)

Venture is a cross-platform viewer for Windows Event Logs (`.evtx` files). Built with the [Tauri](https://tauri.app), it is intended as a fast, standalone tool for quickly parsing and slicing Windows Event Log files during incident response, digital forensics, and CTF competitions.

## Why Does This Exist?

While projects like `evtxtools` do a great job on the command line, sometimes a graphical interface is valuable for easy viewing and investigation. A few other features are helpful as well.

## Features

- Load any EVTX file and parse columns
- Load multiple files and join them into one table
- CSV/JSON export
- Filter on all columns (string/number values)
- Flag items of interest; filter on flagged items only
- Tabular event view
- JSON detail event view
- Paginated data

## Roadmap

- [ ] Date-based filters
- [ ] Rearrangeable Columns
- [ ] Custom tags for Events

## Installation

Easiest installation is from the pre-built packages on the [Releases](https://github.com/mttaggart/venture/releases) page.

To build, make sure you have the [Tauri prerequisites](https://tauri.app/start/prerequisites/) installed (including [Rust][https://rustup.rs]).

I build with [Deno](https://docs.deno.com/runtime/#install-deno), so I recommend doing the same. To build packages for your platform, run the following in this cloned repo's root:

```bash
deno task tauri build
```

## Usage

1. Install the application
2. Open a `.evtx` file, or several at once with Ctrl-click (or Command-click on Mac).
3. Use filters, click on columns for sorting, and flag interesting items.

## Troubleshooting

### Ubuntu Blank Screen

There is a [known bug](https://github.com/tauri-apps/tauri/issues/11397) with Tauri regarding a blank white screen on launch. The fix is to set the `WEBKIT_DISABLE_DMABUF_RENDERER` environment variable.

```bash
export WEBKIT_DISABLE_DMABUF_RENDERER=1
```


## Acknowledgements

This project is created with the support of [UCLA Health](https://uclahealth.org). Many thanks for the freedom to build this program for all!