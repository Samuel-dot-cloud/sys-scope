import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import { convertBytes, ListDetail, Unit } from "../../utils/FrontendUtils.ts";
import {
  Container,
  HeaderItem,
  Label,
  Section,
  SectionTitle,
  SmallImage,
  StatItem,
  StatList,
  Value,
} from "../../styles/globals.ts";

const DiskComponent = () => {
  const { disks, diskProcesses } = useServerEventsContext();
  const disk = disks.at(-1)?.data[0];

  const diskDetails: ListDetail[] = [
    { label: "Name", value: disk?.name },
    { label: "Type", value: disk?.diskType },
    {
      label: "Total storage",
      value: convertBytes(disk?.total ?? 0, Unit.GB).toFixed(2) + " GB",
    },
    {
      label: "Available storage",
      value: convertBytes(disk?.free ?? 0, Unit.GB).toFixed(2) + " GB",
    },
    {
      label: "Used storage",
      value: convertBytes(disk?.used ?? 0, Unit.GB).toFixed(2) + " GB",
    },
    // { label: "Location", value: disk?.mountPoint },
    {
      label: "Bytes read",
      value: convertBytes(disk?.bytesRead ?? 0, Unit.GB).toFixed(2) + " GB",
    },
    {
      label: "Bytes written",
      value: convertBytes(disk?.bytesWritten ?? 0, Unit.GB).toFixed(2) + " GB",
    },
    // { label: "Removable", value: disk?.isRemovable ? "✅" : "❌" },
    // { label: "File system", value: disk?.fileSystem },
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

      <Section>
        <SectionTitle>Processes</SectionTitle>
        <HeaderItem>
          <Label>Process</Label>
          <div>
            <Value>Read</Value>
            <Value>Write</Value>
          </div>
        </HeaderItem>
        <StatList>
          {diskProcesses.map((process, index) => (
            <StatItem key={index}>
              <Label>
                <span>{index + 1}.</span>
                <SmallImage
                  src={`data:image/png;base64,${process.iconBase64}`}
                  alt={`${process.name} icon`}
                />
                <span>{process.name}</span>
              </Label>
              <Value>{process.bytesRead}</Value>
              <Value>{process.bytesWritten}</Value>
            </StatItem>
          ))}
        </StatList>
      </Section>
    </Container>
  );
};

export default DiskComponent;
