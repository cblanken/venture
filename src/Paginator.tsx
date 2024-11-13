interface ComponentProps {
    getPage: Function,
    currentPage: number,
    totalEvents: number,
    pageSize: number
}

const Paginator = ({ getPage, currentPage, totalEvents, pageSize }: ComponentProps) => (
    <div className="paginator">
        <p>
            <button
                className="paginate prev"
                disabled={currentPage == 1}
                onClick={() => getPage(currentPage - 1, null)}
            >
                &lt;
            </button>
            Page {currentPage} of {Math.ceil(totalEvents / pageSize)}
            <button
                className="paginate next"
                disabled={currentPage === (Math.ceil(totalEvents / pageSize))}
                onClick={() => getPage(currentPage + 1, null)}
            >
                &gt;
            </button>
        </p>
    </div>
)

export default Paginator;