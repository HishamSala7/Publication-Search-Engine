import {
    FaAtom,
    FaEnvelope,
    FaGithub,
    FaLinkedinIn,
    FaLocationDot,
    FaPhone,
    FaXTwitter
} from "react-icons/fa6";

import {
    Link
} from "react-router-dom";


export default function Footer() {

    return (

        <footer className="footer">


            <div className="container footer-grid">


                <div className="footer-about">


                    <Link
                        className="brand footer-brand"
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


                    <p>

                        A scientific discovery platform
                        for understanding faculty research,
                        publications, patents and
                        institutional affiliations.

                    </p>


                    <div className="footer-social">


                        <a
                            href="#"
                            aria-label="LinkedIn"
                        >

                            <FaLinkedinIn />

                        </a>


                        <a
                            href="#"
                            aria-label="X"
                        >

                            <FaXTwitter />

                        </a>


                        <a
                            href="#"
                            aria-label="GitHub"
                        >

                            <FaGithub />

                        </a>


                    </div>


                </div>


                <div className="footer-col">


                    <h3>
                        Platform
                    </h3>


                    <Link to="/search">

                        Faculty Search

                    </Link>


                    <Link to="/#features">

                        Features

                    </Link>


                    <Link to="/search#preview">

                        Research Explorer

                    </Link>


                    <Link to="/#subscription">

                        Subscription

                    </Link>


                </div>


                <div className="footer-col">


                    <h3>
                        Resources
                    </h3>


                    <Link to="/#how-it-works">

                        How It Works

                    </Link>


                    <Link to="/#about">

                        About Scientific Hub

                    </Link>


                    <a href="#">

                        Documentation

                    </a>


                    <a href="#">

                        API Access

                    </a>


                </div>


                <div className="footer-col">


                    <h3>
                        Contact
                    </h3>


                    <p>

                        <i>
                            <FaEnvelope />
                        </i>

                        support@scientifichub.org

                    </p>


                    <p>

                        <i>
                            <FaPhone />
                        </i>

                        +1 800 555 0198

                    </p>


                    <p>

                        <i>
                            <FaLocationDot />
                        </i>

                        Research Technology Center

                    </p>


                </div>


            </div>


            <div className="footer-bottom">


                <div className="container footer-bottom-inner">


                    <span>

                        © 2026 Scientific Hub.
                        All rights reserved.

                    </span>


                    <div>


                        <a href="#">

                            Privacy Policy

                        </a>


                        <a href="#">

                            Terms of Service

                        </a>


                        <a href="#">

                            Support

                        </a>


                    </div>


                </div>


            </div>


        </footer>

    );

}