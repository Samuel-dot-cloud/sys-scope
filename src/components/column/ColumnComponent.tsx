import React from "react";
import {Column, Row} from "../../containers/system/styles.ts";

interface ColumnData {
    title: string;
    items: string[]
}

const ColumnComponent: React.FC<ColumnData> = ({ title, items}) => {
    return (
        <Column>
            <Row>{title}</Row>
            {items.map((item, index) => (
                <Row key={index}>{item}</Row>
            ))}
        </Column>
    );
}

export default ColumnComponent;