import {
    FaAtom,
    FaBolt,
    FaBook,
    FaBuildingColumns,
    FaDatabase,
    FaLightbulb,
    FaLink,
    FaShieldHalved,
    FaUser
} from "react-icons/fa6";

import type {
    IconType
} from "react-icons";


interface AboutPoint {

    icon: IconType;

    title: string;

    description: string;

}


const aboutPoints: AboutPoint[] = [

    {

        icon:
            FaDatabase,

        title:
            "Structured",

        description:
            "research records"

    },


    {

        icon:
            FaBolt,

        title:
            "Fast",

        description:
            "discovery and filtering"

    },


    {

        icon:
            FaLink,

        title:
            "Connected",

        description:
            "faculty and institution data"

    },


    {

        icon:
            FaShieldHalved,

        title:
            "Designed",

        description:
            "for professional research use"

    }

];


export default function AboutSection() {

    return (

        <section
            className="section about"
            id="about"
        >


            <div className="container about-grid">


                <div className="about-visual">


                    <div className="orb orb-1" />

                    <div className="orb orb-2" />


                    <div className="network-card">


                        <div className="network-node center">

                            <FaAtom />

                        </div>


                        <div className="network-node n1">

                            <FaUser />

                        </div>


                        <div className="network-node n2">

                            <FaBook />

                        </div>


                        <div className="network-node n3">

                            <FaLightbulb />

                        </div>


                        <div className="network-node n4">

                            <FaBuildingColumns />

                        </div>


                        <div className="line l1" />

                        <div className="line l2" />

                        <div className="line l3" />

                        <div className="line l4" />


                    </div>


                </div>


                <div className="about-copy">


                    <span className="section-kicker">

                        ABOUT SCIENTIFIC HUB

                    </span>


                    <h2>

                        One platform for a clearer
                        view of academic research.

                    </h2>


                    <p>

                        Scientific Hub is designed as
                        a general scientific engine:
                        a single discovery layer connecting
                        faculty profiles with publications,
                        books, patents, affiliations and
                        institutional context.

                    </p>


                    <div className="about-points">


                        {
                            aboutPoints.map(
                                point => {


                                    const Icon =
                                        point.icon;


                                    return (

                                        <div
                                            key={point.title}
                                        >


                                            <i>

                                                <Icon />

                                            </i>


                                            <span>

                                                <b>
                                                    {point.title}
                                                </b>

                                                {" "}

                                                {point.description}

                                            </span>


                                        </div>

                                    );

                                }
                            )
                        }


                    </div>


                </div>


            </div>


        </section>

    );

}