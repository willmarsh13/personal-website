import React from 'react';
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {page} from "./Interfaces/appInterfaces";
import Home from './pages/home'
import LegalPage from "./pages/legal";
import AdminPage from "./pages/admin";
import Header from "./Shared/Header";
import PrivacyBanner from "./pages/legal/Banner";
import Terminal from "./Shared/Terminal";
import GuestbookPrompt from "./Shared/GuestbookPrompt";

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
    }, {
        // Unlinked. Access is controlled by the server, not by the URL being secret.
        id: 2,
        element: <AdminPage/>,
        name: 'Admin',
        link: '/admin',
        routerLink: '/admin',
        isIndex: false,
        showOnHeader: false,
        showInNavBar: false,
    },
]

export default function App() {
    return (
        <BrowserRouter>
            {!allowedPages.includes(window.location.pathname) && <Header/>}
            <PrivacyBanner/>
            <Terminal/>
            <GuestbookPrompt/>
            <Routes>
                {pages?.map(({id, routerLink, isIndex, element}) => (
                    <Route key={id} index={isIndex} path={routerLink} element={element}/>
                ))}
                {/* The guestbook used to be its own page. */}
                <Route path="/guestbook" element={<Navigate to="/#guestbook" replace/>}/>
            </Routes>
        </BrowserRouter>
    );
};
