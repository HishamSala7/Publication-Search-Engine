import {
    type MutableRefObject,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    FaFilter,
    FaRotateLeft
} from "react-icons/fa6";

import SearchMultiSelect
    from "../search/SearchMultiSelect";

import useSearchTaxonomy
    from "../../features/search/hooks/useSearchTaxonomy";

import useWorkTypes
    from "../../features/search/hooks/useWorkTypes";

import type {
    SearchTaxonomyOption,
    WorkTypeOption
} from "../../features/search/types/search-ui.types";


export interface InstitutionComparisonFilterValues {

    startDate:
    string;

    endDate:
    string;

    fields:
    SearchTaxonomyOption[];

    types:
    WorkTypeOption[];

}


interface InstitutionComparisonFiltersProps {

    value:
    InstitutionComparisonFilterValues;

    onApply: (
        value:
            InstitutionComparisonFilterValues
    ) => void;

    onClear:
    () => void;

}


const DROPDOWN_PAGE_SIZE =
    10;


export function createEmptyInstitutionComparisonFilters():
    InstitutionComparisonFilterValues {

    return {

        startDate:
            "",

        endDate:
            "",

        fields:
            [],

        types:
            []

    };

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


function toggleOption<T>(
    selected:
        T[],
    option:
        T,
    getKey:
        (item: T) => string | number
) {

    const key =
        getKey(
            option
        );


    const exists =
        selected.some(
            item =>
                getKey(
                    item
                )
                ===
                key
        );


    return exists
        ? selected.filter(
            item =>
                getKey(
                    item
                )
                !==
                key
        )
        : [
            ...selected,
            option
        ];

}


export default function InstitutionComparisonFilters({
    value,
    onApply,
    onClear
}: InstitutionComparisonFiltersProps) {

    const [
        draft,
        setDraft
    ] = useState<InstitutionComparisonFilterValues>(
        value
    );


    const [
        shouldLoadFields,
        setShouldLoadFields
    ] = useState(
        false
    );


    const [
        shouldLoadTypes,
        setShouldLoadTypes
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
        fieldBackendSearch,
        setFieldBackendSearch
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
        fieldSkip,
        setFieldSkip
    ] = useState(
        0
    );


    const fieldTimer =
        useRef<number | null>(
            null
        );


    useEffect(
        () => {

            setDraft(
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

                if (
                    fieldTimer.current
                    !==
                    null
                ) {

                    window.clearTimeout(
                        fieldTimer.current
                    );

                }

            };

        },
        []
    );


    const {

        fields,

        fieldsTotalCount,

        isFieldsLoading,

        fieldsError

    } = useSearchTaxonomy(
        {

            fieldIds:
                [],

            subFieldIds:
                [],

            topicIds:
                [],

            fieldFilter:
                fieldBackendSearch,

            subFieldFilter:
                "",

            topicFilter:
                "",

            keywordFilter:
                "",

            fieldSkip,

            subFieldSkip:
                0,

            topicSkip:
                0,

            keywordSkip:
                0,

            loadFields:
                shouldLoadFields,

            loadSubFields:
                false,

            loadTopics:
                false,

            loadKeywords:
                false,

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
                shouldLoadTypes

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
                    type =>
                        type.value
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
        setBackendValue:
            (value: string) => void
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

                    setFieldSkip(
                        0
                    );


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
            setFieldBackendSearch
        );

    }


    function handleFieldToggle(
        field:
            SearchTaxonomyOption
    ) {

        setDraft(
            current => ({

                ...current,

                fields:
                    toggleOption(
                        current.fields,
                        field,
                        getTaxonomyKey
                    )

            })
        );

    }


    function handleTypeToggle(
        type:
            WorkTypeOption
    ) {

        setDraft(
            current => ({

                ...current,

                types:
                    toggleOption(
                        current.types,
                        type,
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


    function handleClear() {

        const empty =
            createEmptyInstitutionComparisonFilters();


        setDraft(
            empty
        );


        setFieldSearch(
            ""
        );


        setFieldBackendSearch(
            ""
        );


        setWorkTypeSearch(
            ""
        );


        setFieldSkip(
            0
        );


        onClear();

    }


    return (

        <div className="comparison-filter-panel">

            <div className="comparison-filter-heading">

                <div>

                    <FaFilter />


                    <div>

                        <strong>

                            Comparison filters

                        </strong>


                        <span>

                            Applied to every selected institution.

                        </span>

                    </div>

                </div>


                <button
                    type="button"
                    className="comparison-filter-clear"
                    onClick={
                        handleClear
                    }
                >

                    <FaRotateLeft />

                    Clear

                </button>

            </div>


            <div className="comparison-filter-grid">

                <div className="comparison-date-filter">

                    <label>

                        Publication date

                    </label>


                    <div>

                        <span>

                            From

                        </span>


                        <input
                            type="date"
                            value={
                                draft.startDate
                            }
                            onChange={
                                event =>
                                    setDraft(
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
                                draft.endDate
                            }
                            onChange={
                                event =>
                                    setDraft(
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


                <SearchMultiSelect
                    label="Field"
                    placeholder="Fields..."
                    options={
                        fields
                    }
                    selected={
                        draft.fields
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
                    onSearchChange={
                        handleFieldSearch
                    }
                    onToggle={
                        handleFieldToggle
                    }
                    onLoadMore={
                        loadMoreFields
                    }
                    onOpen={() =>
                        setShouldLoadFields(
                            true
                        )
                    }
                />


                <SearchMultiSelect
                    label="Publication type"
                    placeholder="Types..."
                    options={
                        displayedWorkTypes
                    }
                    selected={
                        draft.types
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
                    onSearchChange={
                        setWorkTypeSearch
                    }
                    onToggle={
                        handleTypeToggle
                    }
                    onLoadMore={() =>
                        undefined
                    }
                    onOpen={() =>
                        setShouldLoadTypes(
                            true
                        )
                    }
                />

            </div>


            <div className="comparison-filter-actions">

                <button
                    type="button"
                    onClick={() =>
                        onApply(
                            draft
                        )
                    }
                >

                    Apply filters

                </button>

            </div>

        </div>

    );

}
