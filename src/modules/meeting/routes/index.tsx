import { Permissions } from '@src/utility/Permissions'
import { lazy } from 'react'
import TaskBoard from '../views/TaskTracker/TaskBoard'
const Dashboard = lazy(() => import('@modules/meeting/views/Dashboard'))
const Home = lazy(() => import('@modules/meeting/views/home'))
const UserManagement = lazy(() => import('@modules/meeting/views/users/UserList'))
const Roles = lazy(() => import('@modules/meeting/views/users/Roles'))
const MeetingList = lazy(() => import('@modules/meeting/views/meetings/MeetingList'))
const MeetingDetails = lazy(() => import('@modules/meeting/views/meetings/MeetingDetails'))
const NotesList = lazy(() => import('@modules/meeting/views/notes/NotesList'))
const ActionList = lazy(() => import('@modules/meeting/views/Actions/ActionList'))
const LogList = lazy(() => import('@modules/meeting/views/Logs'))
const AuditLogList = lazy(() => import('@modules/meeting/views/Logs/AuditLogs'))
const DocumentUploads = lazy(() => import('@modules/meeting/views/DocumentUploads'))
const Invoice = lazy(() => import('@src/modules/meeting/views/Invoice/InvoiceList'))
const InvoiceDetails = lazy(() => import('@src/modules/meeting/views/Invoice/InvoiceDetails'))
const Hindrance = lazy(() => import('@src/modules/meeting/views/Projects/HindranceList'))
const InvoiceCheck = lazy(() => import('@src/modules/meeting/views/Invoice/Checklist'))
const Projects = lazy(() => import('@src/modules/meeting/views/Projects/index'))
const ProjectDetail = lazy(() => import('@src/modules/meeting/views/Projects/ProjectDetail'))
const HindranceDetail = lazy(() => import('@src/modules/meeting/views/Projects/HindranceDetail'))
const Package = lazy(() => import('@src/modules/meeting/views/Projects/Packages'))
const HindranceType = lazy(() => import('@src/modules/meeting/views/Projects/HindranceType'))
const Notification = lazy(() => import('@src/modules/meeting/views/Notifications'))
const Contracts = lazy(() => import('@src/modules/meeting/views/Contract'))
const ContractType = lazy(() => import('@src/modules/meeting/views/Invoice/contractType/index'))
const AppSetting = lazy(() => import('@src/modules/meeting/views/users/AppSettings'))

const Venue = lazy(() => import('@src/modules/meeting/views/venues'))
const MeetingRoutes = [
    {
        element: <Dashboard />,
        path: '/dashboard',
        name: 'dashboard',
        meta: {
            ...Permissions.dashboardBrowse
        }
    },
    {
        element: <Home />,
        path: '/home',
        name: 'home',
        meta: {
            ...Permissions.dashboardBrowse
        }
    },
    {
        element: <Venue />,
        path: '/venues',
        name: 'venue',
        meta: {
            ...Permissions.venueBrowse
        }
    },
    {
        element: <Notification />,
        path: '/notifications',
        name: 'notifications',
        meta: {
            ...Permissions.dashboardBrowse
        }
    },
    {
        element: <UserManagement />,
        path: '/user/list',
        name: 'user.list',
        meta: {
            ...Permissions.userBrowse
        }
    },
    {
        element: <Roles />,
        path: '/roles',
        name: 'role.list',
        meta: {
            ...Permissions.roleAdd
        }
    },
    {
        element: <MeetingList />,
        path: '/meetings',
        name: 'meeting.list',
        meta: {
            ...Permissions.meetingBrowse
        }
    },
    {
        element: <Contracts />,
        path: '/contracts',
        name: 'contract.list',
        meta: {
            ...Permissions.contractBrowse
        }
    },
    {
        element: <ContractType />,
        path: '/contract-type',
        name: 'contract.type',
        meta: {
            ...Permissions.contractBrowse
        }
    },
    {
        element: <MeetingDetails />,
        path: '/meetings/view/:id',
        name: 'meeting.view',
        meta: {
            ...Permissions.meetingRead
        }
    },
    {
        element: <NotesList />,
        path: '/notes/list',
        name: 'notes.list',
        meta: {
            ...Permissions.notesBrowse
        }
    },
    {
        element: <ActionList />,
        path: '/action/list',
        name: 'action.list',
        meta: {
            ...Permissions.actionItemsBrowse
        }
    },
    {
        element: <Invoice />,
        path: '/invoice',
        name: 'invoice',
        meta: {
            ...Permissions.invoiceBrowse
        }
    },
    {
        element: <InvoiceDetails />,
        path: '/invoice/view/:id',
        name: 'invoice.view',
        meta: {
            ...Permissions.invoiceBrowse
        }
    },

    {
        element: <InvoiceCheck />,
        path: '/checklist',
        name: 'checklist',
        meta: {
            ...Permissions.checklistBrowse
        }
    },
    {
        element: <DocumentUploads />,
        path: '/document-uploads',
        name: 'document.uploads',
        meta: {
            ...Permissions.contractBrowse
        }
    },

    {
        element: <LogList />,
        path: '/logs',
        name: 'log.list',
        meta: {
            ...Permissions.logsBrowse
        }
    },
    {
        element: <AuditLogList />,
        path: '/audit-logs',
        name: 'log.audit.list',
        meta: {
            ...Permissions.logsBrowse
        }
    },

    {
        element: <Projects />,
        path: '/projects',
        name: 'projects',
        meta: {
            ...Permissions.projectBrowse
        }
    },
    {
        element: <ProjectDetail />,
        path: '/project/view/:id',
        name: 'project.view',
        meta: {
            ...Permissions.projectRead
        }
    },
    {
        element: <HindranceDetail />,
        path: '/hindrance/view/:id',
        name: 'hindrance.view',
        meta: {
            ...Permissions.hindranceRead
        }
    },
    {
        element: <Hindrance />,
        path: '/hindrance',
        name: 'hindrance',
        meta: {
            ...Permissions.hindranceBrowse
        }
    },
    {
        element: <HindranceType />,
        path: '/hindrance-type',
        name: 'hindrance.type',
        meta: {
            ...Permissions.hindranceTypeBrowse
        }
    },
    {
        element: <Package />,
        path: '/package',
        name: 'package',
        meta: {
            ...Permissions.hindranceBrowse
        }
    },
    {
        element: <AppSetting />,
        path: '/app-setting',
        name: 'app.setting  ',
        meta: {
            ...Permissions.appSettingsBrowse
        }
    }
    // {
    //     element: <TaskBoard />,
    //     path: '/task-tracker',
    //     name: 'task.tracker',
    //     meta: {
    //         ...Permissions.appSettingsBrowse
    //     }
    // }
] as const

export type MeetingRouteName = (typeof MeetingRoutes)[number]['name']
export default MeetingRoutes
