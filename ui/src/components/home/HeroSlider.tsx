import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode
} from "react";

import {
    FaArrowRight,
    FaArrowUpRightFromSquare,
    FaBookOpen,
    FaBuildingColumns,
    FaChevronLeft,
    FaChevronRight,
    FaCrown,
    FaFlask,
    FaGrip,
    FaLightbulb,
    FaRegCirclePlay
} from "react-icons/fa6";

import type {
    IconType
} from "react-icons";

import {
    Link
} from "react-router-dom";


interface HeroSlide {

    eyebrow: string;

    eyebrowIcon: IconType;

    title: ReactNode;

    description: string;

    primaryAction: string;

    primaryTo: string;

    secondaryAction: string;

    secondaryTo: string;

    secondaryIcon: IconType;

}


const slides: HeroSlide[] = [

    {

        eyebrow:
            "Faculty Research Intelligence",

        eyebrowIcon:
            FaFlask,

        title:
            <>
                Discover the complete
                <br />

                <span>
                    scientific footprint
                </span>

                {" "}of any faculty.
            </>,

        description:
            "Search publications, books, patents, affiliations, academic profiles and research activity from one intelligent scientific hub.",

        primaryAction:
            "Get Started",

        primaryTo:
            "#search",

        secondaryAction:
            "See how it works",

        secondaryTo:
            "/#how-it-works",

        secondaryIcon:
            FaRegCirclePlay

    },


    {

        eyebrow:
            "Publications & Books",

        eyebrowIcon:
            FaBookOpen,

        title:
            <>
                Turn scattered research records
                <br />

                into{" "}

                <span>
                    one clear profile.
                </span>
            </>,

        description:
            "Find journal articles, conference papers, books and chapters, then explore a faculty member's research trajectory across time.",

        primaryAction:
            "Search Publications",

        primaryTo:
            "#search",

        secondaryAction:
            "Explore features",

        secondaryTo:
            "/#features",

        secondaryIcon:
            FaGrip

    },


    {

        eyebrow:
            "Patents & Innovation",

        eyebrowIcon:
            FaLightbulb,

        title:
            <>
                Follow ideas from
                <br />

                <span>
                    research to invention.
                </span>
            </>,

        description:
            "Identify patents, inventors, assignees and related faculty records to understand the innovation activity behind an academic profile.",

        primaryAction:
            "Find Innovation",

        primaryTo:
            "#search",

        secondaryAction:
            "View plans",

        secondaryTo:
            "/#subscription",

        secondaryIcon:
            FaArrowUpRightFromSquare

    },


    {

        eyebrow:
            "Institutions & Affiliations",

        eyebrowIcon:
            FaBuildingColumns,

        title:
            <>
                Understand where
                <br />

                <span>
                    research happens.
                </span>
            </>,

        description:
            "Filter by university, institution, department, country, research area and publication period to build focused research intelligence.",

        primaryAction:
            "Explore Faculty",

        primaryTo:
            "#search",

        secondaryAction:
            "Subscribe",

        secondaryTo:
            "/#subscription",

        secondaryIcon:
            FaCrown

    }

];


export default function HeroSlider() {


    const [
        current,
        setCurrent
    ] = useState(0);


    const timerRef =
        useRef<number | null>(
            null
        );


    const restartTimer =
        useCallback(() => {


            if (
                timerRef.current !== null
            ) {

                window.clearInterval(
                    timerRef.current
                );

            }


            timerRef.current =
                window.setInterval(
                    () => {

                        setCurrent(
                            previous =>
                                (
                                    previous + 1
                                )
                                %
                                slides.length
                        );

                    },
                    6500
                );


        }, []);


    useEffect(() => {


        restartTimer();


        return () => {

            if (
                timerRef.current !== null
            ) {

                window.clearInterval(
                    timerRef.current
                );

            }

        };


    }, [
        restartTimer
    ]);


    const previousSlide = () => {


        setCurrent(
            previous =>
                previous === 0
                    ? slides.length - 1
                    : previous - 1
        );


        restartTimer();

    };


    const nextSlide = () => {


        setCurrent(
            previous =>
                (
                    previous + 1
                )
                %
                slides.length
        );


        restartTimer();

    };


    const selectSlide = (
        index: number
    ) => {


        setCurrent(index);


        restartTimer();

    };


    return (

        <section className="hero">


            {
                slides.map(
                    (
                        slide,
                        index
                    ) => {


                        const EyebrowIcon =
                            slide.eyebrowIcon;


                        const SecondaryIcon =
                            slide.secondaryIcon;


                        return (

                            <div
                                key={slide.eyebrow}
                                className={
                                    `hero-slide ${index === current
                                        ? "active"
                                        : ""
                                    }`
                                }
                            >


                                <div
                                    className={
                                        `hero-bg hero-bg-${index + 1}`
                                    }
                                />


                                <div
                                    className="hero-overlay"
                                />


                                <div
                                    className="container hero-content"
                                >


                                    <span className="eyebrow">

                                        <EyebrowIcon />

                                        {slide.eyebrow}

                                    </span>


                                    <h1>

                                        {slide.title}

                                    </h1>


                                    <p>

                                        {slide.description}

                                    </p>


                                    <div className="hero-actions">


                                        <Link
                                            className="btn btn-primary"
                                            to={slide.primaryTo}
                                        >

                                            {slide.primaryAction}

                                            <FaArrowRight />

                                        </Link>


                                        <Link
                                            className="btn btn-ghost"
                                            to={slide.secondaryTo}
                                        >

                                            {slide.secondaryAction}

                                            <SecondaryIcon />

                                        </Link>


                                    </div>


                                    {
                                        index === 0 && (

                                            <div
                                                className="hero-metrics"
                                                style={{
                                                    visibility:
                                                        "hidden"
                                                }}
                                            >


                                                <div>

                                                    <strong>
                                                        360°
                                                    </strong>

                                                    <span>
                                                        Faculty profiles
                                                    </span>

                                                </div>


                                                <div>

                                                    <strong>
                                                        5+
                                                    </strong>

                                                    <span>
                                                        Research data types
                                                    </span>

                                                </div>


                                                <div>

                                                    <strong>
                                                        1
                                                    </strong>

                                                    <span>
                                                        Unified search
                                                    </span>

                                                </div>


                                            </div>

                                        )
                                    }


                                </div>


                                <div className="slide-counter">

                                    {
                                        String(
                                            index + 1
                                        ).padStart(
                                            2,
                                            "0"
                                        )
                                    }

                                    {" / "}

                                    {
                                        String(
                                            slides.length
                                        ).padStart(
                                            2,
                                            "0"
                                        )
                                    }

                                </div>


                            </div>

                        );

                    }
                )
            }


            <button
                type="button"
                className="slider-btn prev"
                onClick={previousSlide}
                aria-label="Previous slide"
            >

                <FaChevronLeft />

            </button>


            <button
                type="button"
                className="slider-btn next"
                onClick={nextSlide}
                aria-label="Next slide"
            >

                <FaChevronRight />

            </button>


            <div className="slider-dots">


                {
                    slides.map(
                        (
                            slide,
                            index
                        ) => (

                            <button
                                type="button"
                                key={slide.eyebrow}
                                className={
                                    index === current
                                        ? "dot active"
                                        : "dot"
                                }
                                onClick={() =>
                                    selectSlide(index)
                                }
                                aria-label={
                                    `Go to slide ${index + 1}`
                                }
                                aria-current={
                                    index === current
                                        ? "true"
                                        : undefined
                                }
                            />

                        )
                    )
                }


            </div>


        </section>

    );

}