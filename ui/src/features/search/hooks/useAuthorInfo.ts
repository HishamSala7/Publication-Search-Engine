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
    AuthorPositionCount,
    OpenAlexAuthorDetail
} from "../types/search-ui.types";


interface AuthorInfoData {

    details:
    OpenAlexAuthorDetail;

    positionCounts:
    AuthorPositionCount;

}


interface UseAuthorInfoResult {

    data:
    AuthorInfoData | null;

    isLoading:
    boolean;

    error:
    string | null;

    loadAuthorInfo: (
        openAlexAuthorId:
            string
    ) => Promise<void>;

    resetAuthorInfo:
    () => void;

}


export default function useAuthorInfo():
    UseAuthorInfoResult {

    const [
        data,
        setData
    ] = useState<
        AuthorInfoData | null
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


    const resetAuthorInfo =
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


    const loadAuthorInfo =
        useCallback(
            async (
                openAlexAuthorId:
                    string
            ) => {

                const normalizedId =
                    openAlexAuthorId
                        .trim();


                if (
                    !normalizedId
                ) {

                    resetAuthorInfo();

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

                    const [
                        details,
                        positionCounts
                    ] =
                        await Promise.all(
                            [

                                searchService
                                    .getAuthorDetails(
                                        {
                                            openAlexAuthorId:
                                                normalizedId
                                        }
                                    ),

                                searchService
                                    .getAuthorPositionCounts(
                                        {
                                            openAlexAuthorId:
                                                normalizedId
                                        }
                                    )

                            ]
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
                        {

                            details,

                            positionCounts

                        }
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
                resetAuthorInfo
            ]
        );


    return {

        data,

        isLoading,

        error,

        loadAuthorInfo,

        resetAuthorInfo

    };

}