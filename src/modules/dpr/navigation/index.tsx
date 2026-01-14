// ** Icons Import
import { getPath } from '@src/router/RouteHelper'
import { Home, Circle, Users, UserPlus } from 'react-feather'

export default [
  {
    id: 'dpr-users-page',
    title: 'users',
    icon: <Users size={20} />,
    badge: 'light-success',
    badgeText: '12',
    children: [
      {
        id: 'dpr-userList',
        title: 'all-users',
        icon: <Circle size={12} />,
        navLink: getPath('drp.user.list')
      },
      {
        id: 'dpr-userCreate',
        title: 'create-user',
        icon: <Circle size={12} />,
        navLink: getPath('dpr.user.create')
      }
    ]
  }
]
