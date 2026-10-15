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
    WorkTypeOption
} from "../types/search-ui.types";


interface UseWorkTypesRequest {

    load: boolean;

}


export default function useWorkTypes({
    load
}: UseWorkTypesRequest) {

    const [
        workTypes,
        setWorkTypes
    ] = useState<
        WorkTypeOption[]
    >(
        []
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


            async function loadWorkTypes() {

                setIsLoading(
                    true
                );


                setError(
                    null
                );


                try {

                    const result =
                        await searchService
                            .getWorkTypes(
                                {
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


                    setWorkTypes(
                        result
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


                    setWorkTypes(
                        []
                    );


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


            void loadWorkTypes();


            return () => {

                controller.abort();

            };

        },
        [
            load
        ]
    );


    return {

        workTypes,

        isLoading,

        error

    };

}