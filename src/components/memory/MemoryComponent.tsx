import {Container, Label, Section, StatItem, StatList, Title, Value} from "./styles.ts";
import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import {convertBytes, Unit} from "../../utils/FrontendUtils.ts";

const MemoryComponent = () => {
    const { memory, processes } = useServerEventsContext();
    const memoryDetail = memory.at(-1);

    return (
        <Container>
            <Section>
                <StatList>
                        <StatItem>
                            <Label>Total RAM</Label>
                            <Value>{convertBytes(memoryDetail?.total ?? 0, Unit.GB).toFixed(0) + " GB"}</Value>
                        </StatItem>
                    <StatItem>
                        <Label>Free RAM</Label>
                        <Value>{convertBytes(memoryDetail?.free ?? 0, Unit.GB).toFixed(0) + " GB"}</Value>
                    </StatItem>
                    <StatItem>
                        <Label>Used RAM</Label>
                        <Value>{convertBytes(memoryDetail?.used ?? 0, Unit.GB).toFixed(0) + " GB"}</Value>
                    </StatItem>
                </StatList>
            </Section>

            <Section>
                <Title>Process name</Title>
                <StatList>
                    {[...processes]
                        .sort((a, b) => b.memoryUsage - a.memoryUsage)
                        .slice(0, 5)
                        .map((process, index) => (
                        <StatItem key={index}>
                            <Label>{index + 1}. {process.name}</Label>
                            <Value>{convertBytes(process.memoryUsage, Unit.MB).toFixed(0) + " MB"}</Value>
                        </StatItem>
                    ))}
                </StatList>
            </Section>
        </Container>
    );
}

export default MemoryComponent;