import {Container, Label, StatItem, StatList, Value} from "./styles.ts";
import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import {formatTime} from "../../utils/FrontendUtils.ts";


interface BatteryDetail {
    label: string;
    value: string | number | undefined;
}

const BatteryComponent = () => {
    const { batteries } = useServerEventsContext();
    const battery = batteries.at(-1);

    const powerDetails: BatteryDetail[] = [
        {label: 'Vendor', value: battery?.vendor},
        {label: 'Percentage', value: `${battery?.chargePercent.toFixed(1)}%`},
        {label: 'Charging state', value: battery?.state},
        {label: 'Cycle Count', value: battery?.cycleCount},
        {label: 'Technology', value: battery?.technology},
        {label: 'Maximum Battery Capacity', value: `${battery?.healthPercent.toFixed(0)}%`},
        {label: 'Time to full battery', value: formatTime(battery?.secsUntilFull ?? 0)},
        {label: 'Time to empty battery', value: formatTime(battery?.secsUntilEmpty ?? 0)},
        {label: 'Temperature', value: `${battery?.temperature.toFixed(1)} °C`},
        {label: 'Charge', value: `${battery?.energy.toFixed(3)} MJ / ${batteries.at(-1)?.energyFull.toFixed(3)} MJ`},
        {label: 'Voltage', value: `${battery?.voltage.toFixed(1)} V`},
        {label: 'Energy rate', value: `${battery?.powerConsumptionRateWatts.toFixed(1)} W`},
    ];

    return (
        <Container>
            <StatList>
                {powerDetails.map((detail, index) => (
                    <StatItem key={index}>
                        <Label>{detail.label}</Label>
                        <Value>{detail.value}</Value>
                    </StatItem>
                ))}
            </StatList>
        </Container>
    );
}

export default BatteryComponent;

