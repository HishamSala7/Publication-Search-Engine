interface SearchPaginationProps {

    currentPage: number;

    pageSize: number;

    totalCount: number;

    onPageChange: (
        page: number
    ) => void;

}


export default function SearchPagination({
    currentPage,
    pageSize,
    totalCount,
    onPageChange
}: SearchPaginationProps) {

    if (
        totalCount === 0
    ) {

        return null;

    }


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalCount
                /
                pageSize
            )
        );


    const visibleCount =
        Math.min(
            5,
            totalPages
        );


    let startPage =
        Math.max(
            1,
            currentPage - 2
        );


    if (
        startPage
        +
        visibleCount
        -
        1
        >
        totalPages
    ) {

        startPage =
            Math.max(
                1,
                totalPages
                -
                visibleCount
                +
                1
            );

    }


    const visiblePages =
        Array.from(
            {
                length:
                    visibleCount
            },
            (
                _,
                index
            ) =>
                startPage
                +
                index
        );


    return (

        <div className="works-pagination">

            <button
                type="button"
                disabled={
                    currentPage
                    <=
                    1
                }
                onClick={() =>
                    onPageChange(
                        currentPage - 1
                    )
                }
            >

                Previous

            </button>


            <div className="works-page-numbers">

                {
                    visiblePages.map(
                        page => (

                            <button
                                type="button"
                                key={page}
                                className={
                                    page
                                        ===
                                        currentPage
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    onPageChange(
                                        page
                                    )
                                }
                            >

                                {page}

                            </button>

                        )
                    )
                }

            </div>


            <span className="works-page-status">

                Page

                {" "}

                {currentPage}

                {" "}

                of

                {" "}

                {totalPages}

            </span>


            <button
                type="button"
                disabled={
                    currentPage
                    >=
                    totalPages
                }
                onClick={() =>
                    onPageChange(
                        currentPage + 1
                    )
                }
            >

                Next

            </button>

        </div>

    );

}