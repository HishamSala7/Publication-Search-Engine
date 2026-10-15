import {
    useEffect,
    useState
} from "react";

import {
    FaCircleInfo,
    FaXmark
} from "react-icons/fa6";

import AuthorInfoContent
    from "./AuthorInfoContent";

import CandidateCard
    from "./CandidateCard";

import useAuthorInfo
    from "../../features/search/hooks/useAuthorInfo";

import type {
    AuthorCandidate
} from "../../features/search/types/search-ui.types";


interface CandidateListProps {

    searchedName:
    string;

    resolvedInstitution?:
    string | null;

    candidates:
    AuthorCandidate[];

    selectedCandidate:
    AuthorCandidate | null;

    onSelectCandidate: (
        candidate:
            AuthorCandidate
    ) => void;

}


export default function CandidateList({
    searchedName,
    resolvedInstitution,
    candidates,
    selectedCandidate,
    onSelectCandidate
}: CandidateListProps) {

    const [
        infoCandidate,
        setInfoCandidate
    ] = useState<
        AuthorCandidate | null
    >(
        null
    );


    const {

        data:
        authorInfo,

        isLoading:
        isAuthorInfoLoading,

        error:
        authorInfoError,

        loadAuthorInfo,

        resetAuthorInfo

    } = useAuthorInfo();


    useEffect(
        () => {

            if (
                !infoCandidate
            ) {

                return;

            }


            function handleKeyDown(
                event:
                    KeyboardEvent
            ) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    setInfoCandidate(
                        null
                    );


                    resetAuthorInfo();

                }

            }


            document.addEventListener(
                "keydown",
                handleKeyDown
            );


            return () => {

                document.removeEventListener(
                    "keydown",
                    handleKeyDown
                );

            };

        },
        [
            infoCandidate,
            resetAuthorInfo
        ]
    );


    function handleViewInfo(
        candidate:
            AuthorCandidate
    ) {

        setInfoCandidate(
            candidate
        );


        void loadAuthorInfo(
            candidate.openAlexId
        );

    }


    function handleCloseInfo() {

        setInfoCandidate(
            null
        );


        resetAuthorInfo();

    }


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
                                            onViewInfo={
                                                handleViewInfo
                                            }
                                        />

                                    )
                                )
                            }

                        </div>

                    )
            }


            {
                infoCandidate
                &&
                <div
                    className="author-info-modal-backdrop"
                    role="presentation"
                    onMouseDown={
                        event => {

                            if (
                                event.target
                                ===
                                event.currentTarget
                            ) {

                                handleCloseInfo();

                            }

                        }
                    }
                >

                    <div
                        className="author-info-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="author-info-title"
                    >

                        <div className="author-info-modal-header">

                            <div>

                                <span className="section-kicker">

                                    AUTHOR INFO

                                </span>


                                <h2 id="author-info-title">

                                    {
                                        authorInfo
                                            ?.details
                                            .display_name
                                        ??
                                        infoCandidate
                                            .displayName
                                    }

                                </h2>

                            </div>


                            <button
                                type="button"
                                className="author-info-close"
                                aria-label="Close author information"
                                onClick={
                                    handleCloseInfo
                                }
                            >

                                <FaXmark />

                            </button>

                        </div>


                        {
                            isAuthorInfoLoading
                            &&
                            <div className="author-info-state">

                                <strong>

                                    Loading author information...

                                </strong>

                            </div>
                        }


                        {
                            !isAuthorInfoLoading
                            &&
                            authorInfoError
                            &&
                            <div
                                className="
                                    author-info-state
                                    author-info-error
                                "
                            >

                                <strong>

                                    Author information could not be loaded.

                                </strong>


                                <p>

                                    {
                                        authorInfoError
                                    }

                                </p>

                            </div>
                        }


                        {
                            !isAuthorInfoLoading
                            &&
                            !authorInfoError
                            &&
                            authorInfo
                            &&
                            <AuthorInfoContent
                                details={
                                    authorInfo.details
                                }
                                positionCounts={
                                    authorInfo
                                        .positionCounts
                                }
                                fallbackOpenAlexId={
                                    infoCandidate
                                        .openAlexId
                                }
                                fallbackOrcid={
                                    infoCandidate
                                        .orcid
                                }
                            />
                        }

                    </div>

                </div>
            }


        </section>

    );

}