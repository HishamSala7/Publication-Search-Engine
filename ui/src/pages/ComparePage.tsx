import {
    FaArrowLeft,
    FaBuildingColumns,
    FaChartColumn,
    FaUserGroup
} from "react-icons/fa6";

import {
    Link
} from "react-router-dom";

import ComparisonSection
    from "../components/comparison/ComparisonSection";


export default function ComparePage() {

    return (

        <main className="compare-page">

            <section className="compare-page-hero">

                <div className="container compare-page-hero-inner">

                    <div className="compare-page-hero-copy">

                        <Link
                            className="compare-page-back"
                            to="/#features"
                        >

                            <FaArrowLeft />

                            Back to platform features

                        </Link>


                        <span className="section-kicker">

                            RESEARCH COMPARISON

                        </span>


                        <h1>

                            Compare research performance
                            without losing the underlying data.

                        </h1>


                        <p>

                            Select two to four researchers or institutions,
                            inspect the shared graph, then review the
                            supporting figures beneath the visualization.

                        </p>

                    </div>


                    <div className="compare-page-hero-preview">

                        <div className="compare-preview-heading">

                            <FaChartColumn />

                            <span>

                                Dedicated comparison workspace

                            </span>

                        </div>


                        <div className="compare-preview-option">

                            <FaUserGroup />

                            <div>

                                <strong>

                                    Researchers

                                </strong>


                                <span>

                                    Compare up to four author profiles.

                                </span>

                            </div>

                        </div>


                        <div className="compare-preview-option">

                            <FaBuildingColumns />

                            <div>

                                <strong>

                                    Institutions

                                </strong>


                                <span>

                                    Compare publication fields side by side.

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            <ComparisonSection />

        </main>

    );

}
