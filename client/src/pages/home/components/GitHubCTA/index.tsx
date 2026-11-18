import React from "react";
import {Button, Card} from "../../../../ui";


export default function GitHubCTA() {

    return (
        <Card pad="lg" className="t-center" style={{marginTop: 80}}>
            <h2 className="t-h4" style={{marginBottom: 8}}>
                Want to see more?
            </h2>
            <p style={{marginBottom: 16}}>
                My GitHub has more side projects, experiments, and contributions.
            </p>
            <Button variant="solid" href="https://github.com/willmarsh13" target="_blank">
                Visit My GitHub
            </Button>
        </Card>
    )
}
