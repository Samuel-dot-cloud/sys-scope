import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import {convertBytes, ListDetail, Unit} from "../../utils/FrontendUtils.ts";
import {Container, HeaderItem, Label, Section, SectionTitle, SmallImage, StatItem, StatList, Value} from "../../styles/globals.ts";


const DiskComponent = () => {
    const {disks, diskProcesses} = useServerEventsContext();
    const disk = disks.at(-1)?.data[0];

    const diskDetails: ListDetail[] = [
        {label: "Name", value: disk?.name},
        {label: "Type", value: disk?.diskType},
        {
            label: "Total storage", value:
                convertBytes(disk?.total ?? 0, Unit.GB).toFixed(2) + ' GB'
        },
        {
            label: "Available storage", value:
                convertBytes(disk?.free ?? 0, Unit.GB).toFixed(2) + ' GB'
        },
        {
            label: "Used storage", value:
                convertBytes(disk?.used ?? 0, Unit.GB).toFixed(2) + ' GB'
        },
        {label: "Location", value: disk?.mountPoint},
        {label: "Bytes read", value: convertBytes(disk?.bytesRead ?? 0, Unit.GB).toFixed(2) + ' GB' },
        {label: "Bytes written", value: convertBytes(disk?.bytesWritten ?? 0, Unit.GB).toFixed(2) + ' GB'},
        {label: "Removable", value: disk?.isRemovable ? "✅" : "❌"},
        {label: "File system", value: disk?.fileSystem}
    ];

    return (
        <Container>
            <StatList>
                {diskDetails.map((detail, index) => (
                    <StatItem key={index}>
                        <Label>{detail.label}</Label>
                        <Value>{detail.value}</Value>
                    </StatItem>
                ))}
            </StatList>

            {/* TODO: Bring back processes list when retrival logic is fixed */}

            {/* <Section>
                <SectionTitle>Processes</SectionTitle>
                <HeaderItem>
                    <Label>Process</Label>
                    <div>
                        <Value>Read Bytes</Value>
                        <Value>Write Bytes</Value>
                    </div>
                </HeaderItem>
                <StatList>
                    {diskProcesses.map((process, index) => (
                        <StatItem key={index}>
                            <Label>
                                <span>{index + 1}.</span>
                                <SmallImage src={`data:image/png;base64,${process.iconBase64}`} alt={`${process.name} icon`} />
                                <span>{process.name}</span>
                            </Label>
                            <Value>{convertBytes(process.bytesRead, Unit.MB) + ' MB/s'}</Value>
                            <Value>{convertBytes(process.bytesWritten, Unit.MB) + ' MB/s'}</Value>
                        </StatItem>
                    ))}
                </StatList>
            </Section> */}
        </Container>
    );
}

export default DiskComponent;
