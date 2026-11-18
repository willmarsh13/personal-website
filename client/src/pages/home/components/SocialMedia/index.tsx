import React from "react";
import {Button, Card, EmailIcon, GitHubIcon, LinkedInIcon} from "../../../../ui";
import {EMAILS, mailto} from "../../../../Shared/emails";

interface socialMedia {
    name: string,
    icon: React.ReactNode,
    URL: string,
    color: 'primary' | 'secondary' | 'success',
}

const socials: socialMedia[] = [
    {
        name: 'LinkedIn',
        icon: <LinkedInIcon size={20}/>,
        URL: 'https://www.linkedin.com/in/willmarsh13',
        color: 'secondary',
    },
    {
        name: 'GitHub',
        icon: <GitHubIcon size={20}/>,
        URL: 'https://github.com/willmarsh13',
        color: 'success',
    },
    {
        name: 'Email',
        icon: <EmailIcon size={20}/>,
        URL: mailto(EMAILS.me),
        color: 'primary',
    }
]

export default function SocialMedia() {
    return (
        <Card pad="none" className="contact-band">
            <h2 className="t-h3 contact-band__title">Contact me!</h2>
            <div className="contact-band__buttons">
                {socials.map((social) => (
                    <Button key={social.name} startIcon={social.icon} href={social.URL} variant="solid" color={social.color}>
                        {social.name}
                    </Button>
                ))}
            </div>
        </Card>
    )

}
