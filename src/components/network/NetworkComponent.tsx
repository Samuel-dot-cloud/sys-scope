import {Container, Icon, Label, SpeedStats, StatItem, StatList, Value} from "./styles.ts";

interface NetworkDetail {
    name: string;
    download: string;
    upload: string;
}

interface NetworkComponentProps {
    downloadSpeed: string;
    uploadSpeed: string;
    processes: NetworkDetail[];
}

const NetworkComponent: React.FC<NetworkComponentProps> = ({ downloadSpeed, uploadSpeed, processes}) => {
    return (
        <Container>
            <SpeedStats>
                <Label>Download speed</Label>
                <Value>{downloadSpeed}</Value>
            </SpeedStats>
            <SpeedStats>
                <Label>Upload speed</Label>
                <Value>{uploadSpeed}</Value>
            </SpeedStats>

            <StatList>
                {processes.map((process, index) => (
                    <StatItem key={index}>
                        <Label>{index + 1}. {process.name}</Label>
                        <Value>
                            <Icon>↓</Icon>{process.download}
                            <Icon>↑</Icon>{process.upload}
                        </Value>
                    </StatItem>
                ))}
            </StatList>
        </Container>
    );
}

export default NetworkComponent;