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

const MemoryComponent = () => {
  const { memory, memoryProcesses } = useServerEventsContext();

  const memoryDetails: ListDetail[] = [
    {
      label: "Used",
      value: convertBytes(memory?.used ?? 0, Unit.GB).toFixed(1) + " GB",
    },
    {
      label: "App",
      value: convertBytes(memory?.app ?? 0, Unit.GB).toFixed(1) + " GB",
    },
    {
      label: "Wired",
      value: convertBytes(memory?.wired ?? 0, Unit.GB).toFixed(1) + " GB",
    },
    {
      label: "Compressed",
      value: convertBytes(memory?.compressed ?? 0, Unit.GB).toFixed(1) + " GB",
    },
    {
      label: "Free",
      value: convertBytes(memory?.free ?? 0, Unit.GB).toFixed(1) + " GB",
    },
  ];

  return (
    <Container>
      <Section>
        <StatList>
          {memoryDetails.map((detail, index) => (
            <StatItem key={index} columns={2}>
              <Label>{detail.label}</Label>
              <Value>{detail.value}</Value>
            </StatItem>
          ))}
        </StatList>
      </Section>

      <Section>
        <SectionTitle>Processes</SectionTitle>
        <HeaderItem columns={2}>
          <Label>Process</Label>
          <Value>Memory</Value>
        </HeaderItem>
        <StatList>
          {[...memoryProcesses].map((process, index) => (
            <StatItem key={index} columns={2}>
              <Label>
                {index + 1}.{" "}
                <SmallImage
                  src={`data:image/png;base64,${process.iconBase64}`}
                />{" "}
                {process.name}
              </Label>
              <Value>{process.memory}</Value>
            </StatItem>
          ))}
        </StatList>
      </Section>
    </Container>
  );
};

export default MemoryComponent;
