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
  const { batteries, batteryProcesses } = useServerEventsContext();
  const battery = batteries.at(-1);

  const powerDetails: ListDetail[] = [
    { label: "Power source", value: battery?.vendor },
    {
      label: "Percentage",
      value: `${battery?.chargePercent.toFixed(0) ?? 0}%`,
    },
    // {label: 'State', value: battery?.state},
    { label: "Cycle Count", value: battery?.cycleCount },
    // {label: 'Technology', value: battery?.technology},
    // {
    //   label: "Health",
    //   value: `${battery?.healthPercent.toFixed(0)}%`,
    // },
    {
      label: "Time to full battery",
      value: formatTime(battery?.secsUntilFull ?? 0),
    },
    {
      label: "Time to empty battery",
      value: formatTime(battery?.secsUntilEmpty ?? 0),
    },
    {
      label: "Temperature",
      value: `${battery?.temperature.toFixed(1) ?? 30} °C`,
    },
    // {label: 'Charge', value: `${battery?.energy.toFixed(3)} MJ / ${batteries.at(-1)?.energyFull.toFixed(3)} MJ`},
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
          {[...batteryProcesses].slice(0, 5).map((process, index) => (
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
