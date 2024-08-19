import {
  Container,
  Icon,
  Label,
  SpeedStats,
  StatItem,
  StatList,
  Value,
} from "./styles.ts";
import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";

const NetworkComponent = () => {
  const { networks } = useServerEventsContext();

  return (
    <Container>
      <SpeedStats>
        <Label>Download speed</Label>
        <Value>{0}</Value>
      </SpeedStats>
      <SpeedStats>
        <Label>Upload speed</Label>
        <Value>{0}</Value>
      </SpeedStats>

      <StatList>
        {[...networks]
          .sort((a, b) => b.data[0].transmitted - a.data[0].transmitted)
          .slice(0, 5)
          .map((network, index) => (
            <StatItem key={index}>
              <Label>
                {index + 1}. {network.data.at(-1)?.name}
              </Label>
              <Value>
                <Icon>↓</Icon>
                {network.data.at(-1)?.received}
                <Icon>↑</Icon>
                {network.data.at(-1)?.transmitted}
              </Value>
            </StatItem>
          ))}
      </StatList>
    </Container>
  );
};

export default NetworkComponent;
