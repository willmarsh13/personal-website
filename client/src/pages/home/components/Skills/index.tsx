import React from "react";
import {DatabaseZap, Gamepad2, LayoutDashboard, Rocket} from "lucide-react";
import {Card, Container} from "../../../../ui";


export default function Skills() {

    const skills = [
        'React',
        'TypeScript',
        'Node.js',
        'Express',
        'MongoDB',
        'MUI',
        'PostgreSQL',
        'Docker',
    ];

    const boxes = [
        {
            icon: <Rocket/>,
            title: 'Rapid Prototyping',
            desc: 'Fast iterations with solid engineering principles.'
        },
        {
            icon: <LayoutDashboard/>,
            title: 'Data Dashboards',
            desc: 'Real-time data visualization and interactive charts.'
        },
        {
            icon: <Gamepad2/>,
            title: 'Game UI Design',
            desc: 'Simple, yet engaging interfaces.'
        },
        {
            icon: <DatabaseZap/>,
            title: 'Backend Architecture',
            desc: 'Scalable, efficient, and secure APIs with a strong DB design.'
        },
    ]

    return (
        <Container size="lg">
            <div className="grid grid--4">
                {boxes.map((item, i) => (
                    <Card className="skill-card" key={i}>
                        <span className="skill-card__icon">{item.icon}</span>
                        <h3 className="skill-card__title">{item.title}</h3>
                        <div className="skill-card__desc">
                            <p className="t-small">{item.desc}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </Container>
    )
}
