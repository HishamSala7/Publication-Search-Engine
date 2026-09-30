import SearchFilters
    from "./SearchFilters";

import SearchResults
    from "./SearchResults";


export default function SearchExplorerSection() {

    return (

        <section
            className="section"
            id="preview"
        >


            <div className="container">


                <div className="section-heading">


                    <div>

                        <span className="section-kicker">

                            SMART FILTERING

                        </span>


                        <h2>

                            A search experience built
                            for scientific data.

                        </h2>

                    </div>


                    <p>

                        Recommended filters make large
                        faculty datasets easier to navigate
                        without losing the context of the
                        researcher.

                    </p>


                </div>


                <div className="search-preview">


                    <SearchFilters />


                    <SearchResults />


                </div>


            </div>


        </section>

    );

}