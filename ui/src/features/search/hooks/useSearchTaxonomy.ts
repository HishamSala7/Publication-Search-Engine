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
    SearchTaxonomyOption
} from "../types/search-ui.types";


interface UseSearchTaxonomyRequest {

    fieldIds: string[];

    subFieldIds: string[];

    topicIds: string[];

    fieldFilter: string;

    subFieldFilter: string;

    topicFilter: string;

    keywordFilter: string;

    fieldSkip: number;

    subFieldSkip: number;

    topicSkip: number;

    keywordSkip: number;

    loadFields: boolean;

    loadSubFields: boolean;

    loadTopics: boolean;

    loadKeywords: boolean;

    pageSize?: number;

}


function mergeOptions(
    current:
        SearchTaxonomyOption[],
    incoming:
        SearchTaxonomyOption[]
): SearchTaxonomyOption[] {

    const map =
        new Map<
            string,
            SearchTaxonomyOption
        >();


    current.forEach(
        option => {

            map.set(
                option.id,
                option
            );

        }
    );


    incoming.forEach(
        option => {

            map.set(
                option.id,
                option
            );

        }
    );


    return Array.from(
        map.values()
    );

}


export default function useSearchTaxonomy({
    fieldIds,
    subFieldIds,
    topicIds,
    fieldFilter,
    subFieldFilter,
    topicFilter,
    keywordFilter,
    fieldSkip,
    subFieldSkip,
    topicSkip,
    keywordSkip,
    loadFields,
    loadSubFields,
    loadTopics,
    loadKeywords,
    pageSize = 10
}: UseSearchTaxonomyRequest) {

    const [
        fields,
        setFields
    ] = useState<
        SearchTaxonomyOption[]
    >(
        []
    );


    const [
        subFields,
        setSubFields
    ] = useState<
        SearchTaxonomyOption[]
    >(
        []
    );


    const [
        topics,
        setTopics
    ] = useState<
        SearchTaxonomyOption[]
    >(
        []
    );


    const [
        keywords,
        setKeywords
    ] = useState<
        SearchTaxonomyOption[]
    >(
        []
    );


    const [
        fieldsTotalCount,
        setFieldsTotalCount
    ] = useState(
        0
    );


    const [
        subFieldsTotalCount,
        setSubFieldsTotalCount
    ] = useState(
        0
    );


    const [
        topicsTotalCount,
        setTopicsTotalCount
    ] = useState(
        0
    );


    const [
        keywordsTotalCount,
        setKeywordsTotalCount
    ] = useState(
        0
    );


    const [
        isFieldsLoading,
        setIsFieldsLoading
    ] = useState(
        false
    );


    const [
        isSubFieldsLoading,
        setIsSubFieldsLoading
    ] = useState(
        false
    );


    const [
        isTopicsLoading,
        setIsTopicsLoading
    ] = useState(
        false
    );


    const [
        isKeywordsLoading,
        setIsKeywordsLoading
    ] = useState(
        false
    );


    const [
        fieldsError,
        setFieldsError
    ] = useState<
        string | null
    >(
        null
    );


    const [
        subFieldsError,
        setSubFieldsError
    ] = useState<
        string | null
    >(
        null
    );


    const [
        topicsError,
        setTopicsError
    ] = useState<
        string | null
    >(
        null
    );


    const [
        keywordsError,
        setKeywordsError
    ] = useState<
        string | null
    >(
        null
    );


    const fieldIdsKey =
        [
            ...fieldIds
        ]
            .sort()
            .join(
                "|"
            );


    const subFieldIdsKey =
        [
            ...subFieldIds
        ]
            .sort()
            .join(
                "|"
            );


    const topicIdsKey =
        [
            ...topicIds
        ]
            .sort()
            .join(
                "|"
            );


    const normalizedFieldIds =
        fieldIdsKey
            ? fieldIdsKey.split(
                "|"
            )
            : [];


    const normalizedSubFieldIds =
        subFieldIdsKey
            ? subFieldIdsKey.split(
                "|"
            )
            : [];


    const normalizedTopicIds =
        topicIdsKey
            ? topicIdsKey.split(
                "|"
            )
            : [];


    /*
        FIELDS

        Nothing happens until Field dropdown
        has actually been opened.
    */
    useEffect(
        () => {

            if (
                !loadFields
            ) {

                return;

            }


            const controller =
                new AbortController();


            async function load() {

                setIsFieldsLoading(
                    true
                );


                setFieldsError(
                    null
                );


                try {

                    const result =
                        await searchService
                            .getFields(
                                {
                                    filter:
                                        fieldFilter
                                        ||
                                        undefined,

                                    take:
                                        pageSize,

                                    skip:
                                        fieldSkip,

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


                    setFields(
                        current =>
                            fieldSkip === 0
                                ? result.items
                                : mergeOptions(
                                    current,
                                    result.items
                                )
                    );


                    setFieldsTotalCount(
                        result.totalCount
                    );

                }
                catch (
                error
                ) {

                    if (
                        isAbortError(
                            error
                        )
                    ) {

                        return;

                    }


                    if (
                        fieldSkip === 0
                    ) {

                        setFields(
                            []
                        );


                        setFieldsTotalCount(
                            0
                        );

                    }


                    setFieldsError(
                        getErrorMessage(
                            error
                        )
                    );

                }
                finally {

                    if (
                        !controller
                            .signal
                            .aborted
                    ) {

                        setIsFieldsLoading(
                            false
                        );

                    }

                }

            }


            void load();


            return () => {

                controller.abort();

            };

        },
        [
            loadFields,
            fieldFilter,
            fieldSkip,
            pageSize
        ]
    );


    /*
        SUBFIELDS

        FieldIds are optional.
    */
    useEffect(
        () => {

            if (
                !loadSubFields
            ) {

                return;

            }


            const controller =
                new AbortController();


            async function load() {

                setIsSubFieldsLoading(
                    true
                );


                setSubFieldsError(
                    null
                );


                try {

                    const result =
                        await searchService
                            .getSubFields(
                                {
                                    fieldIds:
                                        normalizedFieldIds,

                                    filter:
                                        subFieldFilter
                                        ||
                                        undefined,

                                    take:
                                        pageSize,

                                    skip:
                                        subFieldSkip,

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


                    setSubFields(
                        current =>
                            subFieldSkip === 0
                                ? result.items
                                : mergeOptions(
                                    current,
                                    result.items
                                )
                    );


                    setSubFieldsTotalCount(
                        result.totalCount
                    );

                }
                catch (
                error
                ) {

                    if (
                        isAbortError(
                            error
                        )
                    ) {

                        return;

                    }


                    if (
                        subFieldSkip === 0
                    ) {

                        setSubFields(
                            []
                        );


                        setSubFieldsTotalCount(
                            0
                        );

                    }


                    setSubFieldsError(
                        getErrorMessage(
                            error
                        )
                    );

                }
                finally {

                    if (
                        !controller
                            .signal
                            .aborted
                    ) {

                        setIsSubFieldsLoading(
                            false
                        );

                    }

                }

            }


            void load();


            return () => {

                controller.abort();

            };

        },
        [
            loadSubFields,
            fieldIdsKey,
            subFieldFilter,
            subFieldSkip,
            pageSize
        ]
    );


    /*
        TOPICS

        FieldIds and SubFieldIds are optional.
    */
    useEffect(
        () => {

            if (
                !loadTopics
            ) {

                return;

            }


            const controller =
                new AbortController();


            async function load() {

                setIsTopicsLoading(
                    true
                );


                setTopicsError(
                    null
                );


                try {

                    const result =
                        await searchService
                            .getTopics(
                                {
                                    fieldIds:
                                        normalizedFieldIds,

                                    subFieldIds:
                                        normalizedSubFieldIds,

                                    filter:
                                        topicFilter
                                        ||
                                        undefined,

                                    take:
                                        pageSize,

                                    skip:
                                        topicSkip,

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


                    setTopics(
                        current =>
                            topicSkip === 0
                                ? result.items
                                : mergeOptions(
                                    current,
                                    result.items
                                )
                    );


                    setTopicsTotalCount(
                        result.totalCount
                    );

                }
                catch (
                error
                ) {

                    if (
                        isAbortError(
                            error
                        )
                    ) {

                        return;

                    }


                    if (
                        topicSkip === 0
                    ) {

                        setTopics(
                            []
                        );


                        setTopicsTotalCount(
                            0
                        );

                    }


                    setTopicsError(
                        getErrorMessage(
                            error
                        )
                    );

                }
                finally {

                    if (
                        !controller
                            .signal
                            .aborted
                    ) {

                        setIsTopicsLoading(
                            false
                        );

                    }

                }

            }


            void load();


            return () => {

                controller.abort();

            };

        },
        [
            loadTopics,
            fieldIdsKey,
            subFieldIdsKey,
            topicFilter,
            topicSkip,
            pageSize
        ]
    );


    /*
        KEYWORDS

        All parent IDs are optional.
    */
    useEffect(
        () => {

            if (
                !loadKeywords
            ) {

                return;

            }


            const controller =
                new AbortController();


            async function load() {

                setIsKeywordsLoading(
                    true
                );


                setKeywordsError(
                    null
                );


                try {

                    const result =
                        await searchService
                            .getKeywords(
                                {
                                    fieldIds:
                                        normalizedFieldIds,

                                    subFieldIds:
                                        normalizedSubFieldIds,

                                    topicIds:
                                        normalizedTopicIds,

                                    filter:
                                        keywordFilter
                                        ||
                                        undefined,

                                    take:
                                        pageSize,

                                    skip:
                                        keywordSkip,

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


                    setKeywords(
                        current =>
                            keywordSkip === 0
                                ? result.items
                                : mergeOptions(
                                    current,
                                    result.items
                                )
                    );


                    setKeywordsTotalCount(
                        result.totalCount
                    );

                }
                catch (
                error
                ) {

                    if (
                        isAbortError(
                            error
                        )
                    ) {

                        return;

                    }


                    if (
                        keywordSkip === 0
                    ) {

                        setKeywords(
                            []
                        );


                        setKeywordsTotalCount(
                            0
                        );

                    }


                    setKeywordsError(
                        getErrorMessage(
                            error
                        )
                    );

                }
                finally {

                    if (
                        !controller
                            .signal
                            .aborted
                    ) {

                        setIsKeywordsLoading(
                            false
                        );

                    }

                }

            }


            void load();


            return () => {

                controller.abort();

            };

        },
        [
            loadKeywords,
            fieldIdsKey,
            subFieldIdsKey,
            topicIdsKey,
            keywordFilter,
            keywordSkip,
            pageSize
        ]
    );


    return {

        fields,

        subFields,

        topics,

        keywords,

        fieldsTotalCount,

        subFieldsTotalCount,

        topicsTotalCount,

        keywordsTotalCount,

        isFieldsLoading,

        isSubFieldsLoading,

        isTopicsLoading,

        isKeywordsLoading,

        fieldsError,

        subFieldsError,

        topicsError,

        keywordsError

    };

}