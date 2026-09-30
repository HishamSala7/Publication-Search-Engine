import {
    FaChartPie,
    FaLayerGroup,
    FaMagnifyingGlass,
    FaSliders
} from "react-icons/fa6";

import type {
    IconType
} from "react-icons";


interface WorkflowStep {

    number: string;

    icon: IconType;

    title: string;

    description: string;

}


const workflowSteps: WorkflowStep[] = [

    {

        number:
            "01",

        icon:
            FaMagnifyingGlass,

        title:
            "Search",

        description:
            "Enter a faculty name, ORCID, institution or keyword."

    },


    {

        number:
            "02",

        icon:
            FaSliders,

        title:
            "Filter",

        description:
            "Narrow results by year, journal, university, affiliation and discipline."

    },


    {

        number:
            "03",

        icon:
            FaLayerGroup,

        title:
            "Explore",

        description:
            "Open publications, books, patents and structured CV information."

    },


    {

        number:
            "04",

        icon:
            FaChartPie,

        title:
            "Understand",

        description:
            "See the research profile and activity as a connected whole."

    }

];


export default function WorkflowSection() {

    return (

        <section
            className="section section-alt"
            id="how-it-works"
        >


            <div className="container">


                <div className="section-heading centered">


                    <span className="section-kicker">

                        HOW IT WORKS

                    </span>


                    <h2>

                        From a name to research intelligence
                        in four steps.

                    </h2>


                    <p>

                        Designed for researchers,
                        universities, R&D teams,
                        librarians and anyone who needs
                        a reliable faculty research overview.

                    </p>


                </div>


                <div className="steps">


                    {
                        workflowSteps.map(
                            step => {


                                const Icon =
                                    step.icon;


                                return (

                                    <div
                                        className="step"
                                        key={step.number}
                                    >


                                        <span>

                                            {step.number}

                                        </span>


                                        <i>

                                            <Icon />

                                        </i>


                                        <h3>

                                            {step.title}

                                        </h3>


                                        <p>

                                            {step.description}

                                        </p>


                                    </div>

                                );

                            }
                        )
                    }


                </div>


            </div>


        </section>

    );

}