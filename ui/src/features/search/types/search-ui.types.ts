export type SearchMode =
    | "author"
    | "publications"
    | "institution"
    | "orcid"
    | "doi";


export type WorksSortMode =
    | "default"
    | "latest"
    | "mostCited";


export type PublicationType =
    | 0 // Article
    | 1 // Book
    | 2 // BookChapter
    | 3 // Conference
    | 4 // Preprint
    | 5; // Other


export type OpenAlexGraphMode =
    | 1 // Year
    | 2 // Institution
    | 3 // Field
    | 4 // SubField
    | 5; // PublicationType


export const OpenAlexGraphModes = {

    Year:
        1 as OpenAlexGraphMode,

    Institution:
        2 as OpenAlexGraphMode,

    Field:
        3 as OpenAlexGraphMode,

    SubField:
        4 as OpenAlexGraphMode,

    PublicationType:
        5 as OpenAlexGraphMode

} as const;


export interface SearchInstitutionOption {

    id: string;

    openAlexId: string;

    displayName: string;

}


export interface SearchFormValues {

    name: string;

    email: string;

    publicationQuery: string;

    institutions:
    SearchInstitutionOption[];

    orcid: string;

    doi: string;

}


export interface AuthorCandidate {

    openAlexId: string;

    displayName: string;

    orcid?:
    string | null;

    institution?:
    string | null;

    worksCount: number;

    citedByCount: number;

}


export interface AuthorCandidateSearchResult {

    resolvedInstitution?:
    string | null;

    candidates:
    AuthorCandidate[];

}


export interface OpenAlexAuthor {

    id?:
    string | null;

    display_name?:
    string | null;

    orcid?:
    string | null;

}


export interface OpenAlexAuthorship {

    author_position?:
    string | null;

    author?:
    OpenAlexAuthor | null;

}


export interface OpenAlexSource {

    display_name?:
    string | null;

}


export interface OpenAlexPrimaryLocation {

    source?:
    OpenAlexSource | null;

    is_oa?:
    boolean | null;

    landing_page_url?:
    string | null;

}


export interface OpenAlexWork {

    id?:
    string | null;

    doi?:
    string | null;

    title?:
    string | null;

    publication_year?:
    number | null;

    publication_date?:
    string | null;

    cited_by_count?:
    number | null;

    abstract_inverted_index?:
    Record<string, number[]> | null;

    authorships?:
    OpenAlexAuthorship[] | null;

    primary_location?:
    OpenAlexPrimaryLocation | null;

}


export interface PagedResultDto<T> {

    items:
    T[];

    totalCount:
    number;

}


export interface ApiResult<T> {

    statusCode:
    number;

    succeeded:
    boolean;

    message?:
    string | null;

    data?:
    T | null;

}


export interface SearchTaxonomyOption {

    id: string;

    openAlexId: string;

    displayName: string;

}


export interface WorkTypeOption {

    key:
    PublicationType;

    value:
    string;

}


export interface OpenAlexInstitutionSimple {

    id: string;

    display_name: string;

    ror?:
    string | null;

    lineage?:
    string[] | null;

}


export interface AuthorWorksCountByYear {

    year:
    number;

    works_count:
    number;

    cited_by_count:
    number;

}


export interface AuthorTopicMain {

    display_name?:
    string | null;

}


export interface AuthorTopic {

    display_name?:
    string | null;

    count?:
    number | null;

    subfield?:
    AuthorTopicMain | null;

    field?:
    AuthorTopicMain | null;

}


export interface OpenAlexAffiliation {

    institution?:
    OpenAlexInstitutionSimple | null;

    years?:
    number[] | null;

}


export interface OpenAlexAuthorDetail {

    id?:
    string | null;

    display_name?:
    string | null;

    orcid?:
    string | null;

    works_count:
    number;

    cited_by_count:
    number;

    last_known_institutions?:
    OpenAlexInstitutionSimple[] | null;

    counts_by_year?:
    AuthorWorksCountByYear[] | null;

    topics?:
    AuthorTopic[] | null;

    affiliations?:
    OpenAlexAffiliation[] | null;

}


export interface AuthorPositionCount {

    firstPositionCount:
    number;

    middlePositionCount:
    number;

    lastPositionCount:
    number;

}


export interface WorksFilterValues {

    startDate:
    string;

    endDate:
    string;

    fields:
    SearchTaxonomyOption[];

    subFields:
    SearchTaxonomyOption[];

    topics:
    SearchTaxonomyOption[];

    keywords:
    SearchTaxonomyOption[];

    institutions:
    SearchInstitutionOption[];

    types:
    WorkTypeOption[];

}


export interface OpenAlexWorksSearchRequest {

    openAlexAuthorId?:
    string;

    orcid?:
    string;

    startDate?:
    string;

    endDate?:
    string;

    openAlexFieldIds?:
    string[];

    openAlexSubFieldIds?:
    string[];

    openAlexTopicIds?:
    string[];

    openAlexKeywordIds?:
    string[];

    openAlexInstitutionIds?:
    string[];

    types?:
    PublicationType[];

    take:
    number;

    skip:
    number;

    filter?:
    string;

    orderBy?:
    string;

    isDescending?:
    boolean;

}


/* ========================================
   Author Graph
======================================== */

export interface OpenAlexAuthorsGraphSearchRequest {

    openAlexAuthorIds:
    string[];

    startDate?:
    string;

    endDate?:
    string;

    openAlexInstitutionIds?:
    string[];

    openAlexFieldIds?:
    string[];

    openAlexSubFieldIds?:
    string[];

    types?:
    PublicationType[];

    mode:
    OpenAlexGraphMode;

}


export interface OpenAlexAuthorGraphItemDto {

    key:
    string;

    displayName:
    string;

    count:
    number;

}


export interface OpenAlexAuthorGraphDto {

    openAlexAuthorId:
    string;

    authorDisplayName:
    string;

    mode:
    OpenAlexGraphMode;

    items:
    OpenAlexAuthorGraphItemDto[];

}


/* ========================================
   Institution Graph
======================================== */

export interface OpenAlexInstitutionsGraphSearchRequest {

    openAlexInstitutionIds:
    string[];

    startDate?:
    string;

    endDate?:
    string;

    openAlexFieldIds?:
    string[];

    types?:
    PublicationType[];

}


export interface OpenAlexInstitutionFieldDto {

    fieldDisplayName:
    string;

    count:
    number;

}


export interface OpenAlexInstitutionMainGraphDto {

    id:
    string;

    openAlexInstitutionId:
    string;

    institutionDisplayName:
    string;

    fields:
    OpenAlexInstitutionFieldDto[];

}


export const emptySearchFormValues:
    SearchFormValues = {

    name:
        "",

    email:
        "",

    publicationQuery:
        "",

    institutions:
        [],

    orcid:
        "",

    doi:
        ""

};


export function createEmptyWorksFilterValues():
    WorksFilterValues {

    return {

        startDate:
            "",

        endDate:
            "",

        fields:
            [],

        subFields:
            [],

        topics:
            [],

        keywords:
            [],

        institutions:
            [],

        types:
            []

    };

}