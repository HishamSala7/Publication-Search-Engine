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
    OpenAlexInstitutionMainGraphDto,
    OpenAlexInstitutionsGraphSearchRequest
} from "../types/search-ui.types";


interface UseInstitutionsGraphResult {

    data:
    OpenAlexInstitutionMainGraphDto[] | null;

    isLoading:
    boolean;

    error:
    string | null;

    loadInstitutionsGraph: (
        request:
            OpenAlexInstitutionsGraphSearchRequest
    ) => Promise<void>;

    resetInstitutionsGraph:
    () => void;

}


const inFlightInstitutionGraphRequests =
    new Map<
        string,
        Promise<OpenAlexInstitutionMainGraphDto[]>
    >();


function normalizeStringArray(
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
        OpenAlexInstitutionsGraphSearchRequest
): string {

    return JSON.stringify({

        openAlexInstitutionIds:
            normalizeStringArray(
                request.openAlexInstitutionIds
            ),

        startDate:
            request.startDate
            ??
            "",

        endDate:
            request.endDate
            ??
            "",

        openAlexFieldIds:
            normalizeStringArray(
                request.openAlexFieldIds
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
                        first
                        -
                        second
                )

    });

}


function getInstitutionsGraphRequest(
    request:
        OpenAlexInstitutionsGraphSearchRequest
): Promise<OpenAlexInstitutionMainGraphDto[]> {

    const requestKey =
        createRequestKey(
            request
        );


    const existingRequest =
        inFlightInstitutionGraphRequests.get(
            requestKey
        );


    if (
        existingRequest
    ) {

        return existingRequest;

    }


    const graphRequest =
        searchService.getInstitutionsGraph(
            {
                request
            }
        );


    inFlightInstitutionGraphRequests.set(
        requestKey,
        graphRequest
    );


    const removeRequest =
        () => {

            if (
                inFlightInstitutionGraphRequests.get(
                    requestKey
                )
                ===
                graphRequest
            ) {

                inFlightInstitutionGraphRequests.delete(
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


export default function useInstitutionsGraph():
    UseInstitutionsGraphResult {

    const [
        data,
        setData
    ] = useState<
        OpenAlexInstitutionMainGraphDto[] | null
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


    const resetInstitutionsGraph =
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


    const loadInstitutionsGraph =
        useCallback(
            async (
                request:
                    OpenAlexInstitutionsGraphSearchRequest
            ) => {

                const institutionIds =
                    normalizeStringArray(
                        request.openAlexInstitutionIds
                    );


                if (
                    institutionIds.length
                    ===
                    0
                ) {

                    resetInstitutionsGraph();

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
                        await getInstitutionsGraphRequest(
                            {

                                ...request,

                                openAlexInstitutionIds:
                                    institutionIds

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
                resetInstitutionsGraph
            ]
        );


    return {

        data,

        isLoading,

        error,

        loadInstitutionsGraph,

        resetInstitutionsGraph

    };

}