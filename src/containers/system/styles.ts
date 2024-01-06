import styled from "styled-components";

export const SectionContainer = styled.div`
    margin-bottom: 20px;
`;

export const SectionTitle = styled.h2`
    margin: 0;
    color: #aaa;
`;

export const Usage = styled.span`
    display: block;
    color: #fff;
    margin-bottom: 10px;
`;

export const DetailList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

export const DetailItem = styled.li`
    color: #ddd;
    margin-bottom: 5px;
    &:last-child {
        margin-bottom: 0;
    }
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  &:first-child {
    margin-right: 20px; // Adjust spacing between columns as needed
  }
`;

export const AppWindow = styled.div`
    display: flex; // Use flex to layout children horizontally
    height: 100vh;
    background: #2c2c2e;
    color: white;
`;

export const LayoutContainer = styled.div`
    display: flex;
    height: 100%;
`;

export const TabContainer = styled.div`
    background: #1b1b1d; // Dark background for the sidebar
    width: 200px; // Sidebar width
    flex-shrink: 0; // Prevent the sidebar from shrinking
    display: flex;
    flex-direction: column;
`;

export const Tab = styled.button`
  padding: 10px;
  border: none;
  background: none;
  color: #fff;
  text-align: left;
  cursor: pointer;
  &:hover {
    background-color: #3a3a3c;
  }
  &.active {
    background-color: #007aff;
  }
`;

export const ContentContainer = styled.div`
  flex-grow: 1; // Take up the remaining width
  overflow-y: auto; // Enable scrolling for overflow content
  padding: 20px;
`;
