import { lazy } from 'react'

const Email = lazy(() => import('@modules/dpr/views/users/UserList'))
const UserManagement = lazy(() => import('@modules/dpr/views/users/UserList'))
const UserCreate = lazy(() => import('@modules/dpr/views/users/UserCreate'))

const DprRoutes = [
  {
    element: <UserManagement />,
    path: '/dpr/user/list',
    name: 'drp.user.list'
  },
  {
    element: <UserCreate />,
    path: '/dpr/user/create',
    name: 'dpr.user.create'
  }
] as const

export type DprRouteName = (typeof DprRoutes)[number]['name']
export default DprRoutes
