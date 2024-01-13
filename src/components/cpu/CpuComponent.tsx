import {Container, HorizontalSection, Label, Section, SectionTitle, StatItem, StatList, Value} from "./styles.ts";
import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import {convertTime} from "../../utils/FrontendUtils.ts";


const CpuComponent = () => {

    const {globalCpu, sysInfo, processes} = useServerEventsContext();

    return (
        <Container>
            <HorizontalSection>
                <Label>Brand</Label>
                <Value>{globalCpu[0]?.brand}</Value>
            </HorizontalSection>

            <HorizontalSection>
                <Label>Uptime</Label>
                <Value>{convertTime(sysInfo?.uptime)}</Value>
            </HorizontalSection>


            <Section>
                <SectionTitle>Average load</SectionTitle>
                <StatList>
                    <StatItem>
                        <Label>1 min</Label>
                        <Value>{sysInfo?.loadAverage.one.toFixed(2)}</Value>
                    </StatItem>

                    <StatItem>
                        <Label>5 min</Label>
                        <Value>{sysInfo?.loadAverage.five.toFixed(2)}</Value>
                    </StatItem>

                    <StatItem>
                        <Label>15 min</Label>
                        <Value>{sysInfo?.loadAverage.fifteen.toFixed(2)}</Value>
                    </StatItem>
                </StatList>
            </Section>

            <Section>
                <SectionTitle>Process name</SectionTitle>
                <StatList>
                    {[...processes]
                        .sort((a, b) => b.cpuUsage - a.cpuUsage)
                        .slice(0, 5)
                        .map((process, index) => (
                            <StatItem key={index}>
                                <Label>{index + 1}. {process.name}</Label>
                                <Value>{process.cpuUsage}%</Value>
                            </StatItem>
                        ))}
                </StatList>
            </Section>
        </Container>
    );
}

export default CpuComponent;