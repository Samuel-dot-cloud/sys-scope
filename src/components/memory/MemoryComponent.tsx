import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import {convertBytes, ListDetail, Unit} from "../../utils/FrontendUtils.ts";
import {Container, Label, Section, StatItem, StatList, Title, Value} from "../../styles/globals.ts";

const MemoryComponent = () => {
    const { memory, processes } = useServerEventsContext();
    const memoryDetail = memory.at(-1);

    const memoryDetails: ListDetail[] = [
        {label: "Used", value: convertBytes(memoryDetail?.used ?? 0, Unit.GB).toFixed(1) + " GB"},
        {label: "App", value: convertBytes(memoryDetail?.app ?? 0, Unit.GB).toFixed(1) + " GB"},
        {label: "Wired", value: convertBytes(memoryDetail?.wired ?? 0, Unit.GB).toFixed(1) + " GB"},
        {label: "Compressed", value: convertBytes(memoryDetail?.compressed ?? 0, Unit.GB).toFixed(1) + " GB"},
        {label: "Free", value: convertBytes(memoryDetail?.free ?? 0, Unit.GB).toFixed(1) + " GB"},
    ];

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
