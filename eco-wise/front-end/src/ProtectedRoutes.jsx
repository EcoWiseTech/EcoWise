import React from 'react'
import UserProfileRoutesPage from './pages/user/UserProfileRoutesPage'
import AddHomePage from './pages/home/AddHomePage'
import UserDashboardPage from './pages/home/UserDashboardPage'
import ViewHomePage from './pages/home/ViewHomePage'
import EditHomePage from './pages/home/EditHomePage'
import Budget from './pages/Budget'
import SubmitTicketRequest from './pages/SubmitTicketRequest'
import ViewTickets from './pages/ViewTickets'

const ProtectedRoutes = [
    {
        path: "/budget",
        element: <Budget />,
    },
    {
        path: "profile/*",
        element: <UserProfileRoutesPage />,
    },
    {
        path: "dashboard",
        element: <UserDashboardPage />,
    },
    {
        path: "addHome",
        element: <AddHomePage />,
    },
    {
        path: "home/view/:uuid",
        element: <ViewHomePage />,
    },
    {
        path: "home/edit/:uuid",
        element: <EditHomePage />,
    },
    {
        path: "/SubmitTicketRequest",
        element: <SubmitTicketRequest />,
    },
    {
        path: "/ViewTickets",
        element: <ViewTickets />,
    },
]



export default ProtectedRoutes