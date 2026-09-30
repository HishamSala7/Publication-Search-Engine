import {
    useEffect,
    useState
} from "react";

import {
    FaChevronUp
} from "react-icons/fa6";


export default function BackToTop() {


    const [
        visible,
        setVisible
    ] = useState(false);


    useEffect(() => {


        const handleScroll = () => {

            setVisible(
                window.scrollY > 450
            );

        };


        handleScroll();


        window.addEventListener(
            "scroll",
            handleScroll,
            {
                passive: true
            }
        );


        return () => {

            window.removeEventListener(
                "scroll",
                handleScroll
            );

        };


    }, []);


    const handleClick = () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


    return (

        <button
            type="button"
            className={
                `back-to-top ${visible ? "show" : ""}`
            }
            onClick={handleClick}
            aria-label="Back to top"
        >

            <FaChevronUp />

        </button>

    );

}