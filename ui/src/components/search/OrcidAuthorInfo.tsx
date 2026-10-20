import {
    useEffect,
    useMemo,
    useState
} from "react";

import AuthorInfoContent
    from "./AuthorInfoContent";

import AuthorGraphSection
    from "./AuthorGraphSection";

import useAuthorInfo
    from "../../features/search/hooks/useAuthorInfo";

import type {
    OpenAlexAuthor,
    OpenAlexWork
} from "../../features/search/types/search-ui.types";


interface OrcidAuthorInfoProps {

    orcid:
    string;

    works:
    OpenAlexWork[];

    isWorksLoading:
    boolean;

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
        )
        .toLowerCase();

}


function findAuthorByOrcid(
    works:
        OpenAlexWork[],
    orcid:
        string
): OpenAlexAuthor | null {

    const normalizedOrcid =
        normalizeOrcid(
            orcid
        );


    if (
        !normalizedOrcid
    ) {

        return null;

    }


    for (
        const work
        of
        works
    ) {

        for (
            const authorship
            of
            work.authorships
            ??
            []
        ) {

            const author =
                authorship.author;


            if (
                !author
            ) {

                continue;

            }


            if (
                normalizeOrcid(
                    author.orcid
                )
                ===
                normalizedOrcid
            ) {

                return author;

            }

        }

    }


    return null;

}


export default function OrcidAuthorInfo({
    orcid,
    works,
    isWorksLoading
}: OrcidAuthorInfoProps) {

    const normalizedOrcid =
        useMemo(
            () =>
                normalizeOrcid(
                    orcid
                ),
            [
                orcid
            ]
        );


    const matchedAuthor =
        useMemo(
            () =>
                findAuthorByOrcid(
                    works,
                    normalizedOrcid
                ),
            [
                works,
                normalizedOrcid
            ]
        );


    const [
        resolvedAuthorId,
        setResolvedAuthorId
    ] = useState<
        string | null
    >(
        null
    );


    const [
        resolvedDisplayName,
        setResolvedDisplayName
    ] = useState<
        string | null
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


    /*
        Reset the previously resolved author whenever
        the requested ORCID changes.
    */
    useEffect(
        () => {

            setResolvedAuthorId(
                null
            );


            setResolvedDisplayName(
                null
            );


            resetAuthorInfo();

        },
        [
            normalizedOrcid,
            resetAuthorInfo
        ]
    );


    /*
        Resolve OpenAlex Author ID from the returned
        ORCID works.
    */
    useEffect(
        () => {

            const openAlexAuthorId =
                matchedAuthor
                    ?.id
                    ?.trim();


            if (
                !openAlexAuthorId
            ) {

                return;

            }


            setResolvedAuthorId(
                current =>
                    current
                    ??
                    openAlexAuthorId
            );


            const displayName =
                matchedAuthor
                    ?.display_name
                    ?.trim();


            if (
                displayName
            ) {

                setResolvedDisplayName(
                    current =>
                        current
                        ??
                        displayName
                );

            }

        },
        [
            matchedAuthor
        ]
    );


    /*
        Fetch full author information once the
        OpenAlex author ID has been resolved.
    */
    useEffect(
        () => {

            if (
                !resolvedAuthorId
            ) {

                return;

            }


            void loadAuthorInfo(
                resolvedAuthorId
            );

        },
        [
            resolvedAuthorId,
            loadAuthorInfo
        ]
    );


    if (
        !normalizedOrcid
    ) {

        return null;

    }


    if (
        isWorksLoading
        &&
        !resolvedAuthorId
    ) {

        return (

            <div className="search-context-card">

                <span className="search-context-label">

                    ORCID AUTHOR

                </span>


                <h3>

                    Resolving researcher information...

                </h3>


                <p>

                    The researcher profile will appear
                    here as soon as the OpenAlex author
                    is resolved from the ORCID results.

                </p>


                <div className="search-context-meta">

                    ORCID:

                    {" "}

                    <strong>

                        {
                            normalizedOrcid
                        }

                    </strong>

                </div>

            </div>

        );

    }


    if (
        !resolvedAuthorId
    ) {

        return (

            <div className="search-context-card">

                <span className="search-context-label">

                    ORCID SEARCH

                </span>


                <h3>

                    Research works

                </h3>


                <p>

                    Publications associated with
                    this ORCID are shown below.

                    Author information will appear
                    when an OpenAlex author ID can
                    be resolved from the returned
                    publications.

                </p>


                <div className="search-context-meta">

                    ORCID:

                    {" "}

                    <strong>

                        {
                            normalizedOrcid
                        }

                    </strong>

                </div>

            </div>

        );

    }


    if (
        isAuthorInfoLoading
    ) {

        return (

            <div className="search-context-card">

                <span className="search-context-label">

                    ORCID AUTHOR

                </span>


                <h3>

                    {
                        resolvedDisplayName
                        ??
                        "Loading researcher information..."
                    }

                </h3>


                <p>

                    Retrieving the researcher profile
                    and authorship statistics.

                </p>


                <div className="search-context-meta">

                    ORCID:

                    {" "}

                    <strong>

                        {
                            normalizedOrcid
                        }

                    </strong>

                </div>

            </div>

        );

    }


    if (
        authorInfoError
    ) {

        return (

            <div className="search-context-card">

                <span className="search-context-label">

                    ORCID AUTHOR

                </span>


                <h3>

                    {
                        resolvedDisplayName
                        ??
                        "Researcher information"
                    }

                </h3>


                <p>

                    {
                        authorInfoError
                    }

                </p>


                <div className="search-context-meta">

                    ORCID:

                    {" "}

                    <strong>

                        {
                            normalizedOrcid
                        }

                    </strong>

                </div>

            </div>

        );

    }


    if (
        !authorInfo
    ) {

        return null;

    }


    return (

        <>

            <div className="search-context-card">

                <span className="search-context-label">

                    ORCID AUTHOR

                </span>


                <h3>

                    {
                        authorInfo
                            .details
                            .display_name
                        ??
                        resolvedDisplayName
                        ??
                        "Researcher"
                    }

                </h3>


                <p>

                    Researcher information associated
                    with the supplied ORCID.

                </p>


                <AuthorInfoContent
                    details={
                        authorInfo.details
                    }
                    positionCounts={
                        authorInfo
                            .positionCounts
                    }
                    fallbackOpenAlexId={
                        resolvedAuthorId
                    }
                    fallbackOrcid={
                        normalizedOrcid
                    }
                />

            </div>


            <AuthorGraphSection
                authorId={
                    resolvedAuthorId
                }
            />

        </>

    );

}