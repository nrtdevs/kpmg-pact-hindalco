// ** Icons Import
import { getPath } from '@src/router/RouteHelper'
import { Modules } from '@src/utility/Const'
import { Permissions } from '@src/utility/Permissions'
import {
    Home,
    Users,
    List,
    BookOpen,
    FilePlus,
    CheckCircle,
    Lock,
    Monitor,
    FileText,
    Table,
    PieChart,
    Bell,
    Briefcase,
    File,
    Pause,
    PauseCircle,
    Twitch
} from 'react-feather'

export default [
    { header: 'dashboard', ...Permissions.dashboardBrowse },
    {
        id: 'dashboard-view',
        title: 'dashboard',
        icon: <Home size={12} />,
        navLink: getPath('dashboard'),
        ...Permissions.dashboardBrowse
    },
    {
        header: ' Meeting Dashboard',
        ...Permissions.meetingBrowse
    },
    {
        id: 'meeting-list',
        title: 'Meetings',
        icon: <List size={20} />,

        navLink: getPath('meeting.list'),
        ...Permissions.meetingBrowse
    },
    {
        id: 'task',
        title: 'task',
        icon: <CheckCircle size={12} />,
        navLink: getPath('action.list'),
        ...Permissions.actionItemsBrowse
    },
    // {
    //     id: 'task-tracker',
    //     title: 'task-tracker',
    //     icon: <CheckCircle size={12} />,
    //     navLink: getPath('task.tracker'),
    //     ...Permissions.actionItemsBrowse
    // },

    {
        header: 'invoice management',
        ...Permissions.invoiceBrowse
    },
    {
        id: 'CheckList',
        title: 'checklist',
        icon: <Table size={12} />,
        navLink: getPath('checklist'),
        ...Permissions.checklistBrowse
    },
    {
        id: 'invoiceList',
        title: 'invoice',
        icon: <FileText size={12} />,

        navLink: getPath('invoice'),
        ...Permissions.invoiceBrowse
    },
    {
        header: 'hindrance management',
        ...Permissions.hindranceBrowse
    },

    {
        id: 'hindranceList',
        title: 'hindrance',
        icon: <Pause size={12} />,
        navLink: getPath('hindrance'),
        ...Permissions.hindranceBrowse
    },
    {
        id: "hindranceTypeList",
        title: "hindrance-type",
        icon: <PauseCircle size={12} />,
        navLink: getPath('hindrance.type'),
        ...Permissions.hindranceTypeBrowse
    },
    {
        id: "packageList",
        title: "package",
        icon: <PieChart size={12} />,
        navLink: getPath('package'),
        ...Permissions.hindranceBrowse
    },
    {
        header: 'user management',
        ...Permissions.userBrowse
    },
    {
        id: 'userList',
        title: 'all-users',
        icon: <Users size={12} />,
        navLink: getPath('user.list'),
        ...Permissions.userBrowse
    },
    {
        id: 'venue',
        title: 'venue',
        icon: <Twitch size={12} />,
        navLink: getPath('venue'),
        ...Permissions.venueBrowse
    },

    {
        id: 'roleList',
        title: 'roles',
        icon: <Lock size={12} />,
        navLink: getPath('role.list'),
        ...Permissions.roleBrowse
    },
    {
        id: 'projectList',
        title: 'project',
        icon: <FileText size={12} />,
        navLink: getPath('projects'),
        ...Permissions.projectBrowse
    },
    {
        id: 'contractsList',
        title: 'contracts',
        icon: <Briefcase size={12} />,
        navLink: getPath('contract.list'),
        ...Permissions.contractBrowse
    },
    {
        id: 'contractTypeList',
        title: 'contract-type',
        icon: <Briefcase size={12} />,
        navLink: getPath('contract.type'),
        ...Permissions.contractBrowse
    },
    {
        id: 'logsListMain',
        title: 'system-logs',
        icon: <Monitor size={12} />,
        ...Permissions.logsBrowse,
        children: [
            {
                id: 'logsList',
                title: 'event-logs',
                icon: <Monitor size={12} />,
                navLink: getPath('log.list'),
                ...Permissions.logsBrowse
            },
            {
                id: 'logsListAudit',
                title: 'audit-logs',
                icon: <Monitor size={12} />,
                navLink: getPath('log.audit.list'),
                ...Permissions.logsBrowse
            }
        ]
    }

    //   {
    //     header: 'document management',
    //     ...Permissions.dashboardBrowse
    //   }
    //   {
    //     id: 'documentList',
    //     title: 'document',
    //     icon: <File size={12} />,
    //     navLink: getPath('document.uploads'),
    //     ...Permissions.dashboardBrowse
    //   }

    //   {
    //     id: 'notificationsList',
    //     title: 'notifications',
    //     icon: <Bell size={12} />,
    //     ...Permissions.dashboardBrowse,
    //     children: [
    //       {
    //         id: 'notificationsListChild',
    //         title: 'notifications',
    //         icon: <FileText size={12} />,
    //         navLink: getPath('notifications'),
    //         ...Permissions.dashboardBrowse
    //       }
    //     ]
    //   }
]
