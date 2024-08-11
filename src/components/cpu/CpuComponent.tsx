import {StatList} from "./styles.ts";
import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import {convertTime, ListDetail} from "../../utils/FrontendUtils.ts";
import {Container, HorizontalSection, Label, Section, SectionTitle, StatItem, Value} from "../../styles/globals.ts";


const CpuComponent = () => {

    const {cpu, sysInfo, cpuProcesses} = useServerEventsContext();
    const cpuInfo = cpu.at(-1);

    const cpuDetails: ListDetail[] = [
        {
            label: "System",
             value:(cpuInfo?.system && !isNaN(cpuInfo.system) ? cpuInfo.system.toFixed(1) : "0")
            },
        {
            label: "User",
             value: (cpuInfo?.user && !isNaN(cpuInfo.user) ? cpuInfo.user.toFixed(1) : "0")
            },
        {
            label: "Idle",
             value: (cpuInfo?.idle && !isNaN(cpuInfo.idle) ? cpuInfo.idle.toFixed(1) : "0")
            },
    ];

    return (
        <Container>
            <Section>
                <StatList>
                    {cpuDetails.map((detail, index) => (
                        <StatItem key={index}>
                            <Label>{detail.label}</Label>
                            <Value>{detail.value}%</Value>
                        </StatItem>
                    ))}
                </StatList>
            </Section>

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
                    {[...cpuProcesses]
                        .map((process, index) => (
                            <StatItem key={index}>
                                <Label>{index + 1}. {process.name}</Label>
                                <Value>{process.cpu}%</Value>
                            </StatItem>
                        ))}
                </StatList>
            </Section>
        </Container>
    );
}

export default CpuComponent;
