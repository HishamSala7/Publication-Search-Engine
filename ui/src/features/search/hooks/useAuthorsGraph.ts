import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    getErrorMessage
} from "../../../services/error-handler";

import {
    searchService
} from "../services/search.service";

import type {
    OpenAlexAuthorGraphDto,
    OpenAlexAuthorsGraphSearchRequest
} from "../types/search-ui.types";


interface UseAuthorsGraphResult {

    data:
    OpenAlexAuthorGraphDto[] | null;

    isLoading:
    boolean;

    error:
    string | null;

    loadAuthorsGraph: (
        request:
            OpenAlexAuthorsGraphSearchRequest
    ) => Promise<void>;

    resetAuthorsGraph:
    () => void;

}


const inFlightAuthorGraphRequests =
    new Map<
        string,
        Promise<OpenAlexAuthorGraphDto[]>
    >();


function normalizeArray(
    values:
        readonly string[] | undefined
): string[] {

    return [
        ...(
            values
            ??
            []
        )
    ]
        .map(
            value =>
                value.trim()
        )
        .filter(
            Boolean
        )
        .sort(
            (
                first,
                second
            ) =>
                first.localeCompare(
                    second,
                    undefined,
                    {
                        sensitivity:
                            "base"
                    }
                )
        );

}


function createRequestKey(
    request:
        OpenAlexAuthorsGraphSearchRequest
): string {

    return JSON.stringify({

        openAlexAuthorIds:
            normalizeArray(
                request.openAlexAuthorIds
            ),

        startDate:
            request.startDate
            ??
            "",

        endDate:
            request.endDate
            ??
            "",

        openAlexInstitutionIds:
            normalizeArray(
                request.openAlexInstitutionIds
            ),

        openAlexFieldIds:
            normalizeArray(
                request.openAlexFieldIds
            ),

        openAlexSubFieldIds:
            normalizeArray(
                request.openAlexSubFieldIds
            ),

        types:
            [
                ...(
                    request.types
                    ??
                    []
                )
            ]
                .sort(
                    (
                        first,
                        second
                    ) =>
                        first - second
                ),

        mode:
            request.mode

    });

}


function getAuthorsGraphRequest(
    request:
        OpenAlexAuthorsGraphSearchRequest
): Promise<OpenAlexAuthorGraphDto[]> {

    const requestKey =
        createRequestKey(
            request
        );


    const existingRequest =
        inFlightAuthorGraphRequests.get(
            requestKey
        );


    if (
        existingRequest
    ) {

        return existingRequest;

    }


    const graphRequest =
        searchService.getAuthorsGraph({
            request
        });


    inFlightAuthorGraphRequests.set(
        requestKey,
        graphRequest
    );


    const removeRequest =
        () => {

            if (
                inFlightAuthorGraphRequests.get(
                    requestKey
                )
                ===
                graphRequest
            ) {

                inFlightAuthorGraphRequests.delete(
                    requestKey
                );

            }

        };


    void graphRequest.then(
        removeRequest,
        removeRequest
    );


    return graphRequest;

}


export default function useAuthorsGraph():
    UseAuthorsGraphResult {

    const [
        data,
        setData
    ] = useState<
        OpenAlexAuthorGraphDto[] | null
    >(
        null
    );


    const [
        isLoading,
        setIsLoading
    ] = useState(
        false
    );


    const [
        error,
        setError
    ] = useState<
        string | null
    >(
        null
    );


    const mountedRef =
        useRef(
            true
        );


    const activeRequestIdRef =
        useRef(
            0
        );


    useEffect(
        () => {

            mountedRef.current =
                true;


            return () => {

                mountedRef.current =
                    false;

                activeRequestIdRef.current +=
                    1;

            };

        },
        []
    );


    const resetAuthorsGraph =
        useCallback(
            () => {

                activeRequestIdRef.current +=
                    1;


                setData(
                    null
                );


                setError(
                    null
                );


                setIsLoading(
                    false
                );

            },
            []
        );


    const loadAuthorsGraph =
        useCallback(
            async (
                request:
                    OpenAlexAuthorsGraphSearchRequest
            ) => {

                const authorIds =
                    normalizeArray(
                        request.openAlexAuthorIds
                    );


                if (
                    authorIds.length === 0
                ) {

                    resetAuthorsGraph();

                    return;

                }


                const requestId =
                    activeRequestIdRef.current
                    +
                    1;


                activeRequestIdRef.current =
                    requestId;


                setIsLoading(
                    true
                );


                setError(
                    null
                );


                try {

                    const result =
                        await getAuthorsGraphRequest(
                            {
                                ...request,

                                openAlexAuthorIds:
                                    authorIds
                            }
                        );


                    if (
                        !mountedRef.current
                        ||
                        requestId
                        !==
                        activeRequestIdRef.current
                    ) {

                        return;

                    }


                    setData(
                        result
                    );

                }
                catch (
                requestError
                ) {

                    if (
                        !mountedRef.current
                        ||
                        requestId
                        !==
                        activeRequestIdRef.current
                    ) {

                        return;

                    }


                    setData(
                        null
                    );


                    setError(
                        getErrorMessage(
                            requestError
                        )
                    );

                }
                finally {

                    if (
                        mountedRef.current
                        &&
                        requestId
                        ===
                        activeRequestIdRef.current
                    ) {

                        setIsLoading(
                            false
                        );

                    }

                }

            },
            [
                resetAuthorsGraph
            ]
        );


    return {

        data,

        isLoading,

        error,

        loadAuthorsGraph,

        resetAuthorsGraph

    };

}