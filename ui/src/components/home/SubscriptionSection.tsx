import {
    FaArrowRight,
    FaCheck,
    FaCircleCheck
} from "react-icons/fa6";


interface SubscriptionFeature {

    text: string;

}


const subscriptionFeatures: SubscriptionFeature[] = [

    {

        text:
            "Advanced filtering and multi-criteria search"

    },


    {

        text:
            "Extended faculty profiles and research history"

    },


    {

        text:
            "Saved searches and faculty watchlists"

    },


    {

        text:
            "Export and reporting tools"

    }

];


const planFeatures = [

    "Advanced filters",

    "Saved profiles",

    "Research exports",

    "Priority support"

];


export default function SubscriptionSection() {

    return (

        <section
            className="section subscription"
            id="subscription"
        >


            <div className="container">


                <div className="subscription-copy">


                    <span className="section-kicker">

                        SUBSCRIPTION

                    </span>


                    <h2>

                        Go beyond basic search.

                    </h2>


                    <p>

                        Subscription unlocks deeper research
                        discovery tools for professionals
                        who need to work with faculty data
                        regularly.

                    </p>


                    <ul>


                        {
                            subscriptionFeatures.map(
                                item => (

                                    <li
                                        key={item.text}
                                    >

                                        <i>

                                            <FaCheck />

                                        </i>

                                        {item.text}

                                    </li>

                                )
                            )
                        }


                    </ul>


                    <a
                        className="btn btn-primary"
                        href="#plans"
                    >

                        See subscription options

                        <FaArrowRight />

                    </a>


                </div>


                <div
                    className="plan-card"
                    id="plans"
                >


                    <div className="plan-badge">

                        PROFESSIONAL

                    </div>


                    <h3>

                        Scientific Hub Pro

                    </h3>


                    <p>

                        For researchers, analysts and institutions.

                    </p>


                    <div className="price">

                        <strong>
                            $29
                        </strong>

                        <span>
                            / month
                        </span>

                    </div>


                    <div className="plan-divider" />


                    {
                        planFeatures.map(
                            feature => (

                                <div
                                    className="plan-line"
                                    key={feature}
                                >


                                    <span>

                                        <i>

                                            <FaCircleCheck />

                                        </i>

                                        {feature}

                                    </span>


                                    <b>

                                        Included

                                    </b>


                                </div>

                            )
                        )
                    }


                    <a
                        href="#"
                        className="plan-btn"
                    >

                        Subscribe now

                    </a>


                    <small>

                        No commitment. Cancel anytime.

                    </small>


                </div>


            </div>


        </section>

    );

}