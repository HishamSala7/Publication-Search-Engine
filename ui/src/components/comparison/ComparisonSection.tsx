import {
    useState
} from "react";

import {
    FaBuildingColumns,
    FaUserGroup
} from "react-icons/fa6";

import InstitutionComparison
    from "./InstitutionComparison";

import ResearcherComparison
    from "./ResearcherComparison";

import "../../styles/comparison.css";


type ComparisonMode =
    | "researchers"
    | "institutions";


export default function ComparisonSection() {

    const [
        mode,
        setMode
    ] = useState<ComparisonMode>(
        "researchers"
    );


    return (

        <section
            className="section section-alt comparison-section comparison-section--page"
            id="compare-workspace"
        >

            <div className="container">

                <div className="comparison-page-intro">

                    <div>

                        <span className="section-kicker">

                            BUILD YOUR COMPARISON

                        </span>


                        <h2>

                            Choose what you want
                            to compare.

                        </h2>

                    </div>


                    <p>

                        Researcher comparison and institution comparison
                        use separate datasets, so choose a mode first and
                        then add between two and four entities.

                    </p>

                </div>


                <div
                    className="comparison-mode-selector"
                    aria-label="Comparison type"
                >

                    <button
                        type="button"
                        className={
                            mode
                                ===
                                "researchers"
                                ? "active"
                                : ""
                        }
                        aria-pressed={
                            mode
                            ===
                            "researchers"
                        }
                        onClick={() =>
                            setMode(
                                "researchers"
                            )
                        }
                    >

                        <FaUserGroup />

                        Researchers

                    </button>


                    <button
                        type="button"
                        className={
                            mode
                                ===
                                "institutions"
                                ? "active"
                                : ""
                        }
                        aria-pressed={
                            mode
                            ===
                            "institutions"
                        }
                        onClick={() =>
                            setMode(
                                "institutions"
                            )
                        }
                    >

                        <FaBuildingColumns />

                        Institutions

                    </button>

                </div>


                {
                    mode
                        ===
                        "researchers"
                        ? <ResearcherComparison />
                        : <InstitutionComparison />
                }

            </div>

        </section>

    );

}
