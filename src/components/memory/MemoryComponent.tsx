import {Container, Label, Section, StatItem, StatList, Title, Value} from "./styles.ts";

interface MemoryDetail {
    label: string;
    value: string | number;
}

interface ProcessDetail {
    name: string;
    ram: string;
}

interface MemoryComponentProps {
    memoryDetails: MemoryDetail[];
    processes: ProcessDetail[];
}

const MemoryComponent: React.FC<MemoryComponentProps> = ({ memoryDetails, processes}) => {
    return (
        <Container>
            <Section>
                <StatList>
                    {memoryDetails.map((detail, index) => (
                        <StatItem key={index}>
                            <Label>{detail.label}</Label>
                            <Value>{detail.value}</Value>
                        </StatItem>
                    ))}
                </StatList>
            </Section>

            <Section>
                <Title>Process name</Title>
                <StatList>
                    {processes.map((process, index) => (
                        <StatItem key={index}>
                            <Label>{index + 1}. {process.name}</Label>
                            <Value>{process.ram}</Value>
                        </StatItem>
                    ))}
                </StatList>
            </Section>
        </Container>
    );
}

export default MemoryComponent;