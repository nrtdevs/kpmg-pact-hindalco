import { FM } from './Utils'

/* eslint-disable no-undef */
export const WebAppVersion = Object.freeze({
    current: '0.0.1'
})

export const entryPoint = `web-${WebAppVersion.current}`

export const Events = Object.freeze({
    Unauthenticated: 'Unauthenticated',
    reactSelect: 'reactSelect',
    RedirectMessage: 'goToMessage',
    RedirectNotification: 'goToNotification',
    created: 'created',
    updated: 'updated',
    deleted: 'deleted',
    approved: 'approved',
    assigned: 'assigned',
    stampIn: 'stampIn',
    stampOut: 'stampOut',
    leaveRequest: 'leaveRequest',
    leaveApproved: 'leaveApproved',
    bankIdVerification: 'bankIdVerification',
    emergency: 'emergency',
    completed: 'completed',
    request: 'request',
    confirmAlert: 'confirmAlert'
})

export const IconSizes = Object.freeze({
    InputAddon: 16,
    HelpIcon: 12,
    MenuVertical: 22,
    CardListIcon: 15
})

export const Patterns = Object.freeze({
    MeetingTitle: /^[a-zA-Z0-9-_ @#]+$/,
    AlphaOnly: /^[a-zA-Z ]*$/,
    AlphaOnlyNoSpace: /^[a-zA-Z]*$/,
    AlphaNumericOnlyNoSpace: /^[a-zA-Z0-9]*$/,
    AlphaNumericOnly: /^[a-zA-Z0-9-_ ]+$/,
    NumberOnly: /^\d+(\.\d{1,2})?$/,
    NumberOnlyNoDot: /^[0-9]*$/,
    EmailOnly: /^\w+([!#$%&'*+-/=?^_`{|]?\w+)*@\w+([.-]?\w+)*(\.\w{2,5})+$/,
    //   Password: /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{6,16}$/
    Password:
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+|~\-=?{}[\]:;'<>,.?\\/])[A-Za-z\d!@#$%^&*()_+|~\-=?{}[\]:;'<>,.?\\/]{8,}$/,
    AlphaNumericWithAtperSpaceHash: /^[a-zA-Z0-9@# ]*$/
})
export type ActionTypes = {
    action: 'delete' | 'active' | 'inactive'
    ids: Array<number>
}

export enum CMD {
    Register = 'store-register',
    Disconnect = 'disconnect',
    GetAllSessions = 'getallsessions',
    GetCustomerSession = 'getcustomersession',
    RemoveCustomerSession = 'removecustomersession',
    AddCartItem = 'addtocart',
    UpdateCartItem = 'updatecart',
    RemoveCartItem = 'removecartitem',
    ProductInfo = 'productinfo'
}

export const mapApiKey = ''

export const RepeatType = Object.freeze({
    'every-day': 'every_day',
    'every-week': 'every_week',
    'every-month': 'every_month'
})



export const InvoiceStatus = Object.freeze({
    approved: 'approved',
    pending: 'pending',
    rejected: 'rejected',
    're-assigned': 're-assigned',
    resend: 'resend',
    'on-hold': 'on_hold',
    'under-review-by-epcm': 'under_review_by_epcm',

    'under-review': 'under_review_by_owner',
    verification: 'under_review_by_finance',
    'pending-with-epcm': 'pending_with_epcm',
    'pending-with-owner': 'pending_with_owner',
    verified: 'verified',
    completed: 'completed',
    'send-for-payment': 'send_for_payment',
    paid: 'paid'
})

export const Modules = Object.freeze({
    meet: 'meet',
    invoice: 'invoice',
    hindrance: 'hindrance'
})

export const InvoiceCheckStatus = Object.freeze({
    approved: 'approved',
    pending: 'pending',
    rejected: 'rejected',
    'not-approve': 'not_approve'
})

export const InvoiceType = Object.freeze({
    services: 'services',
    supply: 'supply'
})
export const priorityType = Object.freeze({
    low: 'low',
    high: 'high',
    medium: 'medium'
})

export const ActionStratus = Object.freeze({
    'not-started': 'pending',
    'in-progress': 'in_progress',
    'on-hold': 'on_hold',
    completed: 'completed',
    cancelled: 'cancelled',
    verified: 'verified'
})

export const ActionStatusText = Object.freeze({
    'not-started': 'pending',
    'in-progress': 'in_progress',
    'on-hold': 'on_hold',
    completed: 'completed',
    cancelled: 'cancelled'
})

export enum Roles {
    Admin = 'Admin',
    User = 'User',
    Epcm = 'EPCM',
    Owner = 'Owner',
    Contractor = 'Contractor'
}

export const hindranceStatus = Object.freeze({
    active: '1',
    inactive: '0'
})

export const roleIds = Object.freeze({
    admin: 1,
    owner: 2,
    epcm: 3,
    contractor: 4,
    client: 5,
    user: 6,
    attendees: 7
})


export const hindranceAction = Object.freeze({
    'under-review-by-owner': 'under_review_by_owner',
    resolved: 'resolved',
    approved: 'approved',
    'on-hold': 'on_hold',
    'reject-by-epcm': 'rejected_by_epcm',
    'reject-by-owner': 'rejected_by_owner',
    'rejected-by-owner': 'rejected_by_admin'
})

export const hindranceAction1 = Object.freeze({
    'under-review-by-owner': 'under_review_by_owner',
    resolved: 'resolved',
    approved: 'approved',
    'on-hold': 'on_hold',
    'rejected-by-epcm': 'rejected_by_epcm',
    'rejected-by-owner': 'rejected_by_owner',
    'rejected-by-admin': 'rejected_by_admin',
    'under-review-by-epcm': 'under_review_by_epcm',
    pending: 'pending',
    're-assigned': 're-assigned',
    'pending-with-epcm': 'pending_with_epcm',
    'pending-with-owner': 'pending_with_owner'
})

export const hindranceType = Object.freeze({
    engg: 'engg',
    trade: 'trade',
    proc: 'proc',
    cons: 'cons'
})

export const userType = Object.freeze({
    admin: 1,
    owner: 2,
    epcm: 3,
    contractor: 4
})
export const priorityTypes = Object.freeze({
    high: '1',
    medium: '2',
    low: '3'
})
