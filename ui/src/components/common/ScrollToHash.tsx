import {
    useEffect
} from "react";

import {
    useLocation
} from "react-router-dom";


export default function ScrollToHash() {


    const {
        pathname,
        hash
    } = useLocation();


    useEffect(() => {


        if (!hash) {

            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "auto"
            });

            return;

        }


        const targetId =
            decodeURIComponent(
                hash.substring(1)
            );


        const animationFrame =
            window.requestAnimationFrame(
                () => {

                    const element =
                        document.getElementById(
                            targetId
                        );


                    if (!element) {

                        return;

                    }


                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );


        return () => {

            window.cancelAnimationFrame(
                animationFrame
            );

        };


    }, [
        pathname,
        hash
    ]);


    return null;

}