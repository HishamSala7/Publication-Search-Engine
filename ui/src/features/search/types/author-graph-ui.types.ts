import type {
    SearchInstitutionOption,
    SearchTaxonomyOption,
    WorkTypeOption
} from "./search-ui.types";


export interface AuthorGraphFilterValues {

    startDate:
    string;

    endDate:
    string;

    institutions:
    SearchInstitutionOption[];

    fields:
    SearchTaxonomyOption[];

    subFields:
    SearchTaxonomyOption[];

    types:
    WorkTypeOption[];

}


export function createEmptyAuthorGraphFilterValues():
    AuthorGraphFilterValues {

    return {

        startDate:
            "",

        endDate:
            "",

        institutions:
            [],

        fields:
            [],

        subFields:
            [],

        types:
            []

    };

}