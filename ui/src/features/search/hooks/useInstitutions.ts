import {
    useEffect,
    useState
} from "react";

import {
    getErrorMessage,
    isAbortError
} from "../../../services/error-handler";

import {
    searchService
} from "../services/search.service";

import type {
    SearchInstitutionOption
} from "../types/search-ui.types";


interface UseInstitutionsRequest {

    filter: string;

    skip: number;

    load: boolean;

    pageSize?: number;

}


function mergeInstitutions(
    current:
        SearchInstitutionOption[],
    incoming:
        SearchInstitutionOption[]
): SearchInstitutionOption[] {

    const map =
        new Map<
            string,
            SearchInstitutionOption
        >();


    current.forEach(
        institution => {

            map.set(
                institution.openAlexId,
                institution
            );

        }
    );


    incoming.forEach(
        institution => {

            map.set(
                institution.openAlexId,
                institution
            );

        }
    );


    return Array.from(
        map.values()
    );

}


export default function useInstitutions({
    filter,
    skip,
    load,
    pageSize = 10
}: UseInstitutionsRequest) {

    const [
        institutions,
        setInstitutions
    ] = useState<
        SearchInstitutionOption[]
    >(
        []
    );


    const [
        totalCount,
        setTotalCount
    ] = useState(
        0
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


    useEffect(
        () => {

            if (
                !load
            ) {

                return;

            }


            const controller =
                new AbortController();


            async function loadInstitutions() {

                setIsLoading(
                    true
                );


                setError(
                    null
                );


                try {

                    const result =
                        await searchService
                            .getInstitutions(
                                {
                                    filter:
                                        filter
                                        ||
                                        undefined,

                                    take:
                                        pageSize,

                                    skip,

                                    signal:
                                        controller.signal
                                }
                            );


                    if (
                        controller
                            .signal
                            .aborted
                    ) {

                        return;

                    }


                    setInstitutions(
                        current =>
                            skip === 0
                                ? result.items
                                : mergeInstitutions(
                                    current,
                                    result.items
                                )
                    );


                    setTotalCount(
                        result.totalCount
                    );

                }
                catch (
                requestError
                ) {

                    if (
                        isAbortError(
                            requestError
                        )
                    ) {

                        return;

                    }


                    if (
                        skip === 0
                    ) {

                        setInstitutions(
                            []
                        );


                        setTotalCount(
                            0
                        );

                    }


                    setError(
                        getErrorMessage(
                            requestError
                        )
                    );

                }
                finally {

                    if (
                        !controller
                            .signal
                            .aborted
                    ) {

                        setIsLoading(
                            false
                        );

                    }

                }

            }


            void loadInstitutions();


            return () => {

                controller.abort();

            };

        },
        [
            filter,
            skip,
            load,
            pageSize
        ]
    );


    return {

        institutions,

        totalCount,

        isLoading,

        error

    };

}