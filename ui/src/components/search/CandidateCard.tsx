import {
    FaArrowRight,
    FaBuildingColumns,
    FaCircleInfo,
    FaFileLines,
    FaQuoteRight
} from "react-icons/fa6";

import type {
    AuthorCandidate
} from "../../features/search/types/search-ui.types";


interface CandidateCardProps {

    candidate:
    AuthorCandidate;

    isSelected:
    boolean;

    onSelect: (
        candidate:
            AuthorCandidate
    ) => void;

    onViewInfo: (
        candidate:
            AuthorCandidate
    ) => void;

}


function getInitials(
    name:
        string
) {

    const parts =
        name
            .trim()
            .split(
                /\s+/
            )
            .filter(
                Boolean
            );


    if (
        parts.length === 0
    ) {

        return "?";

    }


    if (
        parts.length === 1
    ) {

        return parts[0]
            .slice(
                0,
                2
            )
            .toUpperCase();

    }


    return (
        parts[0][0]
        +
        parts[
        parts.length - 1
        ][0]
    )
        .toUpperCase();

}


export default function CandidateCard({
    candidate,
    isSelected,
    onSelect,
    onViewInfo
}: CandidateCardProps) {

    return (

        <article
            className={
                isSelected
                    ? "candidate-card selected"
                    : "candidate-card"
            }
        >

            <div className="candidate-card-main">

                <div className="candidate-avatar">

                    {
                        getInitials(
                            candidate.displayName
                        )
                    }

                </div>


                <div className="candidate-info">

                    <div className="candidate-heading">

                        <div>

                            <span className="candidate-label">

                                RESEARCHER

                            </span>


                            <h3>

                                {
                                    candidate.displayName
                                }

                            </h3>

                        </div>


                        {
                            candidate.orcid
                            &&
                            <span className="candidate-orcid">

                                ORCID

                                <strong>

                                    {
                                        candidate.orcid
                                    }

                                </strong>

                            </span>
                        }

                    </div>


                    {
                        candidate.institution
                        &&
                        <div className="candidate-institution">

                            <FaBuildingColumns />


                            <span>

                                {
                                    candidate.institution
                                }

                            </span>

                        </div>
                    }


                    <div className="candidate-metrics">

                        <span>

                            <FaFileLines />


                            <strong>

                                {
                                    candidate
                                        .worksCount
                                        .toLocaleString()
                                }

                            </strong>

                            Works

                        </span>


                        <span>

                            <FaQuoteRight />


                            <strong>

                                {
                                    candidate
                                        .citedByCount
                                        .toLocaleString()
                                }

                            </strong>

                            Citations

                        </span>

                    </div>


                    <div className="candidate-openalex-id">

                        OpenAlex ID:

                        <code>

                            {
                                candidate.openAlexId
                            }

                        </code>

                    </div>

                </div>

            </div>


            <div className="candidate-card-actions">

                <button
                    type="button"
                    className="candidate-info-button"
                    onClick={() =>
                        onViewInfo(
                            candidate
                        )
                    }
                >

                    <FaCircleInfo />

                    Author info

                </button>


                <button
                    type="button"
                    className="candidate-select-button"
                    onClick={() =>
                        onSelect(
                            candidate
                        )
                    }
                >

                    {
                        isSelected
                            ? "Selected"
                            : "View works"
                    }

                    <FaArrowRight />

                </button>

            </div>

        </article>

    );

}