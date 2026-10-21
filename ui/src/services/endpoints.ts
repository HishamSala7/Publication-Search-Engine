export const API_ENDPOINTS = {

    authors: {

        candidates:
            "/api/Authors/candidates",

        details:
            "/api/Authors/author-details",

        positionCounts:
            "/api/Authors/get-work-author-position-counts"

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
            "/api/Works/get-highest-cited-works",

        authorsGraph:
            "/api/Works/get-authors-graph",

        institutionsGraph:
            "/api/Works/get-institutions-graph"

    },


    searchEngineDropDowns: {

        fields:
            "/api/SearchEngineDropDowns/fields-drop-down",

        subFields:
            "/api/SearchEngineDropDowns/subfields-drop-down",

        topics:
            "/api/SearchEngineDropDowns/topics-drop-down",

        keywords:
            "/api/SearchEngineDropDowns/keywords-drop-down",

        institutions:
            "/api/SearchEngineDropDowns/institutions-drop-down",

        workTypes:
            "/api/SearchEngineDropDowns/work-types-drop-down"

    }

} as const;