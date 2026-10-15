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

import OrcidAuthorInfo
    from "./OrcidAuthorInfo";

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
    type SearchInstitutionOption,
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
        value === "institution"
        ||
        value === "orcid"
        ||
        value === "doi"
    );

}


function getInstitutionsFromSearchParams(
    searchParams:
        URLSearchParams
): SearchInstitutionOption[] {

    const ids =
        searchParams.getAll(
            "institutionId"
        );


    const openAlexIds =
        searchParams.getAll(
            "institutionOpenAlexId"
        );


    const names =
        searchParams.getAll(
            "institutionName"
        );


    return openAlexIds
        .map(
            (
                openAlexId,
                index
            ) => {

                if (
                    !openAlexId
                ) {

                    return null;

                }


                return {

                    id:
                        ids[index]
                        ||
                        openAlexId,

                    openAlexId,

                    displayName:
                        names[index]
                        ||
                        openAlexId

                };

            }
        )
        .filter(
            (
                institution
            ): institution is SearchInstitutionOption =>
                institution !== null
        );

}


function appendInstitutions(
    params:
        URLSearchParams,
    institutions:
        SearchInstitutionOption[]
) {

    institutions.forEach(
        institution => {

            params.append(
                "institutionId",
                institution.id
            );


            params.append(
                "institutionOpenAlexId",
                institution.openAlexId
            );


            params.append(
                "institutionName",
                institution.displayName
            );

        }
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


    const initialInstitutions =
        useMemo(
            () =>
                getInstitutionsFromSearchParams(
                    searchParams
                ),
            [
                searchParams
            ]
        );


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

                institutions:
                    initialInstitutions,

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
                searchParams,
                initialInstitutions
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
                : searchMode === "institution"
                    ? (
                        initialInstitutions.length
                        >
                        0
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
        DOI remains an isolated exact-work lookup.
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
        Publication text arriving from Home.
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
        Institution selections arriving from Home
        become the initial Works institution filter.
    */
    useEffect(
        () => {

            if (
                searchMode !== "institution"
            ) {

                return;

            }


            setAppliedFilters(
                current => ({

                    ...current,

                    institutions:
                        initialInstitutions

                })
            );


            setCurrentPage(
                1
            );

        },
        [
            searchMode,
            initialInstitutions
        ]
    );


    /*
        Debounce Works text filtering.
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
        Shared Works search.
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


            const hasInstitutionSearch =
                searchMode ===
                "institution"
                &&
                appliedFilters
                    .institutions
                    .length
                >
                0;


            if (
                !hasAuthor
                &&
                !hasOrcid
                &&
                !isGlobalPublicationSearch
                &&
                !hasInstitutionSearch
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

                openAlexInstitutionIds:
                    appliedFilters
                        .institutions
                        .map(
                            item =>
                                item.openAlexId
                        ),

                types:
                    appliedFilters
                        .types
                        .map(
                            item =>
                                item.key
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
            searchMode === "institution"
        ) {

            appendInstitutions(
                params,
                values.institutions
            );

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


        if (
            searchMode === "institution"
        ) {

            setAppliedFilters(
                {

                    ...createEmptyWorksFilterValues(),

                    institutions:
                        values.institutions

                }
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

        const empty =
            createEmptyWorksFilterValues();


        if (
            searchMode === "institution"
        ) {

            empty.institutions =
                initialInstitutions;

        }


        setAppliedFilters(
            empty
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
                        explore publications by institution,
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
                            select one or more institutions,
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
                                to a researcher or institution.
                                Use publication text, dates,
                                Field, Subfield, Topic,
                                Keyword, Institution or Work Type
                                to refine the complete works dataset.

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
                    searchMode === "institution"
                    &&
                    <>

                        <div className="search-context-card">

                            <span className="search-context-label">

                                INSTITUTION SEARCH

                            </span>


                            <h3>

                                Publications by institution

                            </h3>


                            <p>

                                Results are restricted to the
                                selected institutions. You can
                                continue refining the publications
                                using the filters below.

                            </p>


                            <div className="search-context-meta">

                                Institutions:

                                {" "}

                                <strong>

                                    {
                                        initialInstitutions
                                            .map(
                                                institution =>
                                                    institution.displayName
                                            )
                                            .join(", ")
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

                        <OrcidAuthorInfo
                            orcid={
                                initialValues.orcid
                                ??
                                ""
                            }
                            works={
                                worksResult
                                    ?.items
                                ??
                                []
                            }
                            isWorksLoading={
                                isWorksLoading
                            }
                        />


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