import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useSearchParams
} from "react-router-dom";

import CandidateList
    from "./CandidateList";

import SearchFilters
    from "./SearchFilters";

import SearchForm
    from "./SearchForm";

import SearchModeSelector
    from "./SearchModeSelector";

import SearchResults
    from "./SearchResults";

import WorkDetails
    from "./WorkDetails";

import useAuthorCandidates
    from "../../features/search/hooks/useAuthorCandidates";

import useWorkByDoi
    from "../../features/search/hooks/useWorkByDoi";

import useWorksSearch
    from "../../features/search/hooks/useWorksSearch";

import {
    createEmptyWorksFilterValues,
    type AuthorCandidate,
    type OpenAlexWorksSearchRequest,
    type SearchFormValues,
    type SearchMode,
    type WorksFilterValues,
    type WorksSortMode
} from "../../features/search/types/search-ui.types";


function isSearchMode(
    value:
        string | null
): value is SearchMode {

    return (
        value === "author"
        ||
        value === "publications"
        ||
        value === "orcid"
        ||
        value === "doi"
    );

}


export default function SearchExplorerSection() {

    const [
        searchParams,
        setSearchParams
    ] = useSearchParams();


    const {
        data:
        candidateSearchResult,
        isLoading:
        isCandidatesLoading,
        error:
        candidatesError,
        searchCandidates,
        resetCandidates
    } = useAuthorCandidates();


    const {
        data:
        worksResult,
        isLoading:
        isWorksLoading,
        error:
        worksError,
        searchWorks,
        resetWorks
    } = useWorksSearch();


    const {
        data:
        doiWork,
        isLoading:
        isDoiLoading,
        error:
        doiError,
        searchWorkByDoi,
        resetWorkByDoi
    } = useWorkByDoi();


    const modeParameter =
        searchParams.get(
            "mode"
        );


    const searchMode:
        SearchMode =
        isSearchMode(
            modeParameter
        )
            ? modeParameter
            : "author";


    const initialValues =
        useMemo<
            Partial<SearchFormValues>
        >(
            () => ({

                name:
                    searchParams.get(
                        "name"
                    )
                    ??
                    "",

                email:
                    searchParams.get(
                        "email"
                    )
                    ??
                    "",

                publicationQuery:
                    searchParams.get(
                        "filter"
                    )
                    ??
                    "",

                orcid:
                    searchParams.get(
                        "orcid"
                    )
                    ??
                    "",

                doi:
                    searchParams.get(
                        "doi"
                    )
                    ??
                    ""

            }),
            [
                searchParams
            ]
        );


    const [
        selectedCandidate,
        setSelectedCandidate
    ] = useState<
        AuthorCandidate | null
    >(
        null
    );


    const [
        appliedFilters,
        setAppliedFilters
    ] = useState<WorksFilterValues>(
        createEmptyWorksFilterValues()
    );


    const [
        worksFilter,
        setWorksFilter
    ] = useState(
        ""
    );


    const [
        debouncedWorksFilter,
        setDebouncedWorksFilter
    ] = useState(
        ""
    );


    const [
        sortMode,
        setSortMode
    ] = useState<WorksSortMode>(
        "default"
    );


    const [
        currentPage,
        setCurrentPage
    ] = useState(
        1
    );


    const pageSize =
        10;


    const hasSearchCriteria =
        searchMode === "publications"
            ? true
            : searchMode === "author"
                ? Boolean(
                    initialValues.name
                )
                : searchMode === "orcid"
                    ? Boolean(
                        initialValues.orcid
                    )
                    : Boolean(
                        initialValues.doi
                    );


    function resetWorksUiState() {

        setAppliedFilters(
            createEmptyWorksFilterValues()
        );


        setWorksFilter(
            ""
        );


        setDebouncedWorksFilter(
            ""
        );


        setSortMode(
            "default"
        );


        setCurrentPage(
            1
        );


        resetWorks();

    }


    /*
        Researcher candidate search.
    */
    useEffect(
        () => {

            if (
                searchMode !== "author"
            ) {

                resetCandidates();

                return;

            }


            const name =
                initialValues
                    .name
                    ?.trim()
                ??
                "";


            if (
                !name
            ) {

                resetCandidates();

                return;

            }


            const email =
                initialValues
                    .email
                    ?.trim()
                ||
                undefined;


            void searchCandidates(
                name,
                email
            );

        },
        [
            searchMode,
            initialValues.name,
            initialValues.email,
            searchCandidates,
            resetCandidates
        ]
    );


    /*
        DOI search remains an isolated exact-work
        lookup and does not use the Works workspace.
    */
    useEffect(
        () => {

            if (
                searchMode !== "doi"
            ) {

                resetWorkByDoi();

                return;

            }


            const doi =
                initialValues
                    .doi
                    ?.trim()
                ??
                "";


            if (
                !doi
            ) {

                resetWorkByDoi();

                return;

            }


            void searchWorkByDoi(
                doi
            );

        },
        [
            searchMode,
            initialValues.doi,
            searchWorkByDoi,
            resetWorkByDoi
        ]
    );


    /*
        When arriving from Home using:

        /search?mode=publications&filter=...

        seed the Works text filter with that query.

        The user can then continue editing the same
        search from the Works toolbar.
    */
    useEffect(
        () => {

            if (
                searchMode !== "publications"
            ) {

                return;

            }


            const initialFilter =
                initialValues
                    .publicationQuery
                    ?.trim()
                ??
                "";


            setWorksFilter(
                initialFilter
            );


            setDebouncedWorksFilter(
                initialFilter
            );


            setCurrentPage(
                1
            );

        },
        [
            searchMode,
            initialValues.publicationQuery
        ]
    );


    /*
        Debounce the Works text filter.
    */
    useEffect(
        () => {

            const timeoutId =
                window.setTimeout(
                    () => {

                        setDebouncedWorksFilter(
                            worksFilter.trim()
                        );

                    },
                    400
                );


            return () => {

                window.clearTimeout(
                    timeoutId
                );

            };

        },
        [
            worksFilter
        ]
    );


    /*
        Common Works search.

        AUTHOR:
            OpenAlexAuthorId populated.

        ORCID:
            Orcid populated.

        PUBLICATIONS:
            both are undefined.

        All three modes share:
            text
            date
            Field
            Subfield
            Topic
            Keyword
            pagination
            sorting
    */
    useEffect(
        () => {

            const hasAuthor =
                searchMode === "author"
                &&
                selectedCandidate !== null;


            const hasOrcid =
                searchMode === "orcid"
                &&
                Boolean(
                    initialValues
                        .orcid
                        ?.trim()
                );


            const isGlobalPublicationSearch =
                searchMode ===
                "publications";


            if (
                !hasAuthor
                &&
                !hasOrcid
                &&
                !isGlobalPublicationSearch
            ) {

                resetWorks();

                return;

            }


            const request:
                OpenAlexWorksSearchRequest = {

                openAlexAuthorId:
                    hasAuthor
                        ? selectedCandidate
                            ?.openAlexId
                        : undefined,

                orcid:
                    hasOrcid
                        ? initialValues
                            .orcid
                            ?.trim()
                        : undefined,

                startDate:
                    appliedFilters
                        .startDate
                    ||
                    undefined,

                endDate:
                    appliedFilters
                        .endDate
                    ||
                    undefined,

                openAlexFieldIds:
                    appliedFilters
                        .fields
                        .map(
                            item =>
                                item.openAlexId
                        ),

                openAlexSubFieldIds:
                    appliedFilters
                        .subFields
                        .map(
                            item =>
                                item.openAlexId
                        ),

                openAlexTopicIds:
                    appliedFilters
                        .topics
                        .map(
                            item =>
                                item.openAlexId
                        ),

                openAlexKeywordIds:
                    appliedFilters
                        .keywords
                        .map(
                            item =>
                                item.openAlexId
                        ),

                filter:
                    debouncedWorksFilter
                    ||
                    undefined,

                take:
                    pageSize,

                skip:
                    (
                        currentPage
                        -
                        1
                    )
                    *
                    pageSize

            };


            void searchWorks(
                request,
                sortMode
            );

        },
        [
            searchMode,
            selectedCandidate,
            initialValues.orcid,
            appliedFilters,
            debouncedWorksFilter,
            sortMode,
            currentPage,
            searchWorks,
            resetWorks
        ]
    );


    function handleModeChange(
        mode:
            SearchMode
    ) {

        const params =
            new URLSearchParams();


        params.set(
            "mode",
            mode
        );


        setSearchParams(
            params
        );


        setSelectedCandidate(
            null
        );


        resetCandidates();


        resetWorkByDoi();


        resetWorksUiState();

    }


    function handleSearch(
        values:
            SearchFormValues
    ) {

        const params =
            new URLSearchParams();


        params.set(
            "mode",
            searchMode
        );


        if (
            searchMode === "author"
        ) {

            params.set(
                "name",
                values.name.trim()
            );


            if (
                values.email.trim()
            ) {

                params.set(
                    "email",
                    values.email.trim()
                );

            }

        }


        if (
            searchMode === "publications"
        ) {

            const publicationQuery =
                values
                    .publicationQuery
                    .trim();


            if (
                publicationQuery
            ) {

                params.set(
                    "filter",
                    publicationQuery
                );

            }

        }


        if (
            searchMode === "orcid"
        ) {

            params.set(
                "orcid",
                values.orcid.trim()
            );

        }


        if (
            searchMode === "doi"
        ) {

            const doi =
                values.doi.trim();


            params.set(
                "doi",
                doi
            );


            void searchWorkByDoi(
                doi
            );

        }


        setSearchParams(
            params
        );


        setSelectedCandidate(
            null
        );


        resetWorksUiState();


        if (
            searchMode === "publications"
        ) {

            setWorksFilter(
                values
                    .publicationQuery
                    .trim()
            );


            setDebouncedWorksFilter(
                values
                    .publicationQuery
                    .trim()
            );

        }

    }


    function handleCandidateSelect(
        candidate:
            AuthorCandidate
    ) {

        resetWorksUiState();


        setSelectedCandidate(
            candidate
        );

    }


    function handleApplyFilters(
        filters:
            WorksFilterValues
    ) {

        setAppliedFilters(
            filters
        );


        setCurrentPage(
            1
        );

    }


    function handleClearFilters() {

        setAppliedFilters(
            createEmptyWorksFilterValues()
        );


        setCurrentPage(
            1
        );

    }


    function handleWorksFilterChange(
        value:
            string
    ) {

        setWorksFilter(
            value
        );


        setCurrentPage(
            1
        );

    }


    function handleSortChange(
        value:
            WorksSortMode
    ) {

        setSortMode(
            value
        );


        setCurrentPage(
            1
        );

    }


    function renderWorksWorkspace() {

        return (

            <div className="works-layout">

                <SearchFilters
                    value={
                        appliedFilters
                    }
                    onApply={
                        handleApplyFilters
                    }
                    onClear={
                        handleClearFilters
                    }
                />


                <SearchResults
                    works={
                        worksResult
                            ?.items
                        ??
                        []
                    }
                    totalCount={
                        worksResult
                            ?.totalCount
                        ??
                        0
                    }
                    filter={
                        worksFilter
                    }
                    sortMode={
                        sortMode
                    }
                    currentPage={
                        currentPage
                    }
                    pageSize={
                        pageSize
                    }
                    isLoading={
                        isWorksLoading
                    }
                    error={
                        worksError
                    }
                    onFilterChange={
                        handleWorksFilterChange
                    }
                    onSortChange={
                        handleSortChange
                    }
                    onPageChange={
                        setCurrentPage
                    }
                />

            </div>

        );

    }


    return (

        <section
            className="search-workspace-section"
            id="search-workspace"
        >

            <div className="container">


                <div className="search-workspace-heading">

                    <div>

                        <span className="section-kicker">

                            SEARCH ENGINE

                        </span>


                        <h2>

                            Find the scientific data
                            you need.

                        </h2>

                    </div>


                    <p>

                        Find a researcher,
                        search publications globally,
                        search by ORCID,
                        or retrieve one publication
                        directly by DOI.

                    </p>

                </div>


                <div className="search-workspace-card">

                    <SearchModeSelector
                        value={
                            searchMode
                        }
                        onChange={
                            handleModeChange
                        }
                    />


                    {
                        searchMode
                        !==
                        "publications"
                        &&
                        <SearchForm
                            mode={
                                searchMode
                            }
                            initialValues={
                                initialValues
                            }
                            onSubmit={
                                handleSearch
                            }
                        />
                    }

                </div>


                {
                    !hasSearchCriteria
                    &&
                    <div className="search-empty-state">

                        <span>

                            READY TO SEARCH

                        </span>


                        <h3>

                            Choose a search mode
                            and enter your criteria.

                        </h3>


                        <p>

                            Find a researcher,
                            browse publications,
                            enter an ORCID,
                            or retrieve an exact
                            publication by DOI.

                        </p>

                    </div>
                }


                {
                    searchMode === "publications"
                    &&
                    <>

                        <div className="search-context-card">

                            <span className="search-context-label">

                                GLOBAL PUBLICATION SEARCH

                            </span>


                            <h3>

                                Search across all publications

                            </h3>


                            <p>

                                This search is not restricted
                                to a researcher. Use publication
                                text, dates, Field, Subfield,
                                Topic or Keyword to refine
                                the complete works dataset.

                            </p>

                        </div>


                        {
                            renderWorksWorkspace()
                        }

                    </>
                }


                {
                    hasSearchCriteria
                    &&
                    searchMode === "author"
                    &&
                    !selectedCandidate
                    &&
                    isCandidatesLoading
                    &&
                    <div className="search-context-card">

                        <span className="search-context-label">

                            SEARCHING

                        </span>


                        <h3>

                            Finding researcher matches...

                        </h3>

                    </div>
                }


                {
                    hasSearchCriteria
                    &&
                    searchMode === "author"
                    &&
                    !selectedCandidate
                    &&
                    candidatesError
                    &&
                    !isCandidatesLoading
                    &&
                    <div className="search-context-card">

                        <span className="search-context-label">

                            SEARCH ERROR

                        </span>


                        <h3>

                            We could not retrieve
                            researcher candidates.

                        </h3>


                        <p>

                            {candidatesError}

                        </p>

                    </div>
                }


                {
                    hasSearchCriteria
                    &&
                    searchMode === "author"
                    &&
                    !selectedCandidate
                    &&
                    candidateSearchResult
                    &&
                    !isCandidatesLoading
                    &&
                    !candidatesError
                    &&
                    <CandidateList
                        searchedName={
                            initialValues.name
                            ??
                            ""
                        }
                        resolvedInstitution={
                            candidateSearchResult
                                .resolvedInstitution
                        }
                        candidates={
                            candidateSearchResult
                                .candidates
                        }
                        selectedCandidate={
                            selectedCandidate
                        }
                        onSelectCandidate={
                            handleCandidateSelect
                        }
                    />
                }


                {
                    hasSearchCriteria
                    &&
                    searchMode === "author"
                    &&
                    selectedCandidate
                    &&
                    <>

                        <div className="selected-author-card">

                            <div>

                                <span className="search-context-label">

                                    SELECTED RESEARCHER

                                </span>


                                <h3>

                                    {
                                        selectedCandidate
                                            .displayName
                                    }

                                </h3>


                                {
                                    selectedCandidate
                                        .institution
                                    &&
                                    <p>

                                        {
                                            selectedCandidate
                                                .institution
                                        }

                                    </p>
                                }

                            </div>


                            <div className="selected-author-actions">

                                <div>

                                    <span>

                                        OpenAlex ID

                                    </span>


                                    <strong>

                                        {
                                            selectedCandidate
                                                .openAlexId
                                        }

                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    onClick={() => {

                                        setSelectedCandidate(
                                            null
                                        );


                                        resetWorksUiState();

                                    }}
                                >

                                    Change researcher

                                </button>

                            </div>

                        </div>


                        {
                            renderWorksWorkspace()
                        }

                    </>
                }


                {
                    hasSearchCriteria
                    &&
                    searchMode === "orcid"
                    &&
                    <>

                        <div className="search-context-card">

                            <span className="search-context-label">

                                ORCID SEARCH

                            </span>


                            <h3>

                                Research works

                            </h3>


                            <p>

                                Works associated with
                                the supplied ORCID are
                                loaded directly from
                                the backend.

                            </p>


                            <div className="search-context-meta">

                                ORCID:

                                <strong>

                                    {
                                        initialValues.orcid
                                    }

                                </strong>

                            </div>

                        </div>


                        {
                            renderWorksWorkspace()
                        }

                    </>
                }


                {
                    hasSearchCriteria
                    &&
                    searchMode === "doi"
                    &&
                    isDoiLoading
                    &&
                    <div className="search-context-card">

                        <span className="search-context-label">

                            DOI SEARCH

                        </span>


                        <h3>

                            Retrieving publication...

                        </h3>


                        <p>

                            Looking up

                            {" "}

                            <strong>

                                {
                                    initialValues.doi
                                }

                            </strong>

                        </p>

                    </div>
                }


                {
                    hasSearchCriteria
                    &&
                    searchMode === "doi"
                    &&
                    !isDoiLoading
                    &&
                    doiError
                    &&
                    <div className="search-context-card">

                        <span className="search-context-label">

                            DOI SEARCH ERROR

                        </span>


                        <h3>

                            We could not retrieve
                            this publication.

                        </h3>


                        <p>

                            {doiError}

                        </p>

                    </div>
                }


                {
                    hasSearchCriteria
                    &&
                    searchMode === "doi"
                    &&
                    !isDoiLoading
                    &&
                    !doiError
                    &&
                    doiWork
                    &&
                    <WorkDetails
                        work={
                            doiWork
                        }
                    />
                }


            </div>

        </section>

    );

}