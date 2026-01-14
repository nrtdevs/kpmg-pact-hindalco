// ** Router imports
import { lazy } from 'react'

// ** Router imports
import { useRoutes, Navigate } from 'react-router-dom'

// ** Layouts
import BlankLayout from '@layouts/BlankLayout'

// ** Hooks Imports
import { useLayout } from '@hooks/useLayout'

// ** Utils
import { getUserData, getHomeRouteForLoggedInUser, getHomeUrl, isValid } from '@src/utility/Utils'

// ** GetRoutes
import { getRoutes } from './routes'

// ** Components
const Error = lazy(() => import('@modules/common/auth/Error'))
const Login = lazy(() => import('@modules/common/auth/Login'))
const Register = lazy(() => import('@modules/common/auth/RegisterBasic'))
const VerifyEmail = lazy(() => import('@modules/common/auth/VerifyEmailBasic'))
const ForgotPassword = lazy(() => import('@modules/common/auth/ForgotPasswordBasic'))
const ResetPassword = lazy(() => import('@modules/common/auth/ResetPasswordBasic'))
const NotAuthorized = lazy(() => import('@modules/common/auth/NotAuthorized'))
const CallBackUrl = lazy(() => import('@modules/common/auth/CallBackUrl'))

const Router = () => {
    // ** Hooks
    const { layout } = useLayout()

    const allRoutes = getRoutes(layout)
    const getHomeRoute = () => {
        const user = getUserData()


        if (isValid(user)) {
            return getHomeUrl(user)
        } else {
            return '/login'
        }
    }

    const routes = useRoutes([
        {
            path: '/',
            index: true,
            element: <Navigate replace to={getHomeRoute()} />
        },

        {
            path: '/login',
            element: <BlankLayout />,
            children: [{ path: '/login', element: <Login /> }]
        },
        {
            path: '/register',
            element: <BlankLayout />,
            children: [{ path: '/register', element: <Register /> }]
        },
        {
            path: '/verify-email',
            element: <BlankLayout />,
            children: [{ path: '/verify-email', element: <VerifyEmail /> }]
        },
        {
            path: '/forgot-password',
            element: <BlankLayout />,
            children: [{ path: '/forgot-password', element: <ForgotPassword /> }]
        },
        {
            path: '/reset-password/:token',
            element: <BlankLayout />,
            children: [{ path: '/reset-password/:token', element: <ResetPassword /> }]
        },
        {
            path: '/not-authorized',
            element: <BlankLayout />,
            children: [{ path: '/not-authorized', element: <NotAuthorized /> }]
        },
        {
            path: "/callback_outlook",
            element: <CallBackUrl />,
            children: [{ path: "/callback_outlook", element: <CallBackUrl /> }]
        },
        {
            path: '*',
            element: <BlankLayout />,
            children: [{ path: '*', element: <Error /> }]
        },
        ...allRoutes
    ])

    return routes
}

export default Router
