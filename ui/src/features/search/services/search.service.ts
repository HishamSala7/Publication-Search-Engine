import {
    apiClient
} from "../../../services/api.client";

import {
    ApiError
} from "../../../services/error-handler";

import {
    API_ENDPOINTS
} from "../../../services/endpoints";

import type {
    ApiResult,
    AuthorCandidateSearchResult,
    AuthorPositionCount,
    OpenAlexAuthorDetail,
    OpenAlexAuthorGraphDto,
    OpenAlexAuthorsGraphSearchRequest,
    OpenAlexInstitutionMainGraphDto,
    OpenAlexInstitutionsGraphSearchRequest,
    OpenAlexWork,
    OpenAlexWorksSearchRequest,
    PagedResultDto,
    SearchInstitutionOption,
    SearchTaxonomyOption,
    WorkTypeOption,
    WorksSortMode
} from "../types/search-ui.types";


interface GetAuthorCandidatesRequest {

    name: string;

    email?: string;

    signal?: AbortSignal;

}


interface GetAuthorDetailsRequest {

    openAlexAuthorId: string;

    signal?: AbortSignal;

}


interface GetAuthorPositionCountsRequest {

    openAlexAuthorId: string;

    signal?: AbortSignal;

}


interface GetWorkByDoiRequest {

    doi: string;

    signal?: AbortSignal;

}


interface SearchWorksOptions {

    request:
    OpenAlexWorksSearchRequest;

    sortMode:
    WorksSortMode;

    signal?:
    AbortSignal;

}


interface GetAuthorsGraphOptions {

    request:
    OpenAlexAuthorsGraphSearchRequest;

    signal?:
    AbortSignal;

}


interface GetInstitutionsGraphOptions {

    request:
    OpenAlexInstitutionsGraphSearchRequest;

    signal?:
    AbortSignal;

}


interface BaseDropdownRequest {

    filter?: string;

    take?: number;

    skip?: number;

    signal?: AbortSignal;

}


interface SubFieldsDropdownRequest
    extends BaseDropdownRequest {

    fieldIds: string[];

}


interface TopicsDropdownRequest
    extends BaseDropdownRequest {

    fieldIds: string[];

    subFieldIds: string[];

}


interface KeywordsDropdownRequest
    extends BaseDropdownRequest {

    fieldIds: string[];

    subFieldIds: string[];

    topicIds: string[];

}


function unwrapResult<T>(
    result: ApiResult<T>
): T {

    if (
        !result.succeeded
        ||
        result.data === null
        ||
        result.data === undefined
    ) {

        throw new ApiError(
            result.message
            ||
            "The request could not be completed.",
            result.statusCode
            ||
            500,
            result
        );

    }


    return result.data;

}


function createWorksQuery(
    request:
        OpenAlexWorksSearchRequest
) {

    return {

        OpenAlexAuthorId:
            request.openAlexAuthorId,

        Orcid:
            request.orcid,

        StartDate:
            request.startDate,

        EndDate:
            request.endDate,

        OpenAlexFieldIds:
            request.openAlexFieldIds,

        OpenAlexSubFieldIds:
            request.openAlexSubFieldIds,

        OpenAlexTopicIds:
            request.openAlexTopicIds,

        OpenAlexKeywordIds:
            request.openAlexKeywordIds,

        OpenAlexInstitutionIds:
            request.openAlexInstitutionIds,

        Types:
            request.types,

        Take:
            request.take,

        Skip:
            request.skip,

        Filter:
            request.filter,

        OrderBy:
            request.orderBy,

        IsDescending:
            request.isDescending

    };

}


function createAuthorsGraphQuery(
    request:
        OpenAlexAuthorsGraphSearchRequest
) {

    return {

        OpenAlexAuthorIds:
            request.openAlexAuthorIds,

        StartDate:
            request.startDate,

        EndDate:
            request.endDate,

        OpenAlexInstitutionIds:
            request.openAlexInstitutionIds,

        OpenAlexFieldIds:
            request.openAlexFieldIds,

        OpenAlexSubFieldIds:
            request.openAlexSubFieldIds,

        Types:
            request.types,

        Mode:
            request.mode

    };

}


