import type {
    SearchTaxonomyOption,
    WorkTypeOption
} from "./search-ui.types";


export interface InstitutionGraphFilterValues {

    startDate:
    string;

    endDate:
    string;

    fields:
    SearchTaxonomyOption[];

    types:
    WorkTypeOption[];

}


export function createEmptyInstitutionGraphFilterValues():
    InstitutionGraphFilterValues {

    return {

        startDate:
            "",

        endDate:
            "",

        fields:
            [],

        types:
            []

    };

}