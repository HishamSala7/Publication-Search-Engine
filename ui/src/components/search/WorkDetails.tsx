import {
    FaArrowUpRightFromSquare,
    FaFileLines,
    FaQuoteRight
} from "react-icons/fa6";

import type {
    OpenAlexWork
} from "../../features/search/types/search-ui.types";

import {
    getDoiUrl,
    normalizeDoi,
    rebuildAbstract
} from "../../features/search/utils/openalex";


interface WorkDetailsProps {

    work: OpenAlexWork;

}


export default function WorkDetails({
    work
}: WorkDetailsProps) {

    const abstract =
        rebuildAbstract(
            work.abstract_inverted_index
        );


    const doi =
        normalizeDoi(
            work.doi
        );


    const doiUrl =
        getDoiUrl(
            work.doi
        );


    const source =
        work
            .primary_location
            ?.source
            ?.display_name;


    return (

        <article className="work-details-card">

            <div className="work-details-header">

                <div className="work-details-icon">

                    <FaFileLines />

                </div>


                <div>

                    <span className="section-kicker">

                        PUBLICATION DETAILS

                    </span>


                    <h2>

                        {
                            work.title
                            ??
                            "Untitled publication"
                        }

                    </h2>

                </div>


                {
                    work
                        .primary_location
                        ?.is_oa
                    ===
                    true
                    &&
                    <span className="open-access-badge">

                        Open access

                    </span>
                }

            </div>


            <div className="work-details-meta">

                <div>

                    <span>

                        Publication date

                    </span>


                    <strong>

                        {
                            work
                                .publication_date
                            ??
                            "Not available"
                        }

                    </strong>

                </div>


                <div>

                    <span>

                        Publication year

                    </span>


                    <strong>

                        {
                            work
                                .publication_year
                            ??
                            "Not available"
                        }

                    </strong>

                </div>


                <div>

                    <span>

                        Citations

                    </span>


                    <strong>

                        <FaQuoteRight />

                        {
                            (
                                work
                                    .cited_by_count
                                ??
                                0
                            )
                                .toLocaleString()
                        }

                    </strong>

                </div>


                <div>

                    <span>

                        Source

                    </span>


                    <strong>

                        {
                            source
                            ??
                            "Not available"
                        }

                    </strong>

                </div>

            </div>


            {
                doi
                &&
                <section className="work-details-section">

                    <h3>

                        DOI

                    </h3>


                    <div className="work-details-doi">

                        <code>

                            {doi}

                        </code>


                        {
                            doiUrl
                            &&
                            <a
                                href={doiUrl}
                                target="_blank"
                                rel="noreferrer"
                            >

                                Open DOI

                                <FaArrowUpRightFromSquare />

                            </a>
                        }

                    </div>

                </section>
            }


            {
                work.authorships
                &&
                work.authorships.length
                >
                0
                &&
                <section className="work-details-section">

                    <h3>

                        Authors

                    </h3>


                    <div className="work-detail-authors">

                        {
                            work.authorships.map(
                                (
                                    authorship,
                                    index
                                ) => {

                                    const author =
                                        authorship.author;


                                    if (!author) {

                                        return null;

                                    }


                                    return (

                                        <div
                                            className="work-detail-author"
                                            key={
                                                author.id
                                                ??
                                                `${author.display_name}-${index}`
                                            }
                                        >

                                            <strong>

                                                {
                                                    author
                                                        .display_name
                                                    ??
                                                    "Unknown author"
                                                }

                                            </strong>


                                            {
                                                authorship
                                                    .author_position
                                                &&
                                                <span>

                                                    {
                                                        authorship
                                                            .author_position
                                                    }

                                                </span>
                                            }


                                            {
                                                author.orcid
                                                &&
                                                <small>

                                                        {
                                                            author.orcid.replace(
                                                                /^https?:\/\/orcid\.org\//i,
                                                                ""
                                                            )
                                                        }

                                                </small>
                                            }

                                        </div>

                                    );

                                }
                            )
                        }

                    </div>

                </section>
            }


            <section className="work-details-section">

                <h3>

                    Abstract

                </h3>


                <p className="work-details-abstract">

                    {
                        abstract
                        ||
                        "No abstract is available for this publication."
                    }

                </p>

            </section>


            {
                work
                    .primary_location
                    ?.landing_page_url
                &&
                <div className="work-details-actions">

                    <a
                        href={
                            work
                                .primary_location
                                .landing_page_url
                        }
                        target="_blank"
                        rel="noreferrer"
                    >

                        View publication source

                        <FaArrowUpRightFromSquare />

                    </a>

                </div>
            }

        </article>

    );

}