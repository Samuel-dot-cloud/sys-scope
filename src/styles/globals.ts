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
`;

export const StatItem = styled.div<StatItemProps>`
  display: grid;
  grid-template-columns: ${({ columns }) =>
    columns === 3 ? "1fr 1fr 1fr" : "1fr 1fr"};
  gap: 10px;
  /* justify-content: space-between; */
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
`;

export const Value = styled.span`
  color: ${(props) => props.theme.text};
  font-weight: lighter;
  font-size: 15px;
  text-align: right;
`;

export const Section = styled.div`
  margin-bottom: 10px;
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
  /* justify-content: space-between; */
  font-weight: bold;
  margin-bottom: 5px;
`;
