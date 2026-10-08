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
    getWorkAuthorNames,
    normalizeDoi,
    rebuildAbstract
} from "../../features/search/utils/openalex";


interface WorkCardProps {

    work: OpenAlexWork;

}


export default function WorkCard({
    work
}: WorkCardProps) {

    const authors =
        getWorkAuthorNames(
            work
        );


    const abstract =
        rebuildAbstract(
            work.abstract_inverted_index
        );


    const abstractPreview =
        abstract.length
            >
            240
            ? `${abstract.slice(
                0,
                240
            )}...`
            : abstract;


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


    const publicationDate =
        work.publication_date
        ??
        work.publication_year
            ?.toString()
        ??
        "Not available";


    const displayedAuthors =
        authors.slice(
            0,
            4
        );


    const remainingAuthors =
        Math.max(
            0,
            authors.length - 4
        );


    return (

        <article className="work-card">

            <div className="work-card-icon">

                <FaFileLines />

            </div>


            <div className="work-card-content">

                <div className="work-card-top">

                    <div>

                        <span className="work-card-label">

                            PUBLICATION

                        </span>


                        <h3>

                            {
                                work.title
                                ??
                                "Untitled work"
                            }

                        </h3>

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


                <div className="work-card-meta">

                    <span>

                        Published

                        <strong>

                            {
                                publicationDate
                            }

                        </strong>

                    </span>


                    <span>

                        <FaQuoteRight />

                        Citations

                        <strong>

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

                    </span>


                    {
                        source
                        &&
                        <span>

                            Source

                            <strong>

                                {source}

                            </strong>

                        </span>
                    }

                </div>


                {
                    authors.length
                    >
                    0
                    &&
                    <div className="work-authors">

                        <span>

                            Authors

                        </span>


                        <p>

                            {
                                displayedAuthors
                                    .join(", ")
                            }

                            {
                                remainingAuthors
                                >
                                0
                                &&
                                ` +${remainingAuthors} more`
                            }

                        </p>

                    </div>
                }


                {
                    abstractPreview
                    &&
                    <p className="work-abstract">

                        {
                            abstractPreview
                        }

                    </p>
                }


                <div className="work-card-footer">

                    {
                        doi
                        &&
                        <div className="work-doi">

                            <span>

                                DOI

                            </span>


                            <code>

                                {doi}

                            </code>

                        </div>
                    }


                    <div className="work-links">

                        {
                            doiUrl
                            &&
                            <a
                                href={
                                    doiUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                            >

                                DOI

                                <FaArrowUpRightFromSquare />

                            </a>
                        }


                        {
                            work
                                .primary_location
                                ?.landing_page_url
                            &&
                            <a
                                href={
                                    work
                                        .primary_location
                                        .landing_page_url
                                }
                                target="_blank"
                                rel="noreferrer"
                            >

                                View source

                                <FaArrowUpRightFromSquare />

                            </a>
                        }

                    </div>

                </div>

            </div>

        </article>

    );

}