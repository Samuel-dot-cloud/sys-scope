import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import { formatTime, ListDetail } from "../../utils/FrontendUtils.ts";
import {
  Container,
  Label,
  SectionTitle,
  StatItem,
  StatList,
  Value,
  SmallImage,
  Section,
  HeaderItem,
} from "../../styles/globals.ts";

const BatteryComponent = () => {
  const { battery, batteryProcesses } = useServerEventsContext();

  const powerDetails: ListDetail[] = [
    { label: "Power source", value: battery?.powerSource ?? "" },
    {
      label: "Percentage",
      value: `${battery?.chargePercent.toFixed(0) ?? 0}%`,
    },
    { label: "Cycle Count", value: battery?.cycleCount },
    {
      label: "Time to full battery",
      value: formatTime(battery?.secsUntilFull ?? 0 * 60),
    },
    {
      label: "Time to empty battery",
      value: formatTime(battery?.secsUntilEmpty ?? 0 * 60),
    },
    {
      label: "Temperature",
      value: `${battery?.temperature.toFixed(1) ?? 30} °C`,
    },
    { label: "Voltage", value: `${battery?.voltage.toFixed(1) ?? 0} V` },
    {
      label: "Energy rate",
      value: `${battery?.powerConsumptionRateWatts.toFixed(1) ?? 0} W`,
    },
  ];

  return (
    <Container>
      <StatList>
        {powerDetails.map((detail, index) => (
          <StatItem key={index} columns={2}>
            <Label>{detail.label}</Label>
            <Value>{detail.value}</Value>
          </StatItem>
        ))}
      </StatList>

      <Section>
        <SectionTitle>Processes</SectionTitle>
        <HeaderItem columns={2}>
          <Label>Process</Label>
          <Value>Energy Impact</Value>
        </HeaderItem>
        <StatList>
          {[...batteryProcesses].slice(0, 7).map((process, index) => (
            <StatItem key={index} columns={2}>
              <Label>
                {index + 1}.{" "}
                <SmallImage
                  src={`data:image/png;base64,${process.iconBase64}`}
                />{" "}
                {process.name}
              </Label>
              <Value>{process.power}%</Value>
            </StatItem>
          ))}
        </StatList>
      </Section>
    </Container>
  );
};

export default BatteryComponent;
