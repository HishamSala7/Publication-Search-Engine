import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import SearchForm
    from "../search/SearchForm";

import SearchModeSelector
    from "../search/SearchModeSelector";

import type {
    SearchFormValues,
    SearchMode
} from "../../features/search/types/search-ui.types";


export default function SearchLaunch() {

    const navigate =
        useNavigate();


    const [
        searchMode,
        setSearchMode
    ] = useState<SearchMode>(
        "author"
    );


    function handleSearch(
        values:
            SearchFormValues
    ) {

        const params =
            new URLSearchParams();


        params.set(
            "mode",
            searchMode
        );


        if (
            searchMode === "author"
        ) {

            params.set(
                "name",
                values.name
            );


            if (
                values.email
            ) {

                params.set(
                    "email",
                    values.email
                );

            }

        }


        if (
            searchMode === "publications"
        ) {

            if (
                values.publicationQuery
            ) {

                params.set(
                    "filter",
                    values.publicationQuery
                );

            }

        }


        if (
            searchMode === "orcid"
        ) {

            params.set(
                "orcid",
                values.orcid
            );

        }


        if (
            searchMode === "doi"
        ) {

            params.set(
                "doi",
                values.doi
            );

        }


        navigate(
            `/search?${params.toString()}`
        );

    }


    return (

        <section
            className="search-launch"
            id="search"
        >

            <div className="container search-launch-inner">


                <div className="search-launch-copy">

                    <span className="section-kicker">

                        START YOUR SEARCH

                    </span>


                    <h2>

                        Search scientific research

                    </h2>


                    <p>

                        Find a researcher by name,
                        search publications globally,
                        or look up research directly
                        using ORCID or DOI.

                    </p>

                </div>


                <div className="search-launch-workspace">

                    <SearchModeSelector
                        value={
                            searchMode
                        }
                        onChange={
                            setSearchMode
                        }
                    />


                    <SearchForm
                        mode={
                            searchMode
                        }
                        onSubmit={
                            handleSearch
                        }
                    />

                </div>


            </div>

        </section>

    );

}