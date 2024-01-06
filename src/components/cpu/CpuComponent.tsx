import React from "react";
import {Container, Label, Section, SectionTitle, StatItem, StatList, Value} from "./styles.ts";


interface CpuDetail {
    label: string;
    value: string;
}

interface CpuComponentProps {
    usage: string;
    averageLoad: CpuDetail[];
    uptime: string;
    processes: CpuDetail[];
}
const CpuComponent: React.FC<CpuComponentProps> = ({usage, averageLoad, uptime, processes}) => {
    return (
        <Container>
            <Section>
                <SectionTitle>Usage</SectionTitle>
                <Value>{usage}</Value>
            </Section>

            <Section>
                <SectionTitle>Average load</SectionTitle>
                <StatList>
                    {averageLoad.map((load, index) => (
                        <StatItem key={index}>
                            <Label>{load.label}</Label>
                            <Value>{load.value}</Value>
                        </StatItem>
                    ))}
                </StatList>
            </Section>

            <Section>
                <SectionTitle>Uptime</SectionTitle>
                <Value>{uptime}</Value>
            </Section>

            <Section>
                <SectionTitle>Process name</SectionTitle>
                <StatList>
                    {processes.map((process, index) => (
                        <StatItem key={index}>
                            <Label>{index + 1}. {process.label}</Label>
                            <Value>{process.value}</Value>
                        </StatItem>
                    ))}
                </StatList>
            </Section>
        </Container>
    );
}

export default CpuComponent;