import styled, { createGlobalStyle } from "styled-components";
import "@fontsource-variable/rubik";

interface StatItemProps {
  columns: 2 | 3;
}

export const GlabalStyles = createGlobalStyle`
    :root {
        font-family: 'Rubik Variable', sans-serif;
        line-height: 1.5;

        background-color: transparent;

        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    body {
        margin: 0;
        display: flex;
        place-items: center;
        min-width: 320px;
        min-height: 100vh;
    }

    .custom-popover .ant-popover-inner {
      background-color: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .custom-popover .ant-popover-arrow {
      color: transparent;
    }

    .custom-popover .ant-popover-arrow::before {
      background-color: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
    }

    .custom-popover .ant-popover-arrow::after {
      background-color: rgba(255, 255, 255, 0.15);
    }

`;

export const Container = styled.div`
  background-color: transparent;
  border-radius: 10px;
  padding: 3px;
`;

export const StatList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 220px;
  overflow-y: auto;

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
`;

export const StatItem = styled.div<StatItemProps>`
  display: grid;
  grid-template-columns: ${({ columns }) =>
    columns === 3 ? "1fr 1fr 1fr" : "1fr 1fr"};
  gap: 10px;
  margin-bottom: 5px;
  align-items: center;
`;

export const SmallImage = styled.img`
  height: 18px;
  width: 18px;
  object-fit: cover;
  margin-right: 5px;
  margin-left: 3px;
`;

export const Label = styled.span`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.text};
  font-weight: normal;
  font-size: 15px;
  text-align: left;
  white-space: normal;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Value = styled.span`
  color: ${(props) => props.theme.text};
  font-weight: lighter;
  font-size: 15px;
  text-align: right;
  white-space: normal;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Section = styled.div`
  margin-bottom: 10px;
  max-width: 100%;
`;

export const HorizontalSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid ${(props) => `rgba(${props.theme.borderRgba})`};
`;

export const SectionTitle = styled.h3`
  color: ${(props) => props.theme.text};
  font-size: 15px;
  margin: 0;
  padding-bottom: 5px;
  padding-top: 2px;
  border-bottom: 1px solid ${(props) => `rgba(${props.theme.borderRgba})`};
`;

export const Title = styled.h3`
  color: ${(props) => props.theme.text};
  padding-bottom: 5px;
  border-bottom: 1px solid ${(props) => `rgba(${props.theme.borderRgba})`};
  margin: 0 0 10px;
`;

export const HeaderItem = styled.div<StatItemProps>`
  display: grid;
  grid-template-columns: ${({ columns }) =>
    columns === 3 ? "1fr 1fr 1fr" : "1fr 1fr"};
  font-weight: bold;
  margin-bottom: 2px;
  /* gap: 10px; */
  align-items: center;
`;
