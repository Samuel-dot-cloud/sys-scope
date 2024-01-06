import styled from "styled-components";

export const AppContainer = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;
    flex-grow: 1;
    background: transparent;
`;

export const Sidebar = styled.div`
    width: 200px;
    background: transparent;
    //color: #ffffff;
    padding: 40px 20px 20px;
`;

export const SidebarItem = styled.div`
    cursor: pointer;
    padding: 10px;
    &:hover {
        background-color: #333;
        border-radius: 10px;
    }
    &.active {
        background-color: #555;
        border-radius: 10px;
    }
`;

export const Content = styled.div`
    flex-grow: 1;
    background: transparent;
    padding: 20px;
    overflow-y: auto;
`;

export const AppWindow = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
`;
