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
  const { disk, diskProcesses } = useServerEventsContext();

  const diskDetails: ListDetail[] = [
    { label: "Name", value: disk?.name ?? "" },
    { label: "File system", value: disk?.fileSystem.toUpperCase() ?? "" },
    // { label: "Location", value: disk.mountPoint },
    // { label: "Type", value: disk.diskType },
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
    {
      label: "Bytes read",
      value: convertBytes(disk?.bytesRead ?? 0, Unit.GB).toFixed(2) + " GB",
    },
    {
      label: "Bytes written",
      value: convertBytes(disk?.bytesWritten ?? 0, Unit.GB).toFixed(2) + " GB",
    },
    // { label: "Removable", value: disk?.isRemovable ? "✅" : "❌" },
  ];

  return (
    <Container>
      <StatList>
        {diskDetails.map((detail, index) => (
          <StatItem key={index} columns={2}>
            <Label>{detail.label}</Label>
            <Value>{detail.value}</Value>
          </StatItem>
        ))}
      </StatList>

      <Section>
        <SectionTitle>Processes</SectionTitle>
        <HeaderItem columns={3}>
          <Label>Process</Label>
          <Value>Read</Value>
          <Value>Write</Value>
        </HeaderItem>
        <StatList>
          {diskProcesses.map((process, index) => (
            <StatItem key={index} columns={3}>
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
