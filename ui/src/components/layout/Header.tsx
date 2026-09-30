import {
    FaAtom,
    FaEnvelope,
    FaGlobe,
    FaLinkedinIn,
    FaMagnifyingGlass,
    FaPhone,
    FaUser,
    FaXTwitter
} from "react-icons/fa6";

import {
    Link,
    NavLink
} from "react-router-dom";


import useScrolled
    from "../../hooks/useScrolled";


interface HeaderProps {

    onMenuClick: () => void;

}


export default function Header({
    onMenuClick
}: HeaderProps) {


    const scrolled =
        useScrolled(70);


    return (

        <>

            <div className="header-top">


                <div className="container utility-inner">


                    <div className="utility-contact">


                        <span>

                            <i>
                                <FaEnvelope />
                            </i>

                            support@scientifichub.org

                        </span>


                        <span>

                            <i>
                                <FaPhone />
                            </i>

                            +1 800 555 0198

                        </span>


                    </div>


                    <div className="utility-actions">


                        <a
                            href="#"
                            aria-label="LinkedIn"
                        >

                            <i>
                                <FaLinkedinIn />
                            </i>

                        </a>


                        <a
                            href="#"
                            aria-label="X"
                        >

                            <i>
                                <FaXTwitter />
                            </i>

                        </a>


                        <a href="#">

                            <i>
                                <FaGlobe />
                            </i>

                            EN

                        </a>


                        <a href="#">

                            <i>
                                <FaUser />
                            </i>

                            Sign in

                        </a>


                    </div>


                </div>


            </div>


            <header
                className={
                    `site-header ${scrolled
                        ? "scrolled"
                        : ""
                    }`
                }
            >


                <div className="container nav-inner">


                    <Link
                        className="brand"
                        to="/"
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


                    <nav
                        className="desktop-nav"
                        aria-label="Primary navigation"
                    >


                        <NavLink
                            to="/"
                            end
                            className={({
                                isActive
                            }) =>
                                isActive
                                    ? "active"
                                    : undefined
                            }
                        >

                            Home

                        </NavLink>


                        <Link to="/#features">

                            Features

                        </Link>


                        <Link to="/#how-it-works">

                            How It Works

                        </Link>


                        <Link to="/#subscription">

                            Subscription

                        </Link>


                        <Link to="/#about">

                            About

                        </Link>


                        <Link
                            className="nav-cta"
                            to="/#search"
                        >

                            <FaMagnifyingGlass />

                            Explore Faculty

                        </Link>


                    </nav>


                    <button
                        type="button"
                        className="mobile-toggle"
                        onClick={onMenuClick}
                        aria-label="Open menu"
                    >

                        <span />

                        <span />

                        <span />

                    </button>


                </div>


            </header>

        </>

    );

}