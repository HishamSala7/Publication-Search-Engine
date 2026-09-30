import {
    useState
} from "react";

import {
    FaArrowUpRightFromSquare,
    FaBook,
    FaFileLines,
    FaGraduationCap,
    FaLightbulb,
    FaRegBookmark
} from "react-icons/fa6";

import type {
    IconType
} from "react-icons";


interface SearchResult {

    type: string;

    title: string;

    description: string;

    icon: IconType;

}


const resultTabs = [

    "Publications",

    "Books",

    "Patents",

    "CV & Profile"

];


const searchResults: SearchResult[] = [

    {

        type:
            "JOURNAL ARTICLE · 2026",

        title:
            "Interpretable learning systems for scientific discovery",

        description:
            "Journal of Machine Learning Research · Elena Rodriguez, A. Chen, M. Patel",

        icon:
            FaFileLines

    },


    {

        type:
            "CONFERENCE PAPER · 2025",

        title:
            "Knowledge graphs for interdisciplinary research mapping",

        description:
            "International Conference on Data Mining · Elena Rodriguez, L. Wang",

        icon:
            FaFileLines

    },


    {

        type:
            "PATENT · 2024",

        title:
            "System for semantic analysis of scientific literature",

        description:
            "US Patent Application · Rodriguez, E. · Stanford University",

        icon:
            FaLightbulb

    }

];


export default function SearchResults() {


    const [
        activeTab,
        setActiveTab
    ] = useState(
        "Publications"
    );


    return (

        <div className="results-panel">


            <div className="results-toolbar">


                <div>


                    <span className="muted">

                        Faculty

                    </span>


                    <h3>

                        Dr. Elena Rodriguez

                    </h3>


                    <small>

                        Professor of Computer Science
                        {" · "}
                        Stanford University

                    </small>


                </div>


                <button
                    type="button"
                    className="save-btn"
                >

                    <FaRegBookmark />

                    Save profile

                </button>


            </div>


            <div className="profile-strip">


                <div className="avatar">

                    ER

                </div>


                <div className="profile-facts">


                    <span>

                        <i>

                            <FaFileLines />

                        </i>

                        128 Publications

                    </span>


                    <span>

                        <i>

                            <FaBook />

                        </i>

                        9 Books

                    </span>


                    <span>

                        <i>

                            <FaLightbulb />

                        </i>

                        14 Patents

                    </span>


                    <span>

                        <i>

                            <FaGraduationCap />

                        </i>

                        21 Years

                    </span>


                </div>


            </div>


            <div className="result-tabs">


                {
                    resultTabs.map(
                        tab => (

                            <button
                                type="button"
                                key={tab}
                                className={
                                    activeTab === tab
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveTab(tab)
                                }
                            >

                                {tab}

                            </button>

                        )
                    )
                }


            </div>


            <div className="result-list">


                {
                    searchResults.map(
                        result => {


                            const Icon =
                                result.icon;


                            return (

                                <article
                                    className="result-item"
                                    key={result.title}
                                >


                                    <div className="type-icon">

                                        <Icon />

                                    </div>


                                    <div>


                                        <span className="result-type">

                                            {result.type}

                                        </span>


                                        <h4>

                                            {result.title}

                                        </h4>


                                        <p>

                                            {result.description}

                                        </p>


                                    </div>


                                    <FaArrowUpRightFromSquare
                                        className="result-arrow"
                                    />


                                </article>

                            );

                        }
                    )
                }


            </div>


        </div>

    );

}