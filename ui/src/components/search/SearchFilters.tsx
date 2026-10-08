import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    FaFilter
} from "react-icons/fa6";

import SearchMultiSelect
    from "./SearchMultiSelect";

import useSearchTaxonomy
    from "../../features/search/hooks/useSearchTaxonomy";

import {
    createEmptyWorksFilterValues,
    type SearchTaxonomyOption,
    type WorksFilterValues
} from "../../features/search/types/search-ui.types";


interface SearchFiltersProps {

    value:
    WorksFilterValues;

    onApply: (
        filters:
            WorksFilterValues
    ) => void;

    onClear:
    () => void;

}


const DROPDOWN_PAGE_SIZE =
    10;


function toggleOption(
    selected:
        SearchTaxonomyOption[],
    option:
        SearchTaxonomyOption
): SearchTaxonomyOption[] {

    const exists =
        selected.some(
            selectedOption =>
                selectedOption.id
                ===
                option.id
        );


    if (
        exists
    ) {

        return selected.filter(
            selectedOption =>
                selectedOption.id
                !==
                option.id
        );

    }


    return [
        ...selected,
        option
    ];

}


export default function SearchFilters({
    value,
    onApply,
    onClear
}: SearchFiltersProps) {

    const [
        draftFilters,
        setDraftFilters
    ] = useState<WorksFilterValues>(
        value
    );


    /*
        A dropdown starts false.

        Therefore mounting SearchFilters does NOT
        automatically call its API.
    */

    const [
        shouldLoadFields,
        setShouldLoadFields
    ] = useState(
        false
    );


    const [
        shouldLoadSubFields,
        setShouldLoadSubFields
    ] = useState(
        false
    );


    const [
        shouldLoadTopics,
        setShouldLoadTopics
    ] = useState(
        false
    );


    const [
        shouldLoadKeywords,
        setShouldLoadKeywords
    ] = useState(
        false
    );


    /*
        Visible search values.
    */

    const [
        fieldSearch,
        setFieldSearch
    ] = useState(
        ""
    );


    const [
        subFieldSearch,
        setSubFieldSearch
    ] = useState(
        ""
    );


    const [
        topicSearch,
        setTopicSearch
    ] = useState(
        ""
    );


    const [
        keywordSearch,
        setKeywordSearch
    ] = useState(
        ""
    );


    /*
        Actual backend search values.

        These change only after debounce.
    */

    const [
        fieldBackendSearch,
        setFieldBackendSearch
    ] = useState(
        ""
    );


    const [
        subFieldBackendSearch,
        setSubFieldBackendSearch
    ] = useState(
        ""
    );


    const [
        topicBackendSearch,
        setTopicBackendSearch
    ] = useState(
        ""
    );


    const [
        keywordBackendSearch,
        setKeywordBackendSearch
    ] = useState(
        ""
    );


    /*
        Pagination.

        Take always = 10.

        Only Skip moves.
    */

    const [
        fieldSkip,
        setFieldSkip
    ] = useState(
        0
    );


    const [
        subFieldSkip,
        setSubFieldSkip
    ] = useState(
        0
    );


    const [
        topicSkip,
        setTopicSkip
    ] = useState(
        0
    );


    const [
        keywordSkip,
        setKeywordSkip
    ] = useState(
        0
    );


    /*
        Debounce timer references.

        They do not cause renders.
    */

    const fieldTimer =
        useRef<number | null>(
            null
        );


    const subFieldTimer =
        useRef<number | null>(
            null
        );


    const topicTimer =
        useRef<number | null>(
            null
        );


    const keywordTimer =
        useRef<number | null>(
            null
        );


    useEffect(
        () => {

            setDraftFilters(
                value
            );

        },
        [
            value
        ]
    );


    /*
        Cleanup pending debounce timers when
        this component is removed.
    */

    useEffect(
        () => {

            return () => {

                if (
                    fieldTimer.current !== null
                ) {

                    window.clearTimeout(
                        fieldTimer.current
                    );

                }


                if (
                    subFieldTimer.current !== null
                ) {

                    window.clearTimeout(
                        subFieldTimer.current
                    );

                }


                if (
                    topicTimer.current !== null
                ) {

                    window.clearTimeout(
                        topicTimer.current
                    );

                }


                if (
                    keywordTimer.current !== null
                ) {

                    window.clearTimeout(
                        keywordTimer.current
                    );

                }

            };

        },
        []
    );


    const fieldIds =
        useMemo(
            () =>
                draftFilters
                    .fields
                    .map(
                        item =>
                            item.id
                    ),
            [
                draftFilters.fields
            ]
        );


    const subFieldIds =
        useMemo(
            () =>
                draftFilters
                    .subFields
                    .map(
                        item =>
                            item.id
                    ),
            [
                draftFilters.subFields
            ]
        );


    const topicIds =
        useMemo(
            () =>
                draftFilters
                    .topics
                    .map(
                        item =>
                            item.id
                    ),
            [
                draftFilters.topics
            ]
        );


    const {

        fields,

        subFields,

        topics,

        keywords,

        fieldsTotalCount,

        subFieldsTotalCount,

        topicsTotalCount,

        keywordsTotalCount,

        isFieldsLoading,

        isSubFieldsLoading,

        isTopicsLoading,

        isKeywordsLoading,

        fieldsError,

        subFieldsError,

        topicsError,

        keywordsError

    } = useSearchTaxonomy(
        {

            fieldIds,

            subFieldIds,

            topicIds,

            fieldFilter:
                fieldBackendSearch,

            subFieldFilter:
                subFieldBackendSearch,

            topicFilter:
                topicBackendSearch,

            keywordFilter:
                keywordBackendSearch,

            fieldSkip,

            subFieldSkip,

            topicSkip,

            keywordSkip,

            loadFields:
                shouldLoadFields,

            loadSubFields:
                shouldLoadSubFields,

            loadTopics:
                shouldLoadTopics,

            loadKeywords:
                shouldLoadKeywords,

            pageSize:
                DROPDOWN_PAGE_SIZE

        }
    );


    /*
        SERVER-SIDE SEARCH
    */

    function handleFieldSearch(
        value: string
    ) {

        setFieldSearch(
            value
        );


        if (
            fieldTimer.current !== null
        ) {

            window.clearTimeout(
                fieldTimer.current
            );

        }


        fieldTimer.current =
            window.setTimeout(
                () => {

                    setFieldSkip(
                        0
                    );


                    setFieldBackendSearch(
                        value.trim()
                    );

                },
                350
            );

    }


    function handleSubFieldSearch(
        value: string
    ) {

        setSubFieldSearch(
            value
        );


        if (
            subFieldTimer.current !== null
        ) {

            window.clearTimeout(
                subFieldTimer.current
            );

        }


        subFieldTimer.current =
            window.setTimeout(
                () => {

                    setSubFieldSkip(
                        0
                    );


                    setSubFieldBackendSearch(
                        value.trim()
                    );

                },
                350
            );

    }


    function handleTopicSearch(
        value: string
    ) {

        setTopicSearch(
            value
        );


        if (
            topicTimer.current !== null
        ) {

            window.clearTimeout(
                topicTimer.current
            );

        }


        topicTimer.current =
            window.setTimeout(
                () => {

                    setTopicSkip(
                        0
                    );


                    setTopicBackendSearch(
                        value.trim()
                    );

                },
                350
            );

    }


    function handleKeywordSearch(
        value: string
    ) {

        setKeywordSearch(
            value
        );


        if (
            keywordTimer.current !== null
        ) {

            window.clearTimeout(
                keywordTimer.current
            );

        }


        keywordTimer.current =
            window.setTimeout(
                () => {

                    setKeywordSkip(
                        0
                    );


                    setKeywordBackendSearch(
                        value.trim()
                    );

                },
                350
            );

    }


    /*
        SELECTION
    */

    function handleFieldToggle(
        option:
            SearchTaxonomyOption
    ) {

        setDraftFilters(
            current => ({

                ...current,

                fields:
                    toggleOption(
                        current.fields,
                        option
                    )

            })
        );


        /*
            The next dependent request starts
            from page one.

            We preserve selected chips.
        */

        setSubFieldSkip(
            0
        );


        setTopicSkip(
            0
        );


        setKeywordSkip(
            0
        );

    }


    function handleSubFieldToggle(
        option:
            SearchTaxonomyOption
    ) {

        setDraftFilters(
            current => ({

                ...current,

                subFields:
                    toggleOption(
                        current.subFields,
                        option
                    )

            })
        );


        setTopicSkip(
            0
        );


        setKeywordSkip(
            0
        );

    }


    function handleTopicToggle(
        option:
            SearchTaxonomyOption
    ) {

        setDraftFilters(
            current => ({

                ...current,

                topics:
                    toggleOption(
                        current.topics,
                        option
                    )

            })
        );


        setKeywordSkip(
            0
        );

    }


    function handleKeywordToggle(
        option:
            SearchTaxonomyOption
    ) {

        setDraftFilters(
            current => ({

                ...current,

                keywords:
                    toggleOption(
                        current.keywords,
                        option
                    )

            })
        );

    }


    /*
        LAZY OPENING
    */

    function handleFieldOpen() {

        setShouldLoadFields(
            true
        );

    }


    function handleSubFieldOpen() {

        setShouldLoadSubFields(
            true
        );

    }


    function handleTopicOpen() {

        setShouldLoadTopics(
            true
        );

    }


    function handleKeywordOpen() {

        setShouldLoadKeywords(
            true
        );

    }


    /*
        INFINITE SCROLL
    */

    function loadMoreFields() {

        if (
            isFieldsLoading
            ||
            fields.length >=
            fieldsTotalCount
        ) {

            return;

        }


        setFieldSkip(
            current =>
                current
                +
                DROPDOWN_PAGE_SIZE
        );

    }


    function loadMoreSubFields() {

        if (
            isSubFieldsLoading
            ||
            subFields.length >=
            subFieldsTotalCount
        ) {

            return;

        }


        setSubFieldSkip(
            current =>
                current
                +
                DROPDOWN_PAGE_SIZE
        );

    }


    function loadMoreTopics() {

        if (
            isTopicsLoading
            ||
            topics.length >=
            topicsTotalCount
        ) {

            return;

        }


        setTopicSkip(
            current =>
                current
                +
                DROPDOWN_PAGE_SIZE
        );

    }


    function loadMoreKeywords() {

        if (
            isKeywordsLoading
            ||
            keywords.length >=
            keywordsTotalCount
        ) {

            return;

        }


        setKeywordSkip(
            current =>
                current
                +
                DROPDOWN_PAGE_SIZE
        );

    }


    function handleClear() {

        const empty =
            createEmptyWorksFilterValues();


        setDraftFilters(
            empty
        );


        setFieldSearch(
            ""
        );


        setSubFieldSearch(
            ""
        );


        setTopicSearch(
            ""
        );


        setKeywordSearch(
            ""
        );


        setFieldBackendSearch(
            ""
        );


        setSubFieldBackendSearch(
            ""
        );


        setTopicBackendSearch(
            ""
        );


        setKeywordBackendSearch(
            ""
        );


        setFieldSkip(
            0
        );


        setSubFieldSkip(
            0
        );


        setTopicSkip(
            0
        );


        setKeywordSkip(
            0
        );


        /*
            Return the dropdowns to their
            untouched/lazy state.
        */

        setShouldLoadFields(
            false
        );


        setShouldLoadSubFields(
            false
        );


        setShouldLoadTopics(
            false
        );


        setShouldLoadKeywords(
            false
        );


        onClear();

    }


    return (

        <aside className="works-filter-panel">

            <div className="works-filter-title">

                <div>

                    <span>

                        Filters

                    </span>


                    <small>

                        Refine research works

                    </small>

                </div>


                <FaFilter />

            </div>


            <div className="works-filter-group">

                <label>

                    Publication date

                </label>


                <div className="works-date-range">

                    <div>

                        <span>

                            From

                        </span>


                        <input
                            type="date"
                            value={
                                draftFilters.startDate
                            }
                            onChange={
                                event =>
                                    setDraftFilters(
                                        current => ({

                                            ...current,

                                            startDate:
                                                event.target.value

                                        })
                                    )
                            }
                        />

                    </div>


                    <div>

                        <span>

                            To

                        </span>


                        <input
                            type="date"
                            value={
                                draftFilters.endDate
                            }
                            onChange={
                                event =>
                                    setDraftFilters(
                                        current => ({

                                            ...current,

                                            endDate:
                                                event.target.value

                                        })
                                    )
                            }
                        />

                    </div>

                </div>

            </div>


            <SearchMultiSelect
                label="Field"
                placeholder="Search fields..."
                options={
                    fields
                }
                selected={
                    draftFilters.fields
                }
                searchValue={
                    fieldSearch
                }
                isLoading={
                    isFieldsLoading
                }
                error={
                    fieldsError
                }
                totalCount={
                    fieldsTotalCount
                }
                onOpen={
                    handleFieldOpen
                }
                onSearchChange={
                    handleFieldSearch
                }
                onToggle={
                    handleFieldToggle
                }
                onLoadMore={
                    loadMoreFields
                }
            />


            <SearchMultiSelect
                label="Subfield"
                placeholder="Search subfields..."
                options={
                    subFields
                }
                selected={
                    draftFilters.subFields
                }
                searchValue={
                    subFieldSearch
                }
                isLoading={
                    isSubFieldsLoading
                }
                error={
                    subFieldsError
                }
                totalCount={
                    subFieldsTotalCount
                }
                onOpen={
                    handleSubFieldOpen
                }
                onSearchChange={
                    handleSubFieldSearch
                }
                onToggle={
                    handleSubFieldToggle
                }
                onLoadMore={
                    loadMoreSubFields
                }
            />


            <SearchMultiSelect
                label="Topic"
                placeholder="Search topics..."
                options={
                    topics
                }
                selected={
                    draftFilters.topics
                }
                searchValue={
                    topicSearch
                }
                isLoading={
                    isTopicsLoading
                }
                error={
                    topicsError
                }
                totalCount={
                    topicsTotalCount
                }
                onOpen={
                    handleTopicOpen
                }
                onSearchChange={
                    handleTopicSearch
                }
                onToggle={
                    handleTopicToggle
                }
                onLoadMore={
                    loadMoreTopics
                }
            />


            <SearchMultiSelect
                label="Keyword"
                placeholder="Search keywords..."
                options={
                    keywords
                }
                selected={
                    draftFilters.keywords
                }
                searchValue={
                    keywordSearch
                }
                isLoading={
                    isKeywordsLoading
                }
                error={
                    keywordsError
                }
                totalCount={
                    keywordsTotalCount
                }
                onOpen={
                    handleKeywordOpen
                }
                onSearchChange={
                    handleKeywordSearch
                }
                onToggle={
                    handleKeywordToggle
                }
                onLoadMore={
                    loadMoreKeywords
                }
            />


            <div className="works-filter-actions">

                <button
                    type="button"
                    className="works-filter-apply"
                    onClick={() =>
                        onApply(
                            draftFilters
                        )
                    }
                >

                    Apply filters

                </button>


                <button
                    type="button"
                    className="works-filter-clear"
                    onClick={
                        handleClear
                    }
                >

                    Clear

                </button>

            </div>

        </aside>

    );

}