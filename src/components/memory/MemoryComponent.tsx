import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import { convertBytes, ListDetail, Unit } from "../../utils/FrontendUtils.ts";
import {
  Container,
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
  const memoryDetail = memory.at(-1);

  const memoryDetails: ListDetail[] = [
    {
      label: "Used",
      value: convertBytes(memoryDetail?.used ?? 0, Unit.GB).toFixed(1) + " GB",
    },
    {
      label: "App",
      value: convertBytes(memoryDetail?.app ?? 0, Unit.GB).toFixed(1) + " GB",
    },
    {
      label: "Wired",
      value: convertBytes(memoryDetail?.wired ?? 0, Unit.GB).toFixed(1) + " GB",
    },
    {
      label: "Compressed",
      value:
        convertBytes(memoryDetail?.compressed ?? 0, Unit.GB).toFixed(1) + " GB",
    },
    {
      label: "Free",
      value: convertBytes(memoryDetail?.free ?? 0, Unit.GB).toFixed(1) + " GB",
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
