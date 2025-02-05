import h from "@macrostrat/hyper";
import { MacrostratIcon } from "~/components";

export function Image({ src, className, width, height, onClick }) {
    const srcWithAddedPrefix = "https://storage.macrostrat.org/assets/rockd/" + src;
    return h("img", {src: srcWithAddedPrefix, className, width, height, onClick})
}

export function BlankImage({ src, className, width, height }) {
    return h("img", {src: src, className, width, height})
}

export function Navbar() {
    return h("div", {className: "nav"}, [
        h("ul", [
            h("li", h("a", {href: "/dev/test-site/main-page"}, h(MacrostratIcon))),
            h("li", h("a", {href: "/dev/test-site/about"}, "About")),
            h("li", h("a", {href: "/dev/test-site/publications"}, "Publications")),
            h("li", h("a", {href: "/dev/test-site/people"}, "People")),
            h("li", h("a", {href: "/dev/test-site/donate"}, "Donate"))
        ])
    ]);
}

export function Footer() {
    return h("div", {className: "footer"}, [
        h("div", {className: "titles"}, [
            h("h3", {className: "footer-text"}, [
                "Produced by the ",
                h("a", {href: "https://macrostrat.org"} , "UW Macrostrat Lab")
            ]),
            h("h3", {className: "footer-text"}, [
                "Funded by ",
                h("a", {href: "https://nsf.gov"}, "NSF"),
                " and ",
                h("a", {href: "http://geoscience.wisc.edu/geoscience/"}, "UW Geoscience")
            ])
        ]),
        h("ul", {className: "footer-links"},[
            h("li", h("a", {href: "/dev/test-site"}, "Home")),
            h("li", h("a", {href: "/dev/test-site/explore"}, "Explore")),
            h("li", h("a", {href: "/dev/test-site/privacy"}, "Privacy Policy")),
            h("li", h("a", {href: "/dev/test-site/terms"}, "Terms and Conditions")),
            h("li", h("a", {href: "/dev/test-site/trip?trip=1"}, "Trips")),
            h("li", h("a", {href: "/dev/test-site/metrics"}, "Metrics")),
        ])
    ]);
}