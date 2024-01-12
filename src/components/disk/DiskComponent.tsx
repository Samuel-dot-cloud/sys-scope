import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import {convertBytes, Unit} from "../../utils/FrontendUtils.ts";
import {Container, Label, StatItem, StatList, Value} from "./styles.ts";

interface DiskDetail {
    name: string;
    value: string | number | undefined;
}

const DiskComponent = () => {
    const {disks} = useServerEventsContext();
    const disk = disks.at(-1)?.data[0];

    const diskDetails: DiskDetail[] = [
        {name: "Name", value: disk?.name},
        {name: "Type", value: disk?.diskType},
        {
            name: "Total storage", value:
                convertBytes(disk?.total ?? 0, Unit.GB).toFixed(2) + ' GB'
        },
        {
            name: "Available storage", value:
                convertBytes(disk?.free ?? 0, Unit.GB).toFixed(2) + ' GB'
        },
        {
            name: "Used storage", value:
                convertBytes(disk?.used ?? 0, Unit.GB).toFixed(2) + ' GB'
        },
        {name: "Location", value: disk?.mountPoint},
        {name: "Removable", value: disk?.isRemovable ? "✅" : "❌"},
        {name: "File system", value: disk?.fileSystem}
    ];

    return (
        <Container>
            <StatList>
                {diskDetails.map((detail, index) => (
                    <StatItem key={index}>
                        <Label>{detail.name}</Label>
                        <Value>{detail.value}</Value>
                    </StatItem>
                ))}
            </StatList>
        </Container>
    );
}

export default DiskComponent;