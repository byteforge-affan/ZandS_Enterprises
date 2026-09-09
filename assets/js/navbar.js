function initNavbar() {

    "use strict";

    const nav = document.getElementById("zsNav");
    const hamburger = document.getElementById("zsHamburger");
    const mobileMenu = document.getElementById("zsMobileMenu");

    if (
        !nav ||
        !hamburger ||
        !mobileMenu
    ) {
        console.error("Navbar elements are missing.");
        return;
    }

    // =========================================================
    // SCROLL
    // =========================================================

    const SCROLL_THRESHOLD = 40;
    let ticking = false;

    function updateScrollState() {

        const scrolled =
            window.scrollY > SCROLL_THRESHOLD;

        nav.classList.toggle(
            "is-scrolled",
            scrolled
        );

        ticking = false;
    }

    window.addEventListener(
        "scroll",
        function () {

            if (!ticking) {

                window.requestAnimationFrame(
                    updateScrollState
                );

                ticking = true;
            }

        },
        { passive: true }
    );

    updateScrollState();


    // =========================================================
    // ACTIVE PAGE
    // =========================================================

    const allNavLinks =
        document.querySelectorAll(
            ".zs-link[data-page], " +
            ".zs-mobile-link[data-page]"
        );

    function getCurrentPageKey() {

        let path =
            window.location.pathname;

        let file =
            path.substring(
                path.lastIndexOf("/") + 1
            );

        if (
            file === "" ||
            file === "index.html"
        ) {
            return "home";
        }

        return file
            .replace(".html", "")
            .toLowerCase();
    }

    function setActivePage(pageKey) {

        allNavLinks.forEach(link => {

            const isActive =
                link.getAttribute("data-page") === pageKey;

            link.classList.toggle(
                "is-active",
                isActive
            );

            if (isActive) {

                link.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                link.removeAttribute(
                    "aria-current"
                );
            }

        });
    }

    setActivePage(
        getCurrentPageKey()
    );


    // =========================================================
    // MOBILE MENU
    // =========================================================

    function openMobileMenu() {

        mobileMenu.classList.add(
            "is-open"
        );

        hamburger.setAttribute(
            "aria-expanded",
            "true"
        );

        hamburger.setAttribute(
            "aria-label",
            "Close menu"
        );

        document.body.style.overflow =
            "hidden";
    }

    function closeMobileMenu() {

        mobileMenu.classList.remove(
            "is-open"
        );

        hamburger.setAttribute(
            "aria-expanded",
            "false"
        );

        hamburger.setAttribute(
            "aria-label",
            "Open menu"
        );

        document.body.style.overflow =
            "";
    }

    function isMobileMenuOpen() {

        return (
            hamburger.getAttribute(
                "aria-expanded"
            ) === "true"
        );
    }

    hamburger.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            if (isMobileMenuOpen()) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }

        }
    );


    // =========================================================
    // OUTSIDE CLICK
    // =========================================================

    document.addEventListener(
        "click",
        function (event) {

            if (
                isMobileMenuOpen() &&
                !mobileMenu.contains(event.target) &&
                !hamburger.contains(event.target)
            ) {

                closeMobileMenu();
            }

        }
    );


    // =========================================================
    // ESCAPE KEY
    // =========================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Escape") {
                return;
            }

            if (isMobileMenuOpen()) {

                closeMobileMenu();
                hamburger.focus();
            }

        }
    );


    // =========================================================
    // NAVIGATION CLICK
    // =========================================================

    allNavLinks.forEach(link => {

        link.addEventListener(
            "click",
            function () {

                const page =
                    link.getAttribute(
                        "data-page"
                    );

                setActivePage(page);

                if (isMobileMenuOpen()) {
                    closeMobileMenu();
                }

            }
        );

    });


    // =========================================================
    // RESIZE
    // =========================================================

    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth > 992 &&
                isMobileMenuOpen()
            ) {

                closeMobileMenu();
            }

        }
    );

}

window.initNavbar = initNavbar;