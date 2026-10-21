import {
    useEffect,
    useMemo,
    useState
} from "react";

import AuthorGraph
    from "./AuthorGraph";

import AuthorGraphFilters
    from "./AuthorGraphFilters";

import useAuthorsGraph
    from "../../features/search/hooks/useAuthorsGraph";

import {
    OpenAlexGraphModes
} from "../../features/search/types/search-ui.types";

import type {
    OpenAlexGraphMode
} from "../../features/search/types/search-ui.types";

import {
    createEmptyAuthorGraphFilterValues,
    type AuthorGraphFilterValues
} from "../../features/search/types/author-graph-ui.types";


interface AuthorGraphSectionProps {

    authorId:
    string;

}


function hasGraphFilters(
    filters:
        AuthorGraphFilterValues
): boolean {

    return Boolean(
        filters.startDate
        ||
        filters.endDate
        ||
        filters.institutions.length
        ||
        filters.fields.length
        ||
        filters.subFields.length
        ||
        filters.types.length
    );

}


export default function AuthorGraphSection({
    authorId
}: AuthorGraphSectionProps) {

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
    ] = useState<
        AuthorGraphFilterValues
    >(
        createEmptyAuthorGraphFilterValues()
    );


    const {

        data,

        isLoading,

        error,

        loadAuthorsGraph,

        resetAuthorsGraph

    } = useAuthorsGraph();


    const normalizedAuthorId =
        authorId.trim();


    useEffect(
        () => {

            setMode(
                OpenAlexGraphModes.Year
            );


            setAppliedFilters(
                createEmptyAuthorGraphFilterValues()
            );


            resetAuthorsGraph();

        },
        [
            normalizedAuthorId,
            resetAuthorsGraph
        ]
    );


    useEffect(
        () => {

            if (
                !normalizedAuthorId
            ) {

                resetAuthorsGraph();

                return;

            }


            void loadAuthorsGraph(
                {

                    openAlexAuthorIds:
                        [
                            normalizedAuthorId
                        ],

                    startDate:
                        appliedFilters.startDate
                        ||
                        undefined,

                    endDate:
                        appliedFilters.endDate
                        ||
                        undefined,

                    openAlexInstitutionIds:
                        appliedFilters
                            .institutions
                            .map(
                                institution =>
                                    institution.openAlexId
                            ),

                    openAlexFieldIds:
                        appliedFilters
                            .fields
                            .map(
                                field =>
                                    field.openAlexId
                            ),

                    openAlexSubFieldIds:
                        appliedFilters
                            .subFields
                            .map(
                                subField =>
                                    subField.openAlexId
                            ),

                    types:
                        appliedFilters
                            .types
                            .map(
                                type =>
                                    type.key
                            ),

                    mode

                }
            );

        },
        [
            normalizedAuthorId,
            appliedFilters,
            mode,
            loadAuthorsGraph,
            resetAuthorsGraph
        ]
    );


    const filterSummary =
        useMemo(
            () => {

                const values:
                    string[] = [];


                if (
                    appliedFilters.startDate
                    ||
                    appliedFilters.endDate
                ) {

                    const start =
                        appliedFilters.startDate
                        ||
                        "Any date";


                    const end =
                        appliedFilters.endDate
                        ||
                        "Present";


                    values.push(
                        `${start} → ${end}`
                    );

                }


                if (
                    appliedFilters
                        .institutions
                        .length
                    >
                    0
                ) {

                    values.push(
                        appliedFilters
                            .institutions
                            .map(
                                institution =>
                                    institution.displayName
                            )
                            .join(
                                ", "
                            )
                    );

                }


                if (
                    appliedFilters
                        .fields
                        .length
                    >
                    0
                ) {

                    values.push(
                        appliedFilters
                            .fields
                            .map(
                                field =>
                                    `Field: ${field.displayName}`
                            )
                            .join(
                                ", "
                            )
                    );

                }


                if (
                    appliedFilters
                        .subFields
                        .length
                    >
                    0
                ) {

                    values.push(
                        appliedFilters
                            .subFields
                            .map(
                                subField =>
                                    `Subfield: ${subField.displayName}`
                            )
                            .join(
                                ", "
                            )
                    );

                }


                if (
                    appliedFilters
                        .types
                        .length
                    >
                    0
                ) {

                    values.push(
                        appliedFilters
                            .types
                            .map(
                                type =>
                                    type.value
                            )
                            .join(
                                ", "
                            )
                    );

                }


                return values;

            },
            [
                appliedFilters
            ]
        );


    function handleApply(
        filters:
            AuthorGraphFilterValues
    ) {

        setAppliedFilters(
            {

                startDate:
                    filters.startDate,

                endDate:
                    filters.endDate,

                institutions:
                    [
                        ...filters.institutions
                    ],

                fields:
                    [
                        ...filters.fields
                    ],

                subFields:
                    [
                        ...filters.subFields
                    ],

                types:
                    [
                        ...filters.types
                    ]

            }
        );

    }


    function handleClear() {

        setAppliedFilters(
            createEmptyAuthorGraphFilterValues()
        );

    }


    function handleModeChange(
        selectedMode:
            OpenAlexGraphMode
    ) {

        setMode(
            selectedMode
        );

    }


    return (

        <section className="author-graph-section">

            <div className="author-graph-section-heading">

                <div>

                    <span className="section-kicker">

                        RESEARCH ANALYTICS

                    </span>


                    <h2>

                        Research activity

                    </h2>


                    <p>

                        Analyze this researcher's publications
                        separately from the publication results below.

                    </p>

                </div>

            </div>


            <AuthorGraphFilters
                value={
                    appliedFilters
                }
                onApply={
                    handleApply
                }
                onClear={
                    handleClear
                }
            />


            {
                hasGraphFilters(
                    appliedFilters
                )
                &&
                filterSummary.length
                >
                0
                &&
                <div className="author-graph-active-filters">

                    <span>

                        Graph scope

                    </span>


                    <div>

                        {
                            filterSummary.map(
                                (
                                    value,
                                    index
                                ) => (

                                    <span
                                        key={
                                            `${value}-${index}`
                                        }
                                    >

                                        {
                                            value
                                        }

                                    </span>

                                )
                            )
                        }

                    </div>

                </div>
            }


            <AuthorGraph
                data={
                    data
                }
                mode={
                    mode
                }
                onModeChange={
                    handleModeChange
                }
                isLoading={
                    isLoading
                }
                error={
                    error
                }
            />

        </section>

    );

}