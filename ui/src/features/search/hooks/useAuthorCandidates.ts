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
    AuthorCandidateSearchResult
} from "../types/search-ui.types";


interface UseAuthorCandidatesResult {

    data:
    AuthorCandidateSearchResult | null;

    isLoading:
    boolean;

    error:
    string | null;

    searchCandidates: (
        name: string,
        email?: string
    ) => Promise<void>;

    resetCandidates:
    () => void;

}


/*
    Keeps identical candidate requests from being
    sent more than once while the first request
    is still running.

    This is especially useful with React StrictMode,
    which may execute an Effect twice in development.
*/
const inFlightCandidateRequests =
    new Map<
        string,
        Promise<AuthorCandidateSearchResult>
    >();


function createRequestKey(
    name: string,
    email?: string
): string {

    return [
        name
            .trim()
            .toLowerCase(),

        email
            ?.trim()
            .toLowerCase()
        ??
        ""
    ]
        .join(
            "|"
        );

}


function getCandidateRequest(
    name: string,
    email?: string
): Promise<AuthorCandidateSearchResult> {

    const requestKey =
        createRequestKey(
            name,
            email
        );


    const existingRequest =
        inFlightCandidateRequests.get(
            requestKey
        );


    /*
        React StrictMode or another component may
        request the same candidate search while the
        first request is still running.

        Reuse the same Promise instead of creating
        another HTTP request.
    */
    if (
        existingRequest
    ) {

        return existingRequest;

    }


    /*
        Important:

        We intentionally DO NOT pass AbortSignal here.

        If the user navigates to Home, changes search,
        or React performs development cleanup,
        the backend request is allowed to finish.

        The frontend ignores stale results instead
        of aborting the ASP.NET request.
    */
    const request =
        searchService
            .getAuthorCandidates(
                {
                    name,

                    email
                }
            );


    inFlightCandidateRequests.set(
        requestKey,
        request
    );


    void request.finally(
        () => {

            if (
                inFlightCandidateRequests.get(
                    requestKey
                )
                ===
                request
            ) {

                inFlightCandidateRequests.delete(
                    requestKey
                );

            }

        }
    );


    return request;

}


export default function useAuthorCandidates():
    UseAuthorCandidatesResult {

    const [
        data,
        setData
    ] = useState<
        AuthorCandidateSearchResult | null
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


    /*
        Every search receives an incrementing ID.

        Only the newest search is allowed to update
        the component state.

        Old requests may still finish on the backend,
        but their result is ignored.
    */
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


                /*
                    Invalidate any response that finishes
                    after this component has unmounted.
                */
                activeRequestIdRef.current +=
                    1;

            };

        },
        []
    );


    const resetCandidates =
        useCallback(
            () => {

                /*
                    We do NOT abort the HTTP request.

                    We simply invalidate its ability
                    to update this component.
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


    const searchCandidates =
        useCallback(
            async (
                name: string,
                email?: string
            ) => {

                const normalizedName =
                    name.trim();


                const normalizedEmail =
                    email
                        ?.trim()
                    ||
                    undefined;


                if (
                    !normalizedName
                ) {

                    resetCandidates();

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
                        await getCandidateRequest(
                            normalizedName,
                            normalizedEmail
                        );


                    /*
                        The request completed, but another
                        search may have started afterwards.

                        Only the latest search can update UI.
                    */
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
                resetCandidates
            ]
        );


    return {

        data,

        isLoading,

        error,

        searchCandidates,

        resetCandidates

    };

}