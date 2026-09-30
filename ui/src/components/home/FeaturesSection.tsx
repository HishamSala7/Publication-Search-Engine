import {
    FaArrowRight,
    FaBook,
    FaBuildingColumns,
    FaChartLine,
    FaFileLines,
    FaIdCard,
    FaLightbulb
} from "react-icons/fa6";

import type {
    IconType
} from "react-icons";


interface FeatureItem {

    icon: IconType;

    title: string;

    description: string;

    linkText: string;

}


const features: FeatureItem[] = [

    {

        icon:
            FaFileLines,

        title:
            "Publications",

        description:
            "Explore journal articles, conference papers, citations, years, co-authors and publication venues.",

        linkText:
            "Explore records"

    },


    {

        icon:
            FaBook,

        title:
            "Books & Chapters",

        description:
            "Discover books, edited volumes and chapters associated with a faculty member's academic record.",

        linkText:
            "Find books"

    },


    {

        icon:
            FaLightbulb,

        title:
            "Patents",

        description:
            "Trace inventions, patent families, inventors, assignees and filing or publication dates.",

        linkText:
            "Search patents"

    },


    {

        icon:
            FaIdCard,

        title:
            "Academic CV",

        description:
            "View a structured faculty profile with education, positions, affiliations, research interests and links.",

        linkText:
            "View profiles"

    },


    {

        icon:
            FaBuildingColumns,

        title:
            "Institutions",

        description:
            "Filter and connect researchers by university, department, laboratory, center and affiliation.",

        linkText:
            "Browse institutions"

    },


    {

        icon:
            FaChartLine,

        title:
            "Research Analytics",

        description:
            "Use publication timelines, subject areas and research indicators to identify meaningful patterns.",

        linkText:
            "Analyze research"

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

                            POWERFUL RESEARCH DISCOVERY

                        </span>


                        <h2>

                            Everything about a faculty member,
                            in one place.

                        </h2>

                    </div>


                    <p>

                        Scientific Hub brings together
                        the information researchers,
                        universities and analysts need
                        to understand academic activity quickly.

                    </p>


                </div>


                <div className="feature-grid">


                    {
                        features.map(
                            feature => {


                                const Icon =
                                    feature.icon;


                                return (

                                    <article
                                        key={feature.title}
                                        className="feature-card"
                                    >


                                        <div className="feature-icon">

                                            <Icon />

                                        </div>


                                        <h3>

                                            {feature.title}

                                        </h3>


                                        <p>

                                            {feature.description}

                                        </p>


                                        <a href="#search">

                                            {feature.linkText}

                                            <FaArrowRight />

                                        </a>


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