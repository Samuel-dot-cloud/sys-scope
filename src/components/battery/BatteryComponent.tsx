import {Container, Label, StatItem, StatList, Value} from "./styles.ts";
import React from "react";

interface BatteryDetail {
    label: string;
    value: string | number;
}

interface BatteryComponentProps {
    details: BatteryDetail[];
}

const BatteryComponent: React.FC<BatteryComponentProps> = ({ details }) => {
    return (
        <Container>
            <StatList>
                {details.map((detail, index) => (
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