function createInstitutionsGraphQuery(
    request:
        OpenAlexInstitutionsGraphSearchRequest
) {

    return {

        OpenAlexInstitutionIds:
            request.openAlexInstitutionIds,

        StartDate:
            request.startDate,

        EndDate:
            request.endDate,

        OpenAlexFieldIds:
            request.openAlexFieldIds,

        Types:
            request.types

    };

}


async function getAuthorCandidates({
    name,
    email,
    signal
}: GetAuthorCandidatesRequest):
    Promise<AuthorCandidateSearchResult> {

    return apiClient.get<
        AuthorCandidateSearchResult
    >(
        API_ENDPOINTS
            .authors
            .candidates,
        {
            signal,

            query: {

                name,

                email

            }
        }
    );

}


async function getAuthorDetails({
    openAlexAuthorId,
    signal
}: GetAuthorDetailsRequest):
    Promise<OpenAlexAuthorDetail> {

    const result =
        await apiClient.get<
            ApiResult<
                OpenAlexAuthorDetail
            >
        >(
            API_ENDPOINTS
                .authors
                .details,
            {
                signal,

                query: {

                    openAlexAuthorId

                }
            }
        );


    return unwrapResult(
        result
    );

}


async function getAuthorPositionCounts({
    openAlexAuthorId,
    signal
}: GetAuthorPositionCountsRequest):
    Promise<AuthorPositionCount> {

    const result =
        await apiClient.get<
            ApiResult<
                AuthorPositionCount
            >
        >(
            API_ENDPOINTS
                .authors
                .positionCounts,
            {
                signal,

                query: {

                    openAlexAuthorId

                }
            }
        );


    return unwrapResult(
        result
    );

}


async function getWorkByDoi({
    doi,
    signal
}: GetWorkByDoiRequest):
    Promise<OpenAlexWork> {

    const result =
        await apiClient.get<
            ApiResult<
                OpenAlexWork
            >
        >(
            API_ENDPOINTS
                .works
                .getByDoi,
            {
                signal,

                query: {

                    doi

                }
            }
        );


    return unwrapResult(
        result
    );

}


async function searchWorks({
    request,
    sortMode,
    signal
}: SearchWorksOptions):
    Promise<
        PagedResultDto<
            OpenAlexWork
        >
    > {

    let endpoint:
        string;


    if (
        sortMode === "latest"
    ) {

        endpoint =
            API_ENDPOINTS
                .works
                .latest;

    }
    else if (
        sortMode === "mostCited"
    ) {

        endpoint =
            API_ENDPOINTS
                .works
                .highestCited;

    }
    else if (
        request.orcid
    ) {

        endpoint =
            API_ENDPOINTS
                .works
                .searchByOrcid;

    }
    else {

        endpoint =
            API_ENDPOINTS
                .works
                .search;

    }


    const result =
        await apiClient.get<
            ApiResult<
                PagedResultDto<
                    OpenAlexWork
                >
            >
        >(
            endpoint,
            {
                signal,

                query:
                    createWorksQuery(
                        request
                    )
            }
        );


    return unwrapResult(
        result
    );

}


async function getAuthorsGraph({
    request,
    signal
}: GetAuthorsGraphOptions):
    Promise<OpenAlexAuthorGraphDto[]> {

    const result =
        await apiClient.get<
            ApiResult<
                OpenAlexAuthorGraphDto[]
            >
        >(
            API_ENDPOINTS
                .works
                .authorsGraph,
            {
                signal,

                query:
                    createAuthorsGraphQuery(
                        request
                    )
            }
        );


    return unwrapResult(
        result
    );

}


async function getInstitutionsGraph({
    request,
    signal
}: GetInstitutionsGraphOptions):
    Promise<OpenAlexInstitutionMainGraphDto[]> {

    const result =
        await apiClient.get<
            ApiResult<
                OpenAlexInstitutionMainGraphDto[]
            >
        >(
            API_ENDPOINTS
                .works
                .institutionsGraph,
            {
                signal,

                query:
                    createInstitutionsGraphQuery(
                        request
                    )
            }
        );


    return unwrapResult(
        result
    );

}


