import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    FaBuildingColumns,
    FaChartColumn,
    FaPlus,
    FaTrash
} from "react-icons/fa6";

import SearchSingleSelect
    from "../search/SearchSingleSelect";

import InstitutionComparisonFilters, {
    createEmptyInstitutionComparisonFilters,
    type InstitutionComparisonFilterValues
} from "./InstitutionComparisonFilters";

import useInstitutions
    from "../../features/search/hooks/useInstitutions";

import useInstitutionsGraph
    from "../../features/search/hooks/useInstitutionsGraph";

import type {
    OpenAlexInstitutionMainGraphDto,
    SearchInstitutionOption,
    SearchTaxonomyOption,
    WorkTypeOption
} from "../../features/search/types/search-ui.types";


interface InstitutionSlotValue {

    id:
    number;

    institution:
    SearchInstitutionOption | null;

}


interface InstitutionSelectorProps {

    slotId:
    number;

    selectedInstitution:
    SearchInstitutionOption | null;

    onSelect: (
        slotId:
            number,
        institution:
            SearchInstitutionOption
    ) => void;

    onRemove: (
        slotId:
            number
    ) => void;

    canRemove:
    boolean;

    duplicateMessage?:
    string | null;

}


interface FieldCategory {

    name:
    string;

    total:
    number;

}


const MAX_INSTITUTIONS =
    4;


const PAGE_SIZE =
    10;


const MAX_GRAPH_FIELDS =
    12;


function getInstitutionKey(
    institution:
        SearchInstitutionOption
) {

    return institution.id;

}


function getInstitutionLabel(
    institution:
        SearchInstitutionOption
) {

    return institution.displayName;

}


function getShortLabel(
    value:
        string
) {

    const words =
        value
            .trim()
            .split(
                /\s+/
            )
            .filter(
                Boolean
            );


    if (
        words.length
        >=
        2
    ) {

        return (
            words[0][0]
            +
            words[1][0]
        )
            .toUpperCase();

    }


    return (
        words[0]
        ??
        ""
    )
        .slice(
            0,
            2
        )
        .toUpperCase();

}


function InstitutionSelector({
    slotId,
    selectedInstitution,
    onSelect,
    onRemove,
    canRemove,
    duplicateMessage = null
}: InstitutionSelectorProps) {

    const [
        shouldLoad,
        setShouldLoad
    ] = useState(
        false
    );


    const [
        searchValue,
        setSearchValue
    ] = useState(
        ""
    );


    const [
        backendSearch,
        setBackendSearch
    ] = useState(
        ""
    );


    const [
        skip,
        setSkip
    ] = useState(
        0
    );


    const searchTimer =
        useRef<number | null>(
            null
        );


    const {

        institutions,

        totalCount,

        isLoading,

        error

    } = useInstitutions(
        {

            filter:
                backendSearch,

            skip,

            load:
                shouldLoad,

            pageSize:
                PAGE_SIZE

        }
    );


    useEffect(
        () => {

            return () => {

                if (
                    searchTimer.current
                    !==
                    null
                ) {

                    window.clearTimeout(
                        searchTimer.current
                    );

                }

            };

        },
        []
    );


    function handleSearchChange(
        value:
            string
    ) {

        setSearchValue(
            value
        );


        if (
            searchTimer.current
            !==
            null
        ) {

            window.clearTimeout(
                searchTimer.current
            );

        }


        searchTimer.current =
            window.setTimeout(
                () => {

                    setSkip(
                        0
                    );


                    setBackendSearch(
                        value.trim()
                    );

                },
                350
            );

    }


    function handleSelect(
        institution:
            SearchInstitutionOption
    ) {

        onSelect(
            slotId,
            institution
        );


        setSearchValue(
            ""
        );


        setBackendSearch(
            ""
        );


        setSkip(
            0
        );

    }


    function handleLoadMore() {

        if (
            isLoading
            ||
            institutions.length
            >=
            totalCount
        ) {

            return;

        }


        setSkip(
            current =>
                current
                +
                PAGE_SIZE
        );

    }


    if (
        selectedInstitution
    ) {

        return (

            <div className="comparison-entity-card comparison-entity-card--selected">

                <div>

                    <span className="comparison-entity-number">

                        Institution

                    </span>


                    <strong>

                        {
                            selectedInstitution.displayName
                        }

                    </strong>

                </div>


                {
                    duplicateMessage
                    &&
                    <span className="comparison-selection-message">

                        {
                            duplicateMessage
                        }

                    </span>
                }


                <button
                    type="button"
                    className="comparison-remove-button"
                    aria-label="Remove institution"
                    onClick={() =>
                        onRemove(
                            slotId
                        )
                    }
                >

                    <FaTrash />

                </button>

            </div>

        );

    }


    return (

        <div className="comparison-selector-card">

            <div className="comparison-selector-heading">

                <div>

                    <span>

                        Institution

                    </span>


                    <strong>

                        Select institution

                    </strong>

                </div>


                {
                    canRemove
                    &&
                    <button
                        type="button"
                        className="comparison-remove-button"
                        aria-label="Remove institution slot"
                        onClick={() =>
                            onRemove(
                                slotId
                            )
                        }
                    >

                        <FaTrash />

                    </button>
                }

            </div>


            {
                duplicateMessage
                &&
                <div className="comparison-selector-warning">

                    {
                        duplicateMessage
                    }

                </div>
            }


            <SearchSingleSelect
                label="Institution"
                placeholder="Select an institution..."
                options={
                    institutions
                }
                value={
                    null
                }
                searchValue={
                    searchValue
                }
                isLoading={
                    isLoading
                }
                error={
                    error
                }
                totalCount={
                    totalCount
                }
                getOptionKey={
                    getInstitutionKey
                }
                getOptionLabel={
                    getInstitutionLabel
                }
                onSearchChange={
                    handleSearchChange
                }
                onSelect={
                    handleSelect
                }
                onClear={() =>
                    undefined
                }
                onLoadMore={
                    handleLoadMore
                }
                onOpen={() =>
                    setShouldLoad(
                        true
                    )
                }
            />

        </div>

    );

}


function getInstitutionSummary(
    graph:
        OpenAlexInstitutionMainGraphDto
) {

    const sortedFields =
        [
            ...graph.fields
        ]
            .sort(
                (
                    first,
                    second
                ) =>
                    second.count
                    -
                    first.count
            );


    const total =
        graph.fields.reduce(
            (
                sum,
                field
            ) =>
                sum
                +
                field.count,
            0
        );


    return {

        total,

        leadingField:
            sortedFields[0]
            ??
            null

    };

}


export default function InstitutionComparison() {

    const [
        slots,
        setSlots
    ] = useState<
        InstitutionSlotValue[]
    >(
        [
            {
                id:
                    1,

                institution:
                    null
            },

            {
                id:
                    2,

                institution:
                    null
            }
        ]
    );


    const [
        nextSlotId,
        setNextSlotId
    ] = useState(
        3
    );


    const [
        appliedFilters,
        setAppliedFilters
    ] = useState<InstitutionComparisonFilterValues>(
        createEmptyInstitutionComparisonFilters()
    );


    const [
        selectionMessages,
        setSelectionMessages
    ] = useState<
        Record<number, string>
    >(
        {}
    );


    const {

        data,

        isLoading,

        error,

        loadInstitutionsGraph,

        resetInstitutionsGraph

    } = useInstitutionsGraph();


    const selectedInstitutions =
        useMemo(
            () =>
                slots
                    .map(
                        slot =>
                            slot.institution
                    )
                    .filter(
                        (
                            institution
                        ): institution is SearchInstitutionOption =>
                            institution
                            !==
                            null
                    ),
            [
                slots
            ]
        );


    const selectedInstitutionIdsKey =
        useMemo(
            () =>
                slots
                    .map(
                        slot =>
                            slot.institution
                                ?.openAlexId
                                .trim()
                            ??
                            ""
                    )
                    .filter(
                        Boolean
                    )
                    .join(
                        "|"
                    ),
            [
                slots
            ]
        );


    useEffect(
        () => {

            const selectedInstitutionIds =
                selectedInstitutionIdsKey
                    ? selectedInstitutionIdsKey.split(
                        "|"
                    )
                    : [];


            if (
                selectedInstitutionIds.length
                <
                2
            ) {

                resetInstitutionsGraph();

                return;

            }


            void loadInstitutionsGraph(
                {

                    openAlexInstitutionIds:
                        selectedInstitutionIds,

                    startDate:
                        appliedFilters.startDate
                        ||
                        undefined,

                    endDate:
                        appliedFilters.endDate
                        ||
                        undefined,

                    openAlexFieldIds:
                        appliedFilters.fields.map(
                            (
                                field:
                                    SearchTaxonomyOption
                            ) =>
                                field.openAlexId
                        ),

                    types:
                        appliedFilters.types.map(
                            (
                                type:
                                    WorkTypeOption
                            ) =>
                                type.key
                        )

                }
            );

        },
        [
            selectedInstitutionIdsKey,
            appliedFilters,
            loadInstitutionsGraph,
            resetInstitutionsGraph
        ]
    );


    const allCategories =
        useMemo<FieldCategory[]>(
            () => {

                const totals =
                    new Map<
                        string,
                        number
                    >();


                (
                    data
                    ??
                    []
                )
                    .forEach(
                        institution => {

                            institution.fields.forEach(
                                field => {

                                    totals.set(
                                        field.fieldDisplayName,
                                        (
                                            totals.get(
                                                field.fieldDisplayName
                                            )
                                            ??
                                            0
                                        )
                                        +
                                        field.count
                                    );

                                }
                            );

                        }
                    );


                return Array.from(
                    totals.entries()
                )
                    .map(
                        (
                            [
                                name,
                                total
                            ]
                        ) => ({

                            name,

                            total

                        })
                    )
                    .sort(
                        (
                            first,
                            second
                        ) =>
                            second.total
                            -
                            first.total
                    );

            },
            [
                data
            ]
        );


    const graphCategories =
        useMemo(
            () =>
                allCategories.slice(
                    0,
                    MAX_GRAPH_FIELDS
                ),
            [
                allCategories
            ]
        );


    const hiddenFieldCount =
        Math.max(
            0,
            allCategories.length
            -
            graphCategories.length
        );


    const maximumCount =
        useMemo(
            () =>
                Math.max(
                    1,
                    ...(
                        data
                        ??
                        []
                    )
                        .flatMap(
                            institution =>
                                institution.fields.map(
                                    field =>
                                        field.count
                                )
                        )
                ),
            [
                data
            ]
        );


    function handleAddInstitution() {

        if (
            slots.length
            >=
            MAX_INSTITUTIONS
        ) {

            return;

        }


        setSlots(
            current => [
                ...current,
                {
                    id:
                        nextSlotId,

                    institution:
                        null
                }
            ]
        );


        setNextSlotId(
            current =>
                current
                +
                1
        );

    }


    function handleSelectInstitution(
        slotId:
            number,
        institution:
            SearchInstitutionOption
    ) {

        const alreadySelected =
            slots.some(
                slot =>
                    slot.institution
                        ?.openAlexId
                    ===
                    institution.openAlexId
                    &&
                    slot.id
                    !==
                    slotId
            );


        if (
            alreadySelected
        ) {

            setSelectionMessages(
                current => ({

                    ...current,

                    [slotId]:
                        "This institution is already selected in another slot."

                })
            );


            return;

        }


        setSelectionMessages(
            current => {

                const next = {
                    ...current
                };


                delete next[slotId];


                return next;

            }
        );


        setSlots(
            current =>
                current.map(
                    slot =>
                        slot.id
                            ===
                            slotId
                            ? {
                                ...slot,

                                institution
                            }
                            : slot
                )
        );

    }


    function handleRemoveInstitution(
        slotId:
            number
    ) {

        setSelectionMessages(
            current => {

                const next = {
                    ...current
                };


                delete next[slotId];


                return next;

            }
        );


        setSlots(
            current => {

                if (
                    current.length
                    <=
                    1
                ) {

                    return current.map(
                        slot =>
                            slot.id
                                ===
                                slotId
                                ? {
                                    ...slot,

                                    institution:
                                        null
                                }
                                : slot
                    );

                }


                return current.filter(
                    slot =>
                        slot.id
                        !==
                        slotId
                );

            }
        );

    }


    function getFieldCount(
        graph:
            OpenAlexInstitutionMainGraphDto,
        fieldName:
            string
    ) {

        return graph.fields.find(
            field =>
                field.fieldDisplayName
                ===
                fieldName
        )
            ?.count
            ??
            0;

    }


    function clearFilters() {

        setAppliedFilters(
            createEmptyInstitutionComparisonFilters()
        );

    }


    return (

        <div className="comparison-workspace">

            <div className="comparison-workspace-header">

                <div>

                    <span className="comparison-workspace-icon">

                        <FaBuildingColumns />

                    </span>


                    <div>

                        <span className="section-kicker">

                            INSTITUTION COMPARISON

                        </span>


                        <h3>

                            Compare institutions

                        </h3>


                        <p>

                            Select between two and four
                            institutions, then apply the same
                            date, field and publication-type filters.

                        </p>

                    </div>

                </div>

            </div>


            <div className="comparison-selectors">

                {
                    slots.map(
                        slot => (

                            <InstitutionSelector
                                key={
                                    slot.id
                                }
                                slotId={
                                    slot.id
                                }
                                selectedInstitution={
                                    slot.institution
                                }
                                onSelect={
                                    handleSelectInstitution
                                }
                                onRemove={
                                    handleRemoveInstitution
                                }
                                canRemove={
                                    slots.length
                                    >
                                    1
                                }
                                duplicateMessage={
                                    selectionMessages[
                                    slot.id
                                    ]
                                    ??
                                    null
                                }
                            />

                        )
                    )
                }

            </div>


            {
                slots.length
                <
                MAX_INSTITUTIONS
                &&
                <button
                    type="button"
                    className="comparison-add-button"
                    onClick={
                        handleAddInstitution
                    }
                >

                    <FaPlus />

                    Add institution

                </button>
            }


            {
                selectedInstitutions.length
                <
                2
                &&
                <div className="comparison-ready-state">

                    Select at least two institutions
                    to generate the comparison.

                </div>
            }


            {
                selectedInstitutions.length
                >=
                2
                &&
                <div className="comparison-result">

                    <InstitutionComparisonFilters
                        value={
                            appliedFilters
                        }
                        onApply={
                            setAppliedFilters
                        }
                        onClear={
                            clearFilters
                        }
                    />


                    <section className="research-graph-card comparison-column-card">

                        <div className="research-graph-header">

                            <div>

                                <span className="section-kicker">

                                    FIELD COMPARISON

                                </span>


                                <h2>

                                    Publications by field

                                </h2>


                                <p>

                                    Showing the strongest shared field
                                    categories across the selected institutions.

                                </p>

                            </div>


                            <div className="comparison-view-by">

                                <span>

                                    View by

                                </span>


                                <div>

                                    <FaChartColumn />

                                    Field

                                </div>

                            </div>

                        </div>


                        {
                            isLoading
                                ? (

                                    <div className="research-graph-state">

                                        <div className="research-graph-loader" />


                                        <strong>

                                            Loading institution comparison...

                                        </strong>

                                    </div>

                                )
                                : error
                                    ? (

                                        <div className="research-graph-state research-graph-state--error">

                                            <strong>

                                                Comparison could not be loaded.

                                            </strong>


                                            <span>

                                                {
                                                    error
                                                }

                                            </span>

                                        </div>

                                    )
                                    : data
                                        &&
                                        data.length
                                        >
                                        0
                                        &&
                                        allCategories.length
                                        >
                                        0
                                        ? (

                                            <>

                                                <div className="research-graph-legend">

                                                    {
                                                        data.map(
                                                            (
                                                                institution,
                                                                index
                                                            ) => (

                                                                <span
                                                                    key={
                                                                        institution.openAlexInstitutionId
                                                                    }
                                                                >

                                                                    <i
                                                                        className={
                                                                            `research-graph-series-marker series-${index % 4}`
                                                                        }
                                                                    />


                                                                    {
                                                                        institution.institutionDisplayName
                                                                    }

                                                                </span>

                                                            )
                                                        )
                                                    }

                                                </div>


                                                <div className="comparison-column-chart-wrap">

                                                    <div className="comparison-column-chart">

                                                        {
                                                            graphCategories.map(
                                                                category => (

                                                                    <div
                                                                        className="comparison-column-group"
                                                                        key={
                                                                            category.name
                                                                        }
                                                                    >

                                                                        <div className="comparison-column-bars">

                                                                            {
                                                                                data.map(
                                                                                    (
                                                                                        institution,
                                                                                        index
                                                                                    ) => {

                                                                                        const count =
                                                                                            getFieldCount(
                                                                                                institution,
                                                                                                category.name
                                                                                            );


                                                                                        const height =
                                                                                            count
                                                                                                >
                                                                                                0
                                                                                                ? Math.max(
                                                                                                    4,
                                                                                                    count
                                                                                                    /
                                                                                                    maximumCount
                                                                                                    *
                                                                                                    100
                                                                                                )
                                                                                                : 0;


                                                                                        return (

                                                                                            <div
                                                                                                key={
                                                                                                    `${institution.openAlexInstitutionId}-${category.name}`
                                                                                                }
                                                                                                className="comparison-column-slot"
                                                                                            >

                                                                                                <div
                                                                                                    className={
                                                                                                        `comparison-column series-${index % 4}`
                                                                                                    }
                                                                                                    style={{
                                                                                                        height:
                                                                                                            `${height}%`
                                                                                                    }}
                                                                                                    title={
                                                                                                        `${institution.institutionDisplayName} · ${category.name}: ${count.toLocaleString()} works`
                                                                                                    }
                                                                                                />


                                                                                                <span className="comparison-column-count">

                                                                                                    {
                                                                                                        count.toLocaleString()
                                                                                                    }

                                                                                                </span>

                                                                                            </div>

                                                                                        );

                                                                                    }
                                                                                )
                                                                            }

                                                                        </div>


                                                                        <div
                                                                            className="comparison-column-label"
                                                                            title={
                                                                                category.name
                                                                            }
                                                                        >

                                                                            {
                                                                                getShortLabel(
                                                                                    category.name
                                                                                )
                                                                            }

                                                                        </div>

                                                                    </div>

                                                                )
                                                            )
                                                        }

                                                    </div>

                                                </div>


                                                <div className="comparison-chart-note">

                                                    Showing top{" "}

                                                    <strong>

                                                        {
                                                            graphCategories.length
                                                        }

                                                    </strong>

                                                    {" "}
                                                    of{" "}

                                                    <strong>

                                                        {
                                                            allCategories.length
                                                        }

                                                    </strong>

                                                    {" "}
                                                    fields.

                                                    {
                                                        hiddenFieldCount
                                                        >
                                                        0
                                                        &&
                                                        <>

                                                            {" "}

                                                            {
                                                                hiddenFieldCount
                                                            }

                                                            {" "}

                                                            more fields are included
                                                            in the details below.

                                                        </>
                                                    }

                                                </div>


                                                <section className="comparison-data-details">

                                                    <div className="comparison-data-details-heading">

                                                        <div>

                                                            <span className="section-kicker">

                                                                GRAPH DETAILS

                                                            </span>


                                                            <h3>

                                                                Complete field breakdown

                                                            </h3>

                                                        </div>


                                                        <p>

                                                            The chart is limited for readability.
                                                            This section keeps every returned field.

                                                        </p>

                                                    </div>


                                                    <div className="comparison-detail-table">

                                                        <div className="comparison-detail-row comparison-detail-row--head">

                                                            <strong>

                                                                Field

                                                            </strong>


                                                            {
                                                                data.map(
                                                                    institution => (

                                                                        <strong
                                                                            key={
                                                                                institution.openAlexInstitutionId
                                                                            }
                                                                            title={
                                                                                institution.institutionDisplayName
                                                                            }
                                                                        >

                                                                            {
                                                                                institution.institutionDisplayName
                                                                            }

                                                                        </strong>

                                                                    )
                                                                )
                                                            }

                                                        </div>


                                                        {
                                                            allCategories.map(
                                                                category => (

                                                                    <div
                                                                        className="comparison-detail-row"
                                                                        key={
                                                                            category.name
                                                                        }
                                                                    >

                                                                        <span>

                                                                            {
                                                                                category.name
                                                                            }

                                                                        </span>


                                                                        {
                                                                            data.map(
                                                                                institution => (

                                                                                    <span
                                                                                        key={
                                                                                            `${institution.openAlexInstitutionId}-${category.name}-detail`
                                                                                        }
                                                                                    >

                                                                                        {
                                                                                            getFieldCount(
                                                                                                institution,
                                                                                                category.name
                                                                                            )
                                                                                                .toLocaleString()
                                                                                        }

                                                                                    </span>

                                                                                )
                                                                            )
                                                                        }

                                                                    </div>

                                                                )
                                                            )
                                                        }

                                                    </div>

                                                </section>

                                            </>

                                        )
                                        : (

                                            <div className="research-graph-state">

                                                <strong>

                                                    No comparison data found.

                                                </strong>

                                            </div>

                                        )
                        }

                    </section>


                    {
                        data
                        &&
                        data.length
                        >
                        0
                        &&
                        <div className="comparison-summary-grid">

                            {
                                data.map(
                                    graph => {

                                        const summary =
                                            getInstitutionSummary(
                                                graph
                                            );


                                        return (

                                            <article
                                                key={
                                                    graph.openAlexInstitutionId
                                                }
                                                className="comparison-summary-card"
                                            >

                                                <span>

                                                    Institution

                                                </span>


                                                <h4>

                                                    {
                                                        graph.institutionDisplayName
                                                    }

                                                </h4>


                                                <dl>

                                                    <div>

                                                        <dt>

                                                            Grouped field count

                                                        </dt>


                                                        <dd>

                                                            {
                                                                summary
                                                                    .total
                                                                    .toLocaleString()
                                                            }

                                                        </dd>

                                                    </div>


                                                    <div>

                                                        <dt>

                                                            Leading field

                                                        </dt>


                                                        <dd>

                                                            {
                                                                summary
                                                                    .leadingField
                                                                    ?.fieldDisplayName
                                                                ??
                                                                "—"
                                                            }

                                                        </dd>

                                                    </div>


                                                    <div>

                                                        <dt>

                                                            Leading count

                                                        </dt>


                                                        <dd>

                                                            {
                                                                summary
                                                                    .leadingField
                                                                    ?.count
                                                                    .toLocaleString()
                                                                ??
                                                                "—"
                                                            }

                                                        </dd>

                                                    </div>

                                                </dl>

                                            </article>

                                        );

                                    }
                                )
                            }

                        </div>
                    }

                </div>
            }

        </div>

    );

}
