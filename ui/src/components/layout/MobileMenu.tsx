import {
    useEffect
} from "react";

import {
    FaAtom,
    FaXmark
} from "react-icons/fa6";

import {
    Link
} from "react-router-dom";


interface MobileMenuProps {

    open: boolean;

    onClose: () => void;

}


export default function MobileMenu({
    open,
    onClose
}: MobileMenuProps) {


    useEffect(() => {


        if (!open) {

            return;

        }


        const previousOverflow =
            document.body.style.overflow;


        document.body.style.overflow =
            "hidden";


        const handleKeyDown = (
            event: KeyboardEvent
        ) => {

            if (
                event.key === "Escape"
            ) {

                onClose();

            }

        };


        document.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {

            document.body.style.overflow =
                previousOverflow;


            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };


    }, [
        open,
        onClose
    ]);


    return (

        <>


            <aside
                className={
                    `mobile-menu ${open
                        ? "open"
                        : ""
                    }`
                }
                aria-hidden={!open}
            >


                <button
                    type="button"
                    className="mobile-close"
                    onClick={onClose}
                    aria-label="Close menu"
                >

                    <FaXmark />

                </button>


                <Link
                    className="brand mobile-brand"
                    to="/"
                    onClick={onClose}
                    aria-label="Scientific Hub home"
                >


                    <span className="brand-mark">

                        <FaAtom />

                    </span>


                    <span>

                        <strong>
                            Scientific
                        </strong>

                        <b>
                            Hub
                        </b>

                    </span>


                </Link>


                <nav>


                    <Link
                        to="/"
                        onClick={onClose}
                    >

                        Home

                    </Link>


                    <Link
                        to="/#features"
                        onClick={onClose}
                    >

                        Features

                    </Link>


                    <Link
                        to="/#how-it-works"
                        onClick={onClose}
                    >

                        How It Works

                    </Link>


                    <Link
                        to="/#subscription"
                        onClick={onClose}
                    >

                        Subscription

                    </Link>


                    <Link
                        to="/#about"
                        onClick={onClose}
                    >

                        About

                    </Link>


                    <Link
                        className="mobile-cta"
                        to="/#search"
                        onClick={onClose}
                    >

                        Explore Faculty

                    </Link>


                </nav>


            </aside>


            <div
                className={
                    `menu-backdrop ${open
                        ? "show"
                        : ""
                    }`
                }
                onClick={onClose}
                aria-hidden="true"
            />


        </>

    );

}