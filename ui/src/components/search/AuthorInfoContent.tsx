import {
    FaBuildingColumns,
    FaFileLines,
    FaQuoteRight
} from "react-icons/fa6";

import type {
    AuthorPositionCount,
    OpenAlexAuthorDetail
} from "../../features/search/types/search-ui.types";


interface AuthorInfoContentProps {

    details:
    OpenAlexAuthorDetail;

    positionCounts:
    AuthorPositionCount;

    fallbackOpenAlexId?:
    string | null;

    fallbackOrcid?:
    string | null;

}


function normalizeOrcid(
    value:
        string | null | undefined
): string {

    return (
        value
        ??
        ""
    )
        .trim()
        .replace(
            /^https?:\/\/orcid\.org\//i,
            ""
        );

}


export default function AuthorInfoContent({
    details,
    positionCounts,
    fallbackOpenAlexId,
    fallbackOrcid
}: AuthorInfoContentProps) {

    const institutions =
        details
            .last_known_institutions
        ??
        [];


    const topics =
        details
            .topics
        ??
        [];


    const countsByYear =
        details
            .counts_by_year
        ??
        [];


    const affiliations =
        details
            .affiliations
        ??
        [];


    const openAlexId =
        details.id
        ??
        fallbackOpenAlexId
        ??
        "Not available";


    const orcid =
        normalizeOrcid(
            details.orcid
        )
        ||
        normalizeOrcid(
            fallbackOrcid
        )
        ||
        "Not available";


    return (

        <div className="author-info-content">


            <div className="author-info-summary">

                <div>

                    <FaFileLines />


                    <span>

                        Works

                    </span>


                    <strong>

                        {
                            details
                                .works_count
                                .toLocaleString()
                        }

                    </strong>

                </div>


                <div>

                    <FaQuoteRight />


                    <span>

                        Citations

                    </span>


                    <strong>

                        {
                            details
                                .cited_by_count
                                .toLocaleString()
                        }

                    </strong>

                </div>

            </div>


            <section className="author-info-section">

                <h3>

                    Identity

                </h3>


                <dl className="author-info-list">

                    <div>

                        <dt>

                            OpenAlex ID

                        </dt>


                        <dd>

                            {
                                openAlexId
                            }

                        </dd>

                    </div>


                    <div>

                        <dt>

                            ORCID

                        </dt>


                        <dd>

                            {
                                orcid
                            }

                        </dd>

                    </div>

                </dl>

            </section>


            <section className="author-info-section">

                <h3>

                    Authorship position

                </h3>


                <div className="author-position-stats">

                    <div>

                        <strong>

                            {
                                positionCounts
                                    .firstPositionCount
                                    .toLocaleString()
                            }

                        </strong>


                        <span>

                            First author

                        </span>

                    </div>


                    <div>

                        <strong>

                            {
                                positionCounts
                                    .middlePositionCount
                                    .toLocaleString()
                            }

                        </strong>


                        <span>

                            Middle author

                        </span>

                    </div>


                    <div>

                        <strong>

                            {
                                positionCounts
                                    .lastPositionCount
                                    .toLocaleString()
                            }

                        </strong>


                        <span>

                            Last author

                        </span>

                    </div>

                </div>

            </section>


            {
                institutions.length
                >
                0
                &&
                <section className="author-info-section">

                    <h3>

                        Last known institutions

                    </h3>


                    <div className="author-institution-list">

                        {
                            institutions.map(
                                institution => (

                                    <div
                                        className="author-institution-item"
                                        key={
                                            institution.id
                                        }
                                    >

                                        <FaBuildingColumns />


                                        <span>

                                            {
                                                institution
                                                    .display_name
                                            }

                                        </span>

                                    </div>

                                )
                            )
                        }

                    </div>

                </section>
            }


            {
                topics.length
                >
                0
                &&
                <section className="author-info-section">

                    <h3>

                        Research topics

                    </h3>


                    <div className="author-topic-list">

                        {
                            topics.map(
                                (
                                    topic,
                                    index
                                ) => (

                                    <div
                                        className="author-topic-item"
                                        key={
                                            `${topic.display_name ?? "topic"}-${index}`
                                        }
                                    >

                                        <strong>

                                            {
                                                topic
                                                    .display_name
                                                ??
                                                "Unnamed topic"
                                            }

                                        </strong>


                                        {
                                            topic.count
                                            !==
                                            null
                                            &&
                                            topic.count
                                            !==
                                            undefined
                                            &&
                                            <span>

                                                {
                                                    topic
                                                        .count
                                                        .toLocaleString()
                                                }

                                                {" "}

                                                works

                                            </span>
                                        }


                                        {
                                            (
                                                topic
                                                    .field
                                                    ?.display_name
                                                ||
                                                topic
                                                    .subfield
                                                    ?.display_name
                                            )
                                            &&
                                            <small>

                                                {
                                                    [
                                                        topic
                                                            .field
                                                            ?.display_name,

                                                        topic
                                                            .subfield
                                                            ?.display_name
                                                    ]
                                                        .filter(
                                                            Boolean
                                                        )
                                                        .join(
                                                            " · "
                                                        )
                                                }

                                            </small>
                                        }

                                    </div>

                                )
                            )
                        }

                    </div>

                </section>
            }


            {
                countsByYear.length
                >
                0
                &&
                <section className="author-info-section">

                    <h3>

                        Recent activity

                    </h3>


                    <div className="author-year-list">

                        {
                            [
                                ...countsByYear
                            ]
                                .sort(
                                    (
                                        first,
                                        second
                                    ) =>
                                        second.year
                                        -
                                        first.year
                                )
                                .slice(
                                    0,
                                    5
                                )
                                .map(
                                    year => (

                                        <div
                                            className="author-year-item"
                                            key={
                                                year.year
                                            }
                                        >

                                            <strong>

                                                {
                                                    year.year
                                                }

                                            </strong>


                                            <span>

                                                {
                                                    year
                                                        .works_count
                                                        .toLocaleString()
                                                }

                                                {" "}

                                                works

                                            </span>


                                            <span>

                                                {
                                                    year
                                                        .cited_by_count
                                                        .toLocaleString()
                                                }

                                                {" "}

                                                citations

                                            </span>

                                        </div>

                                    )
                                )
                        }

                    </div>

                </section>
            }


            {
                affiliations.length
                >
                0
                &&
                <section className="author-info-section">

                    <h3>

                        Affiliations

                    </h3>


                    <div className="author-affiliation-list">

                        {
                            affiliations.map(
                                (
                                    affiliation,
                                    index
                                ) => {

                                    const institution =
                                        affiliation
                                            .institution;


                                    if (
                                        !institution
                                    ) {

                                        return null;

                                    }


                                    const years =
                                        affiliation
                                            .years
                                        ??
                                        [];


                                    return (

                                        <div
                                            className="author-affiliation-item"
                                            key={
                                                `${institution.id}-${index}`
                                            }
                                        >

                                            <FaBuildingColumns />


                                            <div>

                                                <strong>

                                                    {
                                                        institution
                                                            .display_name
                                                    }

                                                </strong>


                                                {
                                                    years.length
                                                    >
                                                    0
                                                    &&
                                                    <small>

                                                        {
                                                            [
                                                                ...years
                                                            ]
                                                                .sort(
                                                                    (
                                                                        first,
                                                                        second
                                                                    ) =>
                                                                        second
                                                                        -
                                                                        first
                                                                )
                                                                .join(
                                                                    ", "
                                                                )
                                                        }

                                                    </small>
                                                }

                                            </div>

                                        </div>

                                    );

                                }
                            )
                        }

                    </div>

                </section>
            }


        </div>

    );

}