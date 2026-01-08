export interface ThemeState {
    mode: 'light' | 'dark';
}

export interface page {
    id: number,
    name: string,
    link: string,
    routerLink: string,
    element: React.JSX.Element,
    isIndex: boolean | undefined,
    showOnHeader: boolean | undefined,
    showInNavBar: boolean | undefined,
}