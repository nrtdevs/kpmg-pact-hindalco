// ** Reducers Imports
import { MeetingManagement } from './RTKQuery/MeetingManagement'
import { MeetingUserManagement } from './RTKQuery/UserManagement'
import { RoleManagement } from './RTKQuery/RoleManagement'
import { NoteManagement } from './RTKQuery/NotesManagement'
import { AppSettings } from './RTKQuery/AppSettingRTK'
import { ActionManagement } from './RTKQuery/ActionMangement'
import { ContractorManagement } from './RTKQuery/ContractorRTK'
import { InvoiceCheckManagement } from './RTKQuery/InvoiceChecksRTK'
import { InvoiceManagement } from './RTKQuery/InvoiceManagement'
import { HindranceManagement } from './RTKQuery/HindranceRTK'
import { ProjectManagement } from './RTKQuery/ProjectManagement'
import { PackageManagement } from './RTKQuery/PackageRTK'
import { HindranceTypeRTK } from './RTKQuery/HindranceTypeRTK'
import { NotificationManagement } from './RTKQuery/Notifications'
import { ContractManagement } from './RTKQuery/ContractRTK'
import { VenueManagement } from './RTKQuery/VenueRTK'
const meetingReducers = {
    // RTK
    [NotificationManagement.reducerPath]: NotificationManagement.reducer,
    [ContractManagement.reducerPath]: ContractManagement.reducer,
    [MeetingUserManagement.reducerPath]: MeetingUserManagement.reducer,
    [MeetingManagement.reducerPath]: MeetingManagement.reducer,
    [InvoiceManagement.reducerPath]: InvoiceManagement.reducer,
    [RoleManagement.reducerPath]: RoleManagement.reducer,
    [NoteManagement.reducerPath]: NoteManagement.reducer,
    [AppSettings.reducerPath]: AppSettings.reducer,
    [ActionManagement.reducerPath]: ActionManagement.reducer,
    [InvoiceCheckManagement.reducerPath]: InvoiceCheckManagement.reducer,
    [ContractorManagement.reducerPath]: ContractorManagement.reducer,
    [ProjectManagement.reducerPath]: ProjectManagement.reducer,
    [HindranceManagement.reducerPath]: HindranceManagement.reducer,
    [HindranceTypeRTK.reducerPath]: HindranceTypeRTK.reducer,
    [PackageManagement.reducerPath]: PackageManagement.reducer,
    [VenueManagement.reducerPath]: VenueManagement.reducer
}
const meetingMiddleware = [
    ContractManagement.middleware,
    NotificationManagement.middleware,
    InvoiceCheckManagement.middleware,
    ActionManagement.middleware,
    MeetingUserManagement.middleware,
    InvoiceManagement.middleware,
    MeetingManagement.middleware,
    RoleManagement.middleware,
    VenueManagement.middleware,
    NoteManagement.middleware,
    AppSettings.middleware,
    ContractorManagement.middleware,
    HindranceManagement.middleware,
    ProjectManagement.middleware,
    PackageManagement.middleware,
    HindranceTypeRTK.middleware
]

export { meetingReducers, meetingMiddleware }
