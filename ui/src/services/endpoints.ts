export const API_ENDPOINTS = {

    authors: {

        candidates:
            "/api/Authors/candidates"

    },


    works: {

        search:
            "/api/Works/search-works",

        searchByOrcid:
            "/api/Works/search-works-by-orcid",

        getByDoi:
            "/api/Works/get-work-by-doi",

        latest:
            "/api/Works/get-latest-works",

        highestCited:
            "/api/Works/get-highest-cited-works"

    },


    searchEngineDropDowns: {

        fields:
            "/api/SearchEngineDropDowns/fields-drop-down",

        subFields:
            "/api/SearchEngineDropDowns/subfields-drop-down",

        topics:
            "/api/SearchEngineDropDowns/topics-drop-down",

        keywords:
            "/api/SearchEngineDropDowns/keywords-drop-down"

    }

} as const;