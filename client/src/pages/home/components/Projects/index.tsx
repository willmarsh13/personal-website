import React from "react";
import {project} from "../../index";
import {Button, Card, Chip, Container} from "../../../../ui";


export default function Projects({ projects }: { projects: project[] }) {

    return (
        <Container size="lg">
            <h2 className="t-h2 home-section__title">
                Featured Projects
            </h2>
            <div className="grid grid--2">
                {projects.map((project: project, idx: number) => (
                    <Card as="article" pad="none" interactive className="project-card" key={idx}>
                        <div className="project-card__body">
                            <h3 className="t-h4 project-card__title">
                                {project.name}
                            </h3>
                            <p className="t-small project-card__desc">
                                {project.description}
                            </p>
                            <div className="project-card__tech">
                                {project.tech.map((t, i) => (
                                    <Chip key={i}>{t}</Chip>
                                ))}
                            </div>
                        </div>
                        <div className="project-card__actions">
                            {project.liveDemo && (
                                <Button href={project.liveDemo} target="_blank" variant="solid">
                                    Live Demo
                                </Button>
                            )}
                            {project.repo && (
                                <Button href={project.repo} target="_blank" variant="outline">
                                    GitHub
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </Container>
    )
}
