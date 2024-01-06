import styled from "styled-components";

export const Container = styled.div`
    color: #ffffff;
    background-color: #1e1e1e;
    border-radius: 10px;
    padding: 20px;
`;

export const SpeedStats = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 5px;
    border-bottom: 1px solid #333;
`;

export const StatList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

export const StatItem = styled.li`
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    align-items: center;
`;

export const Label = styled.span`
    color: #ddd
`;

export const Value = styled.span`
    color: #ddd;
    display: flex;
    align-items: center;
`;

export const Icon = styled.span`
    margin: 0 5px;
`;