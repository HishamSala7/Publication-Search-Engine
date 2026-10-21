import {
    type MutableRefObject,
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

import useInstitutions
    from "../../features/search/hooks/useInstitutions";

import useSearchTaxonomy
    from "../../features/search/hooks/useSearchTaxonomy";

import useWorkTypes
    from "../../features/search/hooks/useWorkTypes";

import {
    createEmptyWorksFilterValues,
    type SearchInstitutionOption,
    type SearchTaxonomyOption,
    type WorkTypeOption,
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

    hideInstitution?:
    boolean;

}


const DROPDOWN_PAGE_SIZE =
    10;


function toggleOption<T>(
    selected:
        T[],
    option:
        T,
    getKey: (
        item: T
    ) => string | number
): T[] {

    const optionKey =
        getKey(
            option
        );


    const exists =
        selected.some(
            selectedOption =>
                getKey(
                    selectedOption
                )
                ===
                optionKey
        );


    if (
        exists
    ) {

        return selected.filter(
            selectedOption =>
                getKey(
                    selectedOption
                )
                !==
                optionKey
        );

    }


    return [
        ...selected,
        option
    ];

}


function getTaxonomyKey(
    option:
        SearchTaxonomyOption
) {

    return option.id;

}


function getTaxonomyLabel(
    option:
        SearchTaxonomyOption
) {

    return option.displayName;

}


function getInstitutionKey(
    option:
        SearchInstitutionOption
) {

    return option.id;

}


function getInstitutionLabel(
    option:
        SearchInstitutionOption
) {

    return option.displayName;

}


function getWorkTypeKey(
    option:
        WorkTypeOption
) {

    return option.key;

}


function getWorkTypeLabel(
    option:
        WorkTypeOption
) {

    return option.value;

}


export default function SearchFilters({
    value,
    onApply,
    onClear,
    hideInstitution = false
}: SearchFiltersProps) {

    const [
        draftFilters,
        setDraftFilters
    ] = useState<WorksFilterValues>(
        value
    );


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


    const [
        shouldLoadInstitutions,
        setShouldLoadInstitutions
    ] = useState(
        false
    );


    const [
        shouldLoadWorkTypes,
        setShouldLoadWorkTypes
    ] = useState(
        false
    );


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


    const [
        institutionSearch,
        setInstitutionSearch
    ] = useState(
        ""
    );


    const [
        workTypeSearch,
        setWorkTypeSearch
    ] = useState(
        ""
    );


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


    const [
        institutionBackendSearch,
        setInstitutionBackendSearch
    ] = useState(
        ""
    );


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


    const [
        institutionSkip,
        setInstitutionSkip
    ] = useState(
        0
    );


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


    const institutionTimer =
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


    useEffect(
        () => {

            return () => {

                [
                    fieldTimer,
                    subFieldTimer,
                    topicTimer,
                    keywordTimer,
                    institutionTimer
                ]
                    .forEach(
                        timer => {

                            if (
                                timer.current
                                !==
                                null
                            ) {

                                window.clearTimeout(
                                    timer.current
                                );

                            }

                        }
                    );

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


    const {

        institutions,

        totalCount:
        institutionsTotalCount,

        isLoading:
        isInstitutionsLoading,

        error:
        institutionsError

    } = useInstitutions(
        {

            filter:
                institutionBackendSearch,

            skip:
                institutionSkip,

            load:
                shouldLoadInstitutions,

            pageSize:
                DROPDOWN_PAGE_SIZE

        }
    );


    const {

        workTypes,

        isLoading:
        isWorkTypesLoading,

        error:
        workTypesError

    } = useWorkTypes(
        {

            load:
                shouldLoadWorkTypes

        }
    );


    const displayedWorkTypes =
        useMemo(
            () => {

                const normalizedSearch =
                    workTypeSearch
                        .trim()
                        .toLowerCase();


                if (
                    !normalizedSearch
                ) {

                    return workTypes;

                }


                return workTypes.filter(
                    workType =>
                        workType
                            .value
                            .toLowerCase()
                            .includes(
                                normalizedSearch
                            )
                );

            },
            [
                workTypes,
                workTypeSearch
            ]
        );


    function updateBackendSearch(
        value:
            string,
        timer:
            MutableRefObject<number | null>,
        resetSkip:
            () => void,
        setBackendValue:
            (
                value: string
            ) => void
    ) {

        if (
            timer.current
            !==
            null
        ) {

            window.clearTimeout(
                timer.current
            );

        }


        timer.current =
            window.setTimeout(
                () => {

                    resetSkip();


                    setBackendValue(
                        value.trim()
                    );

                },
                350
            );

    }


    function handleFieldSearch(
        value:
            string
    ) {

        setFieldSearch(
            value
        );


        updateBackendSearch(
            value,
            fieldTimer,
            () =>
                setFieldSkip(
                    0
                ),
            setFieldBackendSearch
        );

    }


    function handleSubFieldSearch(
        value:
            string
    ) {

        setSubFieldSearch(
            value
        );


        updateBackendSearch(
            value,
            subFieldTimer,
            () =>
                setSubFieldSkip(
                    0
                ),
            setSubFieldBackendSearch
        );

    }


    function handleTopicSearch(
        value:
            string
    ) {

        setTopicSearch(
            value
        );


        updateBackendSearch(
            value,
            topicTimer,
            () =>
                setTopicSkip(
                    0
                ),
            setTopicBackendSearch
        );

    }


    function handleKeywordSearch(
        value:
            string
    ) {

        setKeywordSearch(
            value
        );


        updateBackendSearch(
            value,
            keywordTimer,
            () =>
                setKeywordSkip(
                    0
                ),
            setKeywordBackendSearch
        );

    }


    function handleInstitutionSearch(
        value:
            string
    ) {

        setInstitutionSearch(
            value
        );


        updateBackendSearch(
            value,
            institutionTimer,
            () =>
                setInstitutionSkip(
                    0
                ),
            setInstitutionBackendSearch
        );

    }


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
                        option,
                        getTaxonomyKey
                    )

            })
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
                        option,
                        getTaxonomyKey
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
                        option,
                        getTaxonomyKey
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
                        option,
                        getTaxonomyKey
                    )

            })
        );

    }


    function handleInstitutionToggle(
        option:
            SearchInstitutionOption
    ) {

        setDraftFilters(
            current => ({

                ...current,

                institutions:
                    toggleOption(
                        current.institutions,
                        option,
                        getInstitutionKey
                    )

            })
        );

    }


    function handleWorkTypeToggle(
        option:
            WorkTypeOption
    ) {

        setDraftFilters(
            current => ({

                ...current,

                types:
                    toggleOption(
                        current.types,
                        option,
                        getWorkTypeKey
                    )

            })
        );

    }


    function loadMoreFields() {

        if (
            isFieldsLoading
            ||
            fields.length
            >=
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
            subFields.length
            >=
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
            topics.length
            >=
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
            keywords.length
            >=
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


    function loadMoreInstitutions() {

        if (
            isInstitutionsLoading
            ||
            institutions.length
            >=
            institutionsTotalCount
        ) {

            return;

        }


        setInstitutionSkip(
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


        setInstitutionSearch(
            ""
        );


        setWorkTypeSearch(
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


        setInstitutionBackendSearch(
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


        setInstitutionSkip(
            0
        );


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


        setShouldLoadInstitutions(
            false
        );


        setShouldLoadWorkTypes(
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


            {
                !hideInstitution
                &&
                <SearchMultiSelect
                    label="Institution"
                    placeholder="Search institutions..."
                    options={
                        institutions
                    }
                    selected={
                        draftFilters.institutions
                    }
                    searchValue={
                        institutionSearch
                    }
                    isLoading={
                        isInstitutionsLoading
                    }
                    error={
                        institutionsError
                    }
                    totalCount={
                        institutionsTotalCount
                    }
                    getOptionKey={
                        getInstitutionKey
                    }
                    getOptionLabel={
                        getInstitutionLabel
                    }
                    onOpen={() =>
                        setShouldLoadInstitutions(
                            true
                        )
                    }
                    onSearchChange={
                        handleInstitutionSearch
                    }
                    onToggle={
                        handleInstitutionToggle
                    }
                    onLoadMore={
                        loadMoreInstitutions
                    }
                />
            }


            <SearchMultiSelect
                label="Work type"
                placeholder="Select work types..."
                options={
                    displayedWorkTypes
                }
                selected={
                    draftFilters.types
                }
                searchValue={
                    workTypeSearch
                }
                isLoading={
                    isWorkTypesLoading
                }
                error={
                    workTypesError
                }
                totalCount={
                    displayedWorkTypes.length
                }
                getOptionKey={
                    getWorkTypeKey
                }
                getOptionLabel={
                    getWorkTypeLabel
                }
                onOpen={() =>
                    setShouldLoadWorkTypes(
                        true
                    )
                }
                onSearchChange={
                    setWorkTypeSearch
                }
                onToggle={
                    handleWorkTypeToggle
                }
                onLoadMore={() => {
                    // Work types are returned in one list.
                }}
            />


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
                getOptionKey={
                    getTaxonomyKey
                }
                getOptionLabel={
                    getTaxonomyLabel
                }
                onOpen={() =>
                    setShouldLoadFields(
                        true
                    )
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
                getOptionKey={
                    getTaxonomyKey
                }
                getOptionLabel={
                    getTaxonomyLabel
                }
                onOpen={() =>
                    setShouldLoadSubFields(
                        true
                    )
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
                getOptionKey={
                    getTaxonomyKey
                }
                getOptionLabel={
                    getTaxonomyLabel
                }
                onOpen={() =>
                    setShouldLoadTopics(
                        true
                    )
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
                getOptionKey={
                    getTaxonomyKey
                }
                getOptionLabel={
                    getTaxonomyLabel
                }
                onOpen={() =>
                    setShouldLoadKeywords(
                        true
                    )
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