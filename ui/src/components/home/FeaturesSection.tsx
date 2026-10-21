import {
    FaArrowRight,
    FaBuildingColumns,
    FaChartColumn,
    FaFileLines,
    FaIdBadge,
    FaLink,
    FaUserGroup
} from "react-icons/fa6";

import type {
    IconType
} from "react-icons";

import {
    Link
} from "react-router-dom";


interface FeatureItem {

    icon:
    IconType;

    eyebrow:
    string;

    title:
    string;

    description:
    string;

    linkText:
    string;

    href:
    string;

    featured?:
    boolean;

}


const features:
    FeatureItem[] = [

        {
            icon:
                FaUserGroup,

            eyebrow:
                "PEOPLE",

            title:
                "Researcher discovery",

            description:
                "Find researchers by name and optional email, review candidate matches, then explore author information, research analytics and publications.",

            linkText:
                "Find researchers",

            href:
                "/search?mode=author"
        },


        {
            icon:
                FaFileLines,

            eyebrow:
                "OUTPUT",

            title:
                "Publication search",

            description:
                "Search publications directly and refine the dataset with publication date, institution, field, subfield, topic, keyword and publication-type filters.",

            linkText:
                "Search publications",

            href:
                "/search?mode=publications"
        },


        {
            icon:
                FaBuildingColumns,

            eyebrow:
                "ORGANIZATIONS",

            title:
                "Institution analytics",

            description:
                "Select an institution, inspect its research-field distribution and then explore publications scoped specifically to that institution.",

            linkText:
                "Explore institutions",

            href:
                "/search?mode=institution"
        },


        {
            icon:
                FaIdBadge,

            eyebrow:
                "IDENTIFIERS",

            title:
                "ORCID lookup",

            description:
                "Resolve a researcher through ORCID, open the matching author profile and continue into the same research analytics and publication workflow.",

            linkText:
                "Search by ORCID",

            href:
                "/search?mode=orcid"
        },


        {
            icon:
                FaLink,

            eyebrow:
                "IDENTIFIERS",

            title:
                "DOI lookup",

            description:
                "Open a specific scholarly work directly from its DOI when you already know the publication you need to inspect.",

            linkText:
                "Find by DOI",

            href:
                "/search?mode=doi"
        },


        {
            icon:
                FaChartColumn,

            eyebrow:
                "COMPARISON",

            title:
                "Compare research performance",

            description:
                "Compare two to four researchers or institutions side by side using shared research graphs and a concise data summary on a dedicated workspace.",

            linkText:
                "Open comparison",

            href:
                "/compare",

            featured:
                true
        }

    ];


export default function FeaturesSection() {

    return (

        <section
            className="section"
            id="features"
        >

            <div className="container">

                <div className="section-heading">

                    <div>

                        <span className="section-kicker">

                            EXPLORE THE PLATFORM

                        </span>


                        <h2>

                            Start with the research question
                            you need to answer.

                        </h2>

                    </div>


                    <p>

                        Each capability has its own focused workflow.
                        Search, analyze or compare without crowding the
                        home page with the full research workspace.

                    </p>

                </div>


                <div className="feature-grid feature-grid--platform">

                    {
                        features.map(
                            feature => {

                                const Icon =
                                    feature.icon;


                                return (

                                    <article
                                        key={
                                            feature.title
                                        }
                                        className={
                                            feature.featured
                                                ? "feature-card feature-card--featured"
                                                : "feature-card"
                                        }
                                    >

                                        <div className="feature-card-topline">

                                            <div className="feature-icon">

                                                <Icon />

                                            </div>


                                            <span className="feature-eyebrow">

                                                {
                                                    feature.eyebrow
                                                }

                                            </span>

                                        </div>


                                        <h3>

                                            {
                                                feature.title
                                            }

                                        </h3>


                                        <p>

                                            {
                                                feature.description
                                            }

                                        </p>


                                        <Link
                                            to={
                                                feature.href
                                            }
                                        >

                                            {
                                                feature.linkText
                                            }

                                            <FaArrowRight />

                                        </Link>

                                    </article>

                                );

                            }
                        )
                    }

                </div>

            </div>

        </section>

    );

}
