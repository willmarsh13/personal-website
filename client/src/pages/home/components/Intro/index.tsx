import React from "react";
import {Container} from "../../../../ui";

export default function Intro() {

    return (
        <div className="intro">
            <Container size="lg" className="intro__inner">
                <h1 className="t-display intro__title">
                    👋 Hi, I'm Will Marsh
                </h1>
                <p className="t-lead intro__lead">
                    Technical Product Owner for Delta Air Lines, focused on building intuitive mobile applications that are consistent and user friendly.
                </p>
                <p className="intro__cta">
                    Scroll down to see some of my projects!
                </p>
            </Container>
        </div>
    )

}
