export type SearchMode =
    | "author"
    | "publications"
    | "orcid"
    | "doi";


export type WorksSortMode =
    | "default"
    | "latest"
    | "mostCited";


export interface SearchFormValues {

    name: string;

    email: string;

    publicationQuery: string;

    orcid: string;

    doi: string;

}


export interface AuthorCandidate {

    openAlexId: string;

    displayName: string;

    orcid?: string | null;

    institution?: string | null;

    worksCount: number;

    citedByCount: number;

}


export interface AuthorCandidateSearchResult {

    resolvedInstitution?: string | null;

    candidates: AuthorCandidate[];

}


export interface OpenAlexAuthor {

    id?: string | null;

    display_name?: string | null;

    orcid?: string | null;

}


export interface OpenAlexAuthorship {

    author_position?: string | null;

    author?: OpenAlexAuthor | null;

}


export interface OpenAlexSource {

    display_name?: string | null;

}


export interface OpenAlexPrimaryLocation {

    source?: OpenAlexSource | null;

    is_oa?: boolean | null;

    landing_page_url?: string | null;

}


export interface OpenAlexWork {

    id?: string | null;

    doi?: string | null;

    title?: string | null;

    publication_year?: number | null;

    publication_date?: string | null;

    cited_by_count?: number | null;

    abstract_inverted_index?:
    Record<string, number[]> | null;

    authorships?:
    OpenAlexAuthorship[] | null;

    primary_location?:
    OpenAlexPrimaryLocation | null;

}


export interface PagedResultDto<T> {

    items: T[];

    totalCount: number;

}


export interface ApiResult<T> {

    statusCode: number;

    succeeded: boolean;

    message?: string | null;

    data?: T | null;

}


export interface SearchTaxonomyOption {

    id: string;

    openAlexId: string;

    displayName: string;

}


export interface WorksFilterValues {

    startDate: string;

    endDate: string;

    fields: SearchTaxonomyOption[];

    subFields: SearchTaxonomyOption[];

    topics: SearchTaxonomyOption[];

    keywords: SearchTaxonomyOption[];

}


export interface OpenAlexWorksSearchRequest {

    openAlexAuthorId?: string;

    orcid?: string;

    startDate?: string;

    endDate?: string;

    openAlexFieldIds?: string[];

    openAlexSubFieldIds?: string[];

    openAlexTopicIds?: string[];

    openAlexKeywordIds?: string[];

    take: number;

    skip: number;

    filter?: string;

    orderBy?: string;

    isDescending?: boolean;

}


export const emptySearchFormValues:
    SearchFormValues = {

    name: "",

    email: "",

    publicationQuery: "",

    orcid: "",

    doi: ""

};


export function createEmptyWorksFilterValues():
    WorksFilterValues {

    return {

        startDate: "",

        endDate: "",

        fields: [],

        subFields: [],

        topics: [],

        keywords: []

    };

}