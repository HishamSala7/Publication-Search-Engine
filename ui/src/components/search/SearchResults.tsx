import WorkCard
    from "./WorkCard";

import WorksToolbar
    from "./WorksToolbar";

import SearchPagination
    from "./SearchPagination";

import type {
    OpenAlexWork,
    WorksSortMode
} from "../../features/search/types/search-ui.types";


interface SearchResultsProps {

    works: OpenAlexWork[];

    totalCount: number;

    filter: string;

    sortMode: WorksSortMode;

    currentPage: number;

    pageSize: number;

    isLoading: boolean;

    error: string | null;

    onFilterChange: (
        value: string
    ) => void;

    onSortChange: (
        value: WorksSortMode
    ) => void;

    onPageChange: (
        page: number
    ) => void;

}


export default function SearchResults({
    works,
    totalCount,
    filter,
    sortMode,
    currentPage,
    pageSize,
    isLoading,
    error,
    onFilterChange,
    onSortChange,
    onPageChange
}: SearchResultsProps) {

    return (

        <section className="works-results-panel">

            <WorksToolbar
                totalCount={
                    totalCount
                }
                filter={
                    filter
                }
                sortMode={
                    sortMode
                }
                onFilterChange={
                    onFilterChange
                }
                onSortChange={
                    onSortChange
                }
            />


            {
                isLoading
                &&
                <div className="works-empty-state">

                    <span>

                        LOADING

                    </span>


                    <h3>

                        Retrieving research works...

                    </h3>


                    <p>

                        Please wait while the
                        publication data is loaded.

                    </p>

                </div>
            }


            {
                !isLoading
                &&
                error
                &&
                <div className="works-empty-state">

                    <span>

                        SEARCH ERROR

                    </span>


                    <h3>

                        We could not retrieve
                        the research works.

                    </h3>


                    <p>

                        {error}

                    </p>

                </div>
            }


            {
                !isLoading
                &&
                !error
                &&
                works.length === 0
                &&
                <div className="works-empty-state">

                    <span>

                        NO RESULTS

                    </span>


                    <h3>

                        No works match
                        the current search.

                    </h3>


                    <p>

                        Try changing the search text
                        or clearing some filters.

                    </p>

                </div>
            }


            {
                !isLoading
                &&
                !error
                &&
                works.length > 0
                &&
                <div className="works-list">

                    {
                        works.map(
                            (
                                work,
                                index
                            ) => (

                                <WorkCard
                                    key={
                                        work.id
                                        ??
                                        work.doi
                                        ??
                                        index
                                    }
                                    work={
                                        work
                                    }
                                />

                            )
                        )
                    }

                </div>
            }


            {
                !isLoading
                &&
                !error
                &&
                <SearchPagination
                    currentPage={
                        currentPage
                    }
                    pageSize={
                        pageSize
                    }
                    totalCount={
                        totalCount
                    }
                    onPageChange={
                        onPageChange
                    }
                />
            }

        </section>

    );

}