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
    OpenAlexWork,
    OpenAlexWorksSearchRequest,
    PagedResultDto,
    WorksSortMode
} from "../types/search-ui.types";


interface UseWorksSearchResult {

    data:
    PagedResultDto<OpenAlexWork> | null;

    isLoading:
    boolean;

    error:
    string | null;

    searchWorks: (
        request:
            OpenAlexWorksSearchRequest,
        sortMode:
            WorksSortMode
    ) => Promise<void>;

    resetWorks:
    () => void;

}


function createWorksRequestKey(
    request:
        OpenAlexWorksSearchRequest,
    sortMode:
        WorksSortMode
): string {

    return JSON.stringify(
        {

            ...request,

            openAlexFieldIds:
                [
                    ...(
                        request
                            .openAlexFieldIds
                        ??
                        []
                    )
                ]
                    .sort(),

            openAlexSubFieldIds:
                [
                    ...(
                        request
                            .openAlexSubFieldIds
                        ??
                        []
                    )
                ]
                    .sort(),

            openAlexTopicIds:
                [
                    ...(
                        request
                            .openAlexTopicIds
                        ??
                        []
                    )
                ]
                    .sort(),

            openAlexKeywordIds:
                [
                    ...(
                        request
                            .openAlexKeywordIds
                        ??
                        []
                    )
                ]
                    .sort(),

            openAlexInstitutionIds:
                [
                    ...(
                        request
                            .openAlexInstitutionIds
                        ??
                        []
                    )
                ]
                    .sort(),

            types:
                [
                    ...(
                        request
                            .types
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
                    ),

            sortMode

        }
    );

}


const inFlightWorksRequests =
    new Map<
        string,
        Promise<
            PagedResultDto<OpenAlexWork>
        >
    >();


function getWorksRequest(
    request:
        OpenAlexWorksSearchRequest,
    sortMode:
        WorksSortMode
): Promise<
    PagedResultDto<OpenAlexWork>
> {

    const requestKey =
        createWorksRequestKey(
            request,
            sortMode
        );


    const existingRequest =
        inFlightWorksRequests.get(
            requestKey
        );


    if (
        existingRequest
    ) {

        return existingRequest;

    }


    const worksRequest =
        searchService.searchWorks(
            {
                request,

                sortMode
            }
        );


    inFlightWorksRequests.set(
        requestKey,
        worksRequest
    );


    void worksRequest.finally(
        () => {

            if (
                inFlightWorksRequests.get(
                    requestKey
                )
                ===
                worksRequest
            ) {

                inFlightWorksRequests.delete(
                    requestKey
                );

            }

        }
    );


    return worksRequest;

}


export default function useWorksSearch():
    UseWorksSearchResult {

    const [
        data,
        setData
    ] = useState<
        PagedResultDto<OpenAlexWork> | null
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


    const activeRequestIdRef =
        useRef(
            0
        );


    const mountedRef =
        useRef(
            true
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


    const resetWorks =
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


    const searchWorks =
        useCallback(
            async (
                request:
                    OpenAlexWorksSearchRequest,
                sortMode:
                    WorksSortMode
            ) => {

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
                        await getWorksRequest(
                            request,
                            sortMode
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
            []
        );


    return {

        data,

        isLoading,

        error,

        searchWorks,

        resetWorks

    };

}