import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FaChartLine,
    FaMagnifyingGlass,
    FaPlus,
    FaTrash
} from "react-icons/fa6";

import AuthorGraph
    from "../search/AuthorGraph";

import AuthorGraphFilters
    from "../search/AuthorGraphFilters";

import useAuthorCandidates
    from "../../features/search/hooks/useAuthorCandidates";

import useAuthorsGraph
    from "../../features/search/hooks/useAuthorsGraph";

import {
    OpenAlexGraphModes
} from "../../features/search/types/search-ui.types";

import {
    createEmptyAuthorGraphFilterValues,
    type AuthorGraphFilterValues
} from "../../features/search/types/author-graph-ui.types";

import type {
    AuthorCandidate,
    OpenAlexAuthorGraphDto,
    OpenAlexGraphMode
} from "../../features/search/types/search-ui.types";


interface ResearcherSlotValue {

    id:
    number;

    candidate:
    AuthorCandidate | null;

}


interface ResearcherSelectorProps {

    slotId:
    number;

    selectedCandidate:
    AuthorCandidate | null;

    onSelect: (
        slotId:
            number,
        candidate:
            AuthorCandidate
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


const MAX_RESEARCHERS =
    4;


function ResearcherSelector({
    slotId,
    selectedCandidate,
    onSelect,
    onRemove,
    canRemove,
    duplicateMessage = null
}: ResearcherSelectorProps) {

    const [
        name,
        setName
    ] = useState(
        ""
    );


    const [
        email,
        setEmail
    ] = useState(
        ""
    );


    const [
        hasSearched,
        setHasSearched
    ] = useState(
        false
    );


    const {

        data,

        isLoading,

        error,

        searchCandidates,

        resetCandidates

    } = useAuthorCandidates();


    useEffect(
        () => {

            if (
                selectedCandidate
            ) {

                setName(
                    selectedCandidate.displayName
                );

                return;

            }


            setName(
                ""
            );


            setEmail(
                ""
            );


            setHasSearched(
                false
            );


            resetCandidates();

        },
        [
            selectedCandidate,
            resetCandidates
        ]
    );


    function handleSearch() {

        const normalizedName =
            name.trim();


        if (
            !normalizedName
        ) {

            return;

        }


        setHasSearched(
            true
        );


        void searchCandidates(
            normalizedName,
            email.trim()
            ||
            undefined
        );

    }


    function handleCandidateSelect(
        candidate:
            AuthorCandidate
    ) {

        onSelect(
            slotId,
            candidate
        );


        resetCandidates();


        setHasSearched(
            false
        );

    }


    if (
        selectedCandidate
    ) {

        return (

            <div className="comparison-entity-card comparison-entity-card--selected">

                <div>

                    <span className="comparison-entity-number">

                        Researcher

                    </span>


                    <strong>

                        {
                            selectedCandidate.displayName
                        }

                    </strong>


                    {
                        selectedCandidate.institution
                        &&
                        <small>

                            {
                                selectedCandidate.institution
                            }

                        </small>
                    }


                    {
                        selectedCandidate.orcid
                        &&
                        <small>

                            ORCID:{" "}

                            {
                                selectedCandidate.orcid
                            }

                        </small>
                    }

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
                    aria-label="Remove researcher"
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

                        Researcher

                    </span>


                    <strong>

                        Find researcher

                    </strong>

                </div>


                {
                    canRemove
                    &&
                    <button
                        type="button"
                        className="comparison-remove-button"
                        aria-label="Remove researcher slot"
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


            <div className="comparison-researcher-fields">

                <label>

                    <span>

                        Name

                    </span>


                    <div>

                        <FaMagnifyingGlass />


                        <input
                            type="search"
                            value={
                                name
                            }
                            placeholder="e.g. John Smith"
                            onChange={
                                event =>
                                    setName(
                                        event.target.value
                                    )
                            }
                            onKeyDown={
                                event => {

                                    if (
                                        event.key
                                        ===
                                        "Enter"
                                    ) {

                                        event.preventDefault();

                                        handleSearch();

                                    }

                                }
                            }
                        />

                    </div>

                </label>


                <label>

                    <span>

                        Email

                        <small>

                            Optional

                        </small>

                    </span>


                    <input
                        type="email"
                        value={
                            email
                        }
                        placeholder="john@university.edu"
                        onChange={
                            event =>
                                setEmail(
                                    event.target.value
                                )
                        }
                        onKeyDown={
                            event => {

                                if (
                                    event.key
                                    ===
                                    "Enter"
                                ) {

                                    event.preventDefault();

                                    handleSearch();

                                }

                            }
                        }
                    />

                </label>

            </div>


            <button
                type="button"
                className="comparison-search-button"
                disabled={
                    !name.trim()
                    ||
                    isLoading
                }
                onClick={
                    handleSearch
                }
            >

                <FaMagnifyingGlass />


                {
                    isLoading
                        ? "Searching..."
                        : "Find researcher"
                }

            </button>


            {
                duplicateMessage
                &&
                <div className="comparison-selector-warning">

                    {
                        duplicateMessage
                    }

                </div>
            }


            {
                error
                &&
                <div className="comparison-selector-error">

                    {
                        error
                    }

                </div>
            }


            {
                hasSearched
                &&
                !isLoading
                &&
                !error
                &&
                data
                &&
                data.candidates.length
                ===
                0
                &&
                <div className="comparison-selector-empty">

                    No researcher candidates found.

                </div>
            }


            {
                data
                &&
                data.candidates.length
                >
                0
                &&
                <div className="comparison-candidate-list">

                    {
                        data.candidates.map(
                            candidate => (

                                <button
                                    key={
                                        candidate.openAlexId
                                    }
                                    type="button"
                                    className="comparison-candidate-option"
                                    onClick={() =>
                                        handleCandidateSelect(
                                            candidate
                                        )
                                    }
                                >

                                    <span>

                                        {
                                            candidate.displayName
                                        }

                                    </span>


                                    {
                                        candidate.institution
                                        &&
                                        <small>

                                            {
                                                candidate.institution
                                            }

                                        </small>
                                    }


                                    <small>

                                        {
                                            candidate
                                                .worksCount
                                                .toLocaleString()
                                        }

                                        {" "}

                                        works

                                        {" · "}

                                        {
                                            candidate
                                                .citedByCount
                                                .toLocaleString()
                                        }

                                        {" "}

                                        citations

                                    </small>

                                </button>

                            )
                        )
                    }

                </div>
            }

        </div>

    );

}


function getGraphSummary(
    graph:
        OpenAlexAuthorGraphDto
) {

    const sortedItems =
        [
            ...graph.items
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


    const groupedTotal =
        graph.items.reduce(
            (
                total,
                item
            ) =>
                total
                +
                item.count,
            0
        );


    const leadingItem =
        sortedItems[0]
        ??
        null;


    return {

        groupedTotal,

        leadingItem

    };

}


export default function ResearcherComparison() {

    const [
        slots,
        setSlots
    ] = useState<
        ResearcherSlotValue[]
    >(
        [
            {
                id:
                    1,

                candidate:
                    null
            },

            {
                id:
                    2,

                candidate:
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
        mode,
        setMode
    ] = useState<
        OpenAlexGraphMode
    >(
        OpenAlexGraphModes.Year
    );


    const [
        appliedFilters,
        setAppliedFilters
    ] = useState<AuthorGraphFilterValues>(
        createEmptyAuthorGraphFilterValues()
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

        loadAuthorsGraph,

        resetAuthorsGraph

    } = useAuthorsGraph();


    const selectedResearchers =
        useMemo(
            () =>
                slots
                    .map(
                        slot =>
                            slot.candidate
                    )
                    .filter(
                        (
                            candidate
                        ): candidate is AuthorCandidate =>
                            candidate
                            !==
                            null
                    ),
            [
                slots
            ]
        );


    const selectedResearcherIdsKey =
        useMemo(
            () =>
                slots
                    .map(
                        slot =>
                            slot.candidate
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

            const selectedResearcherIds =
                selectedResearcherIdsKey
                    ? selectedResearcherIdsKey.split(
                        "|"
                    )
                    : [];


            if (
                selectedResearcherIds.length
                <
                2
            ) {

                resetAuthorsGraph();

                return;

            }


            void loadAuthorsGraph(
                {

                    openAlexAuthorIds:
                        selectedResearcherIds,

                    startDate:
                        appliedFilters.startDate
                        ||
                        undefined,

                    endDate:
                        appliedFilters.endDate
                        ||
                        undefined,

                    openAlexInstitutionIds:
                        appliedFilters.institutions.map(
                            institution =>
                                institution.openAlexId
                        ),

                    openAlexFieldIds:
                        appliedFilters.fields.map(
                            field =>
                                field.openAlexId
                        ),

                    openAlexSubFieldIds:
                        appliedFilters.subFields.map(
                            subField =>
                                subField.openAlexId
                        ),

                    types:
                        appliedFilters.types.map(
                            type =>
                                type.key
                        ),

                    mode

                }
            );

        },
        [
            selectedResearcherIdsKey,
            mode,
            appliedFilters,
            loadAuthorsGraph,
            resetAuthorsGraph
        ]
    );


    function handleAddResearcher() {

        if (
            slots.length
            >=
            MAX_RESEARCHERS
        ) {

            return;

        }


        setSlots(
            current => [
                ...current,
                {
                    id:
                        nextSlotId,

                    candidate:
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


    function handleSelectResearcher(
        slotId:
            number,
        candidate:
            AuthorCandidate
    ) {

        const alreadySelected =
            slots.some(
                slot =>
                    slot.candidate
                        ?.openAlexId
                    ===
                    candidate.openAlexId
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
                        "This researcher is already selected in another slot."

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

                                candidate
                            }
                            : slot
                )
        );

    }


    function handleRemoveResearcher(
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

                                    candidate:
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


    function handleClearFilters() {

        setAppliedFilters(
            createEmptyAuthorGraphFilterValues()
        );

    }


    return (

        <div className="comparison-workspace">

            <div className="comparison-workspace-header">

                <div>

                    <span className="comparison-workspace-icon">

                        <FaChartLine />

                    </span>


                    <div>

                        <span className="section-kicker">

                            RESEARCHER COMPARISON

                        </span>


                        <h3>

                            Compare researchers

                        </h3>


                        <p>

                            Select between two and four
                            researchers, then apply one shared
                            set of filters to every researcher.

                        </p>

                    </div>

                </div>

            </div>


            <div className="comparison-selectors">

                {
                    slots.map(
                        slot => (

                            <ResearcherSelector
                                key={
                                    slot.id
                                }
                                slotId={
                                    slot.id
                                }
                                selectedCandidate={
                                    slot.candidate
                                }
                                onSelect={
                                    handleSelectResearcher
                                }
                                onRemove={
                                    handleRemoveResearcher
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
                MAX_RESEARCHERS
                &&
                <button
                    type="button"
                    className="comparison-add-button"
                    onClick={
                        handleAddResearcher
                    }
                >

                    <FaPlus />

                    Add researcher

                </button>
            }


            {
                selectedResearchers.length
                <
                2
                &&
                <div className="comparison-ready-state">

                    Select at least two researchers
                    to generate the comparison.

                </div>
            }


            {
                selectedResearchers.length
                >=
                2
                &&
                <div className="comparison-result">

                    <div className="comparison-shared-filters">

                        <AuthorGraphFilters
                            value={
                                appliedFilters
                            }
                            onApply={
                                setAppliedFilters
                            }
                            onClear={
                                handleClearFilters
                            }
                        />

                    </div>


                    <AuthorGraph
                        data={
                            data
                        }
                        mode={
                            mode
                        }
                        onModeChange={
                            setMode
                        }
                        isLoading={
                            isLoading
                        }
                        error={
                            error
                        }
                    />


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
                                            getGraphSummary(
                                                graph
                                            );


                                        return (

                                            <article
                                                key={
                                                    graph.openAlexAuthorId
                                                }
                                                className="comparison-summary-card"
                                            >

                                                <span>

                                                    Researcher

                                                </span>


                                                <h4>

                                                    {
                                                        graph.authorDisplayName
                                                    }

                                                </h4>


                                                <dl>

                                                    <div>

                                                        <dt>

                                                            Grouped count

                                                        </dt>


                                                        <dd>

                                                            {
                                                                summary
                                                                    .groupedTotal
                                                                    .toLocaleString()
                                                            }

                                                        </dd>

                                                    </div>


                                                    <div>

                                                        <dt>

                                                            Leading category

                                                        </dt>


                                                        <dd>

                                                            {
                                                                summary
                                                                    .leadingItem
                                                                    ?.displayName
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
                                                                    .leadingItem
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
