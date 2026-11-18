import {useEffect, useRef, useState} from 'react';
import React from 'react';
import ThreeScene from "./components/ThreeScene";
import Intro from "./components/Intro";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import SocialMedia from "./components/SocialMedia";
import Guestbook from "./components/Guestbook";
import {useLocation} from "react-router-dom";
import {scrollToSection} from "../../Shared/scrollToSection";
import {Card, Container} from "../../ui";
import {useFeatures} from "../../Shared/features";
import "./home.css";

const startDate = new Date('2020-01-01');
const getYearsOfExperience = () => {
    const now = new Date();
    const years = now.getFullYear() - startDate.getFullYear();
    const hasHadAnniversary =
        now.getMonth() > startDate.getMonth() ||
        (now.getMonth() === startDate.getMonth() && now.getDate() >= startDate.getDate());
    return hasHadAnniversary ? years : years - 1;
};

export interface project {
    name: string,
    description: string,
    tech: string[],
    liveDemo: string,
    repo: string,
}

const projects: project[] = [
    {
        name: 'Custom Home Automation',
        description: 'A web app running locally on a Raspberry Pi with custom ground-up authentication to control smart devices via Govee API.',
        tech: ['React', 'MUI', 'Node.js', 'MongoDB'],
        liveDemo: '',
        repo: '',
    },
    {
        name: 'Catan Board Generator',
        description: 'A generator for randomized, fair Catan boards deployed on a personal website.',
        tech: ['React', 'Tailwind'],
        liveDemo: '',
        repo: '',
    },
    {
        name: 'Personal Website',
        description: 'The website you are on now! A playground for me to try new tech and deploy new solutions.',
        tech: ['React', 'TypeScript', 'MongoDB', 'AWS'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/personal-website',
    },
    {
        name: 'Dodge The Creeps',
        description: 'My first attempt at video game design. Avoid the Aliens and try to beat your high score!',
        tech: ['GoDot'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/DodgeTheCreeps',
    },
    {
        name: 'Machine Learning Tetris Solver',
        description: 'Using Machine Learning, I beat my personal Tetris record!',
        tech: ['Java'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/TetrisAI',
    },
    {
        name: 'Bookstore Demo',
        description: 'A sample UI/UX for an online bookstore. Created as a part of my masters curriculum.',
        tech: ['Java', 'Gradle', 'TypeScript', 'HTML', 'CSS'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/BookstoreDemo',
    },
    {
        name: 'Fancy Gallery Android App',
        description: 'An Android OS app built to display images in recycler containers in addition to pinning pictures to coordinates on a map.',
        tech: ['Java', 'Kotlin', 'XML'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/FancyGallery',
    },
    {
        name: 'ML Dog Breed Image Classifier',
        description: 'Find out what breed your dog is based on physical characteristics.',
        tech: ['Java', 'Kotlin', 'XML'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/MLDogBreedClassifier',
    },
];

export default function HomePage() {
    const [experience, setExperience] = useState(getYearsOfExperience());
    const clumpContainerRef = useRef<HTMLDivElement>(null);
    const {hash} = useLocation();
    const features = useFeatures();

    // Support links like /#guestbook (and the old /guestbook redirect).
    useEffect(() => {
        if (hash) scrollToSection(decodeURIComponent(hash.slice(1)));
    }, [hash]);

    useEffect(() => {
        const timer = setInterval(() => {
            setExperience(getYearsOfExperience());
        }, 1000 * 60 * 60 * 24);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="home-hero">
                <div className="home-hero__intro">
                    <Intro/>
                </div>
                <div className="home-hero__engine" ref={clumpContainerRef}>
                    <ThreeScene/>
                    <p className="t-small t-center home-hero__hint">
                        Click and drag to play with the engine!
                    </p>
                </div>
            </section>

            <section className="home-stats">
                <Container size="lg" className="home-stats__row">
                    <Card className="home-stat">
                        <span className="home-stat__value">{experience}+</span>
                        <span className="home-stat__label">Years of Experience</span>
                    </Card>
                    <Card className="home-stat">
                        <span className="home-stat__value">10+</span>
                        <span className="home-stat__label">Projects Completed</span>
                    </Card>
                </Container>
            </section>

            <section className="home-about-wrap">
                <Card as="article" pad="none" className="home-about">
                    <img src="/assets/profile.jpg" alt="Will Marsh Headshot" className="home-about__photo"/>
                    <div className="home-about__text">
                        <h2 className="t-h1">About</h2>
                        <p className="t-body">
                            I am passionate about having technology work for people, not the other way around. At Delta Air Lines, 
                            I am able to put this practice to the test as the Technical Product Owner for the Fly Delta app, where 
                            I specialize in integrating deeplinks and personalization into the Fly Delta app. 
                            <br/><br/>
                            When users navigate to the app, we have the technology work for the user by managing as much of the heavy 
                            lifting as possible. Whether the user is trying to check in for an upcoming flight or quickly trying to 
                            pull up their boarding pass, these integrations help make our digital applications the platform of choice 
                            for users when choosing to fly Delta.
                            <br/><br/>
                            My commitment to doing things the right way stems from my hobby as a private pilot where safety, precision 
                            and systems-thinking are critical. In my free time, I like to create web apps to make people's lives easier. 
                            I also enjoy skiing with my wife and taking my dog, Goose on long walks and hikes in the Blue Ridge mountains.
                            <br/><br/>
                            <b>Want to learn more? Scroll down or send me an email!</b>
                        </p>
                    </div>
                </Card>
            </section>

            {/* Projects Section */}
            <section id='projects' className="home-section">
                <Projects projects={projects}/>
            </section>

            {/* Highlights Section */}
            <section id='skills' className="home-section home-section--skills">
                <Skills/>
            </section>

            <section id='contact' className="home-section--contact">
                <SocialMedia/>
            </section>

            {features.guestbook && (
                <section id='guestbook' className="home-section--guestbook">
                    <Guestbook/>
                </section>
            )}
        </div>
    );
}
