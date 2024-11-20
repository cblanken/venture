interface ComponentProps {
    pageSize: number,
    pageSizes: number[],
    setPageSize: Function,
    getPage: Function
}

export default function PageSizeSelector({ 
    pageSize, 
    pageSizes, 
    getPage, 
    setPageSize 
}: ComponentProps) {
    return (
        <div className="page-size-selector">
            <label>Page Size</label>
            <select
                value={pageSize}
                onChange={(e: any) => {
                    let target: HTMLSelectElement = e.target;
                    let newSize = parseInt(target.value);
                    setPageSize(newSize);
                    getPage(1, newSize, null)

                }}
            >
                {
                    pageSizes.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))
                }
            </select>
        </div>
    )
}