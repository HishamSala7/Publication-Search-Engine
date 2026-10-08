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
    OpenAlexWork
} from "../types/search-ui.types";


interface UseWorkByDoiResult {

    data:
    OpenAlexWork | null;

    isLoading:
    boolean;

    error:
    string | null;

    searchWorkByDoi: (
        doi: string
    ) => Promise<void>;

    resetWorkByDoi:
    () => void;

}


const inFlightDoiRequests =
    new Map<
        string,
        Promise<OpenAlexWork>
    >();


function normalizeDoiKey(
    doi: string
): string {

    return doi
        .trim()
        .replace(
            /^https?:\/\/doi\.org\//i,
            ""
        )
        .toLowerCase();

}


function getDoiRequest(
    doi: string
): Promise<OpenAlexWork> {

    const requestKey =
        normalizeDoiKey(
            doi
        );


    const existingRequest =
        inFlightDoiRequests.get(
            requestKey
        );


    if (
        existingRequest
    ) {

        return existingRequest;

    }


    /*
        Do not pass AbortSignal here.

        OpenAlex calls can be relatively slow,
        and we don't want React cleanup/navigation
        to cancel the ASP.NET request and propagate
        TaskCanceledException into HttpClient.

        Stale responses are ignored client-side.
    */
    const request =
        searchService
            .getWorkByDoi(
                {
                    doi
                }
            );


    inFlightDoiRequests.set(
        requestKey,
        request
    );


    const removeRequest =
        () => {

            if (
                inFlightDoiRequests.get(
                    requestKey
                )
                ===
                request
            ) {

                inFlightDoiRequests.delete(
                    requestKey
                );

            }

        };


    void request.then(
        removeRequest,
        removeRequest
    );


    return request;

}


export default function useWorkByDoi():
    UseWorkByDoiResult {

    const [
        data,
        setData
    ] = useState<
        OpenAlexWork | null
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


    const resetWorkByDoi =
        useCallback(
            () => {

                /*
                    Invalidate any previous response,
                    but do not cancel its backend call.
                */
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


    const searchWorkByDoi =
        useCallback(
            async (
                doi: string
            ) => {

                const normalizedDoi =
                    doi.trim();


                if (
                    !normalizedDoi
                ) {

                    resetWorkByDoi();

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


                setData(
                    null
                );


                try {

                    const result =
                        await getDoiRequest(
                            normalizedDoi
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
                resetWorkByDoi
            ]
        );


    return {

        data,

        isLoading,

        error,

        searchWorkByDoi,

        resetWorkByDoi

    };

}