import {DetailItem, DetailList, SectionContainer, SectionTitle, Usage} from "../../containers/system/styles.ts";

interface Detail {
    label: string;
    value: string | number;
}

interface SectionProps {
    title: string;
    usage: string;
    details: Detail[];
}

// Section component
const Section: React.FC<SectionProps> = ({ title, usage, details }) => {
    return (
        <SectionContainer>
            <SectionTitle>{title}</SectionTitle>
            {usage && <Usage>{usage}</Usage>}
            <DetailList>
                {details.map((detail, index) => (
                    <DetailItem key={index}>
                        {detail.label}: {detail.value}
                    </DetailItem>
                ))}
            </DetailList>
        </SectionContainer>
    );
};

export default Section;