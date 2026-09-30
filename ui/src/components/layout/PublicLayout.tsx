import {
    useCallback,
    useState
} from "react";

import {
    Outlet
} from "react-router-dom";


import BackToTop
    from "../common/BackToTop";

import Footer
    from "./Footer";

import Header
    from "./Header";

import MobileMenu
    from "./MobileMenu";


export default function PublicLayout() {


    const [
        mobileMenuOpen,
        setMobileMenuOpen
    ] = useState(false);


    const openMobileMenu =
        useCallback(() => {

            setMobileMenuOpen(true);

        }, []);


    const closeMobileMenu =
        useCallback(() => {

            setMobileMenuOpen(false);

        }, []);


    return (

        <>

            <Header
                onMenuClick={
                    openMobileMenu
                }
            />


            <MobileMenu
                open={
                    mobileMenuOpen
                }
                onClose={
                    closeMobileMenu
                }
            />


            <Outlet />


            <Footer />


            <BackToTop />

        </>

    );

}