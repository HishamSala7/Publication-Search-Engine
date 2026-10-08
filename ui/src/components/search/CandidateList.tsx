import {
    FaCircleInfo
} from "react-icons/fa6";

import CandidateCard
    from "./CandidateCard";

import type {
    AuthorCandidate
} from "../../features/search/types/search-ui.types";


interface CandidateListProps {

    searchedName: string;

    resolvedInstitution?:
    string | null;

    candidates: AuthorCandidate[];

    selectedCandidate:
    AuthorCandidate | null;

    onSelectCandidate: (
        candidate: AuthorCandidate
    ) => void;

}


export default function CandidateList({
    searchedName,
    resolvedInstitution,
    candidates,
    selectedCandidate,
    onSelectCandidate
}: CandidateListProps) {

    return (

        <section className="candidate-section">


            <div className="candidate-section-header">

                <div>

                    <span className="section-kicker">

                        AUTHOR MATCHES

                    </span>


                    <h2>

                        Select the correct researcher.

                    </h2>


                    <p>

                        We found possible author matches
                        for

                        {" "}

                        <strong>

                            “{searchedName}”

                        </strong>

                        .

                    </p>

                </div>


                <div className="candidate-count">

                    <strong>

                        {
                            candidates.length
                        }

                    </strong>

                    <span>

                        {
                            candidates.length === 1
                                ? "candidate"
                                : "candidates"
                        }

                    </span>

                </div>

            </div>


            {
                resolvedInstitution
                &&
                <div className="resolved-institution">

                    <FaCircleInfo />


                    <div>

                        <span>

                            Institution resolved
                            from email

                        </span>


                        <strong>

                            {
                                resolvedInstitution
                            }

                        </strong>

                    </div>

                </div>
            }


            {
                candidates.length === 0
                    ? (

                        <div className="candidate-empty">

                            <h3>

                                No researchers found.

                            </h3>


                            <p>

                                Try changing the researcher
                                name or removing the optional
                                email address.

                            </p>

                        </div>

                    )
                    : (

                        <div className="candidate-list">

                            {
                                candidates.map(
                                    candidate => (

                                        <CandidateCard
                                            key={
                                                candidate.openAlexId
                                            }
                                            candidate={
                                                candidate
                                            }
                                            isSelected={
                                                selectedCandidate
                                                    ?.openAlexId
                                                ===
                                                candidate.openAlexId
                                            }
                                            onSelect={
                                                onSelectCandidate
                                            }
                                        />

                                    )
                                )
                            }

                        </div>

                    )
            }


        </section>

    );

}