import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {page} from "./Interfaces/appInterfaces";
import Home from './pages/home'
import LegalPage from "./pages/legal";
import Header from "./Shared/Header";
import PrivacyBanner from "./pages/legal/Banner";

export const allowedPages: string[] = ['/login', '/signup', '/forgot-password']
export const pages: page[] = [
    {
        id: 0,
        element: <Home/>,
        name: 'Home',
        link: '/',
        routerLink: '/',
        isIndex: true,
        showOnHeader: true,
        showInNavBar: true,
    }, {
        id: 1,
        element: <LegalPage/>,
        name: 'Legal',
        link: '/legal',
        routerLink: '/legal',
        isIndex: false,
        showOnHeader: true,
        showInNavBar: true,
    },
]

export default function App() {
    return (
        <BrowserRouter>
            {!allowedPages.includes(window.location.pathname) && <Header/>}
            <PrivacyBanner/>
            <Routes>
                {pages?.map(({id, routerLink, isIndex, element}) => (
                    <Route key={id} index={isIndex} path={routerLink} element={element}/>
                ))}
            </Routes>
        </BrowserRouter>
    );
};
