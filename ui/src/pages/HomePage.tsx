import AboutSection
    from "../components/home/AboutSection";

import FeaturesSection
    from "../components/home/FeaturesSection";

import HeroSlider
    from "../components/home/HeroSlider";

import SearchLaunch
    from "../components/home/SearchLaunch";

import SubscriptionSection
    from "../components/home/SubscriptionSection";

import WorkflowSection
    from "../components/home/WorkflowSection";


export default function HomePage() {

    return (

        <main id="home">

            <HeroSlider />


            <SearchLaunch />


            <FeaturesSection />


            <WorkflowSection />


            <SubscriptionSection />


            <AboutSection />

        </main>

    );

}