async function getFields({
    filter,
    take = 10,
    skip = 0,
    signal
}: BaseDropdownRequest):
    Promise<
        PagedResultDto<
            SearchTaxonomyOption
        >
    > {

    const result =
        await apiClient.get<
            ApiResult<
                PagedResultDto<
                    SearchTaxonomyOption
                >
            >
        >(
            API_ENDPOINTS
                .searchEngineDropDowns
                .fields,
            {
                signal,

                query: {

                    Filter:
                        filter,

                    Take:
                        take,

                    Skip:
                        skip

                }
            }
        );


    return unwrapResult(
        result
    );

}


async function getSubFields({
    fieldIds,
    filter,
    take = 10,
    skip = 0,
    signal
}: SubFieldsDropdownRequest):
    Promise<
        PagedResultDto<
            SearchTaxonomyOption
        >
    > {

    const result =
        await apiClient.get<
            ApiResult<
                PagedResultDto<
                    SearchTaxonomyOption
                >
            >
        >(
            API_ENDPOINTS
                .searchEngineDropDowns
                .subFields,
            {
                signal,

                query: {

                    FieldIds:
                        fieldIds,

                    Filter:
                        filter,

                    Take:
                        take,

                    Skip:
                        skip

                }
            }
        );


    return unwrapResult(
        result
    );

}


async function getTopics({
    fieldIds,
    subFieldIds,
    filter,
    take = 10,
    skip = 0,
    signal
}: TopicsDropdownRequest):
    Promise<
        PagedResultDto<
            SearchTaxonomyOption
        >
    > {

    const result =
        await apiClient.get<
            ApiResult<
                PagedResultDto<
                    SearchTaxonomyOption
                >
            >
        >(
            API_ENDPOINTS
                .searchEngineDropDowns
                .topics,
            {
                signal,

                query: {

                    FieldIds:
                        fieldIds,

                    SubFieldIds:
                        subFieldIds,

                    Filter:
                        filter,

                    Take:
                        take,

                    Skip:
                        skip

                }
            }
        );


    return unwrapResult(
        result
    );

}


async function getKeywords({
    fieldIds,
    subFieldIds,
    topicIds,
    filter,
    take = 10,
    skip = 0,
    signal
}: KeywordsDropdownRequest):
    Promise<
        PagedResultDto<
            SearchTaxonomyOption
        >
    > {

    const result =
        await apiClient.get<
            ApiResult<
                PagedResultDto<
                    SearchTaxonomyOption
                >
            >
        >(
            API_ENDPOINTS
                .searchEngineDropDowns
                .keywords,
            {
                signal,

                query: {

                    FieldIds:
                        fieldIds,

                    SubFieldIds:
                        subFieldIds,

                    TopicIds:
                        topicIds,

                    Filter:
                        filter,

                    Take:
                        take,

                    Skip:
                        skip

                }
            }
        );


    return unwrapResult(
        result
    );

}


async function getInstitutions({
    filter,
    take = 10,
    skip = 0,
    signal
}: BaseDropdownRequest):
    Promise<
        PagedResultDto<
            SearchInstitutionOption
        >
    > {

    const result =
        await apiClient.get<
            ApiResult<
                PagedResultDto<
                    SearchInstitutionOption
                >
            >
        >(
            API_ENDPOINTS
                .searchEngineDropDowns
                .institutions,
            {
                signal,

                query: {

                    Filter:
                        filter,

                    Take:
                        take,

                    Skip:
                        skip

                }
            }
        );


    return unwrapResult(
        result
    );

}


async function getWorkTypes({
    signal
}: {
    signal?: AbortSignal;
} = {}):
    Promise<
        WorkTypeOption[]
    > {

    const result =
        await apiClient.get<
            ApiResult<
                WorkTypeOption[]
            >
        >(
            API_ENDPOINTS
                .searchEngineDropDowns
                .workTypes,
            {
                signal
            }
        );


    return unwrapResult(
        result
    );

}


export const searchService = {

    getAuthorCandidates,

    getAuthorDetails,

    getAuthorPositionCounts,

    getWorkByDoi,

    searchWorks,

    getAuthorsGraph,

    getInstitutionsGraph,

    getFields,

    getSubFields,

    getTopics,

    getKeywords,

    getInstitutions,

    getWorkTypes

};