import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        text: string;
        title: string;
        active: string;
        modalRgba: string;
        borderRgba: string;
        hoverRgba: string;
        type: string;
    }
}