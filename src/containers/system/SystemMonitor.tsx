import React, {useState} from "react";
import Section from "../../components/section/SectionComponent.tsx";
import {AppWindow, ContentContainer, Tab, TabContainer} from "./styles.ts";



interface SectionDetails {
    label: string;
    value: string | number;
}

interface Section {
    title: string;
    details: SectionDetails[];
    usage?: string; // Optional if you have a usage property
}

type Sections = {
    [key: string]: Section;
};

const SystemMonitor: React.FC = () => {
    // const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const cpuDetails = [
        { label: 'Average Load', value: '2.45' },
        { label: 'Uptime', value: '13 hours ago' }
        // Add more details as needed
    ];

    const memoryDetails = [
        { label: 'Memory Used', value: '30% (~10 GB)' },
        { label: 'Memory Used1', value: '30% 11(~10 GB)' },
        { label: 'Memory Used2', value: '30% (~10332 GB)' },
        { label: 'Memory Used', value: '30% (~10 GB)' },
        // Add more details as needed
    ];

    const powerDetails = [
        { label: 'Battery Level', value: '98%' },
        { label: 'Charging', value: 'Yes' }
        // Add more details as needed
    ];

    const networkDetails = [
        { label: 'Download', value: '2.17 KB/s' },
        { label: 'Upload', value: '0 B/s' }
        // Add more details as needed
    ];

    const [activeSection, setActiveSection] = useState<string>('cpu');

    const sections: Sections  = {
        cpu: { title: 'CPU', details: cpuDetails },
        memory: { title: 'Memory', details: memoryDetails },
        power: { title: 'Power', details: powerDetails },
        network: { title: 'Network', details: networkDetails },
    };

    return (
        <AppWindow>
            {/* Sidebar */}
            <TabContainer>
                {Object.keys(sections).map((key) => {
                    const sectionKey: string = key;
                    return (
                        <Tab
                            key={sectionKey}
                            className={activeSection === sectionKey ? 'active' : ''}
                            onClick={() => setActiveSection(sectionKey)}
                        >
                            {sections[sectionKey].title}
                        </Tab>
                    );
                })}
            </TabContainer>

            {/* Main Content */}
            <ContentContainer>
                <Section
                    title={sections[activeSection].title}
                    usage={sections[activeSection].usage || 'N/A'} // Provide a default value
                    details={sections[activeSection].details}
                />
            </ContentContainer>
        </AppWindow>
    );
}

export default SystemMonitor;