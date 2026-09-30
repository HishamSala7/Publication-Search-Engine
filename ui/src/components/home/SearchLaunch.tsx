import {
    type FormEvent
} from "react";

import {
    FaArrowRight,
    FaMagnifyingGlass
} from "react-icons/fa6";

import {
    useLocation,
    useNavigate
} from "react-router-dom";


export default function SearchLaunch() {


    const navigate =
        useNavigate();


    const location =
        useLocation();


    function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        if (
            location.pathname !== "/search"
        ) {

            navigate("/search");

        }

    }


    return (

        <section
            className="search-launch"
            id="search"
        >


            <div className="container search-launch-inner">


                <div>


                    <span className="section-kicker">

                        START YOUR SEARCH

                    </span>


                    <h2>

                        Find a faculty member

                    </h2>


                    <p>

                        Search by name, ORCID,
                        institution or research area.

                    </p>


                </div>


                <form
                    className="faculty-search"
                    onSubmit={handleSubmit}
                >


                    <i>

                        <FaMagnifyingGlass />

                    </i>


                    <input
                        type="search"
                        placeholder="e.g. Maria Garcia, John Smith..."
                        autoComplete="off"
                    />


                    <button
                        type="submit"
                    >

                        Search

                        <FaArrowRight />

                    </button>


                </form>


            </div>


        </section>

    );

}