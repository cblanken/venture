interface ComponentProps {
    getPage: Function,
    currentPage: number,
    totalEvents: number,
    pageSize: number
}

const Paginator = ({ getPage, currentPage, totalEvents, pageSize }: ComponentProps) => {
    const lastPage = Math.ceil(totalEvents/pageSize);
    return (
        <div className="paginator">
            <p>
                <button
                    className="paginate first"
                    disabled={currentPage == 1}
                    onClick={() => getPage(1, pageSize, null)}
                >
                    &lt;&lt;
                </button>
                <button
                    className="paginate prev"
                    disabled={currentPage == 1}
                    onClick={() => getPage(currentPage - 1, pageSize, null)}
                >
                    &lt;
                </button>
                Page {currentPage} of {lastPage}
                <button
                    className="paginate next"
                    disabled={currentPage === lastPage}
                    onClick={() => getPage(currentPage + 1, null)}
                >
                    &gt;
                </button>
                <button
                    className="paginate last"
                    disabled={currentPage === lastPage}
                    onClick={() => getPage(lastPage, pageSize, null)}
                >
                    &gt;&gt;
                </button>
            </p>
        </div>
    )
} 

export default Paginator;