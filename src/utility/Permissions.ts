import ContractTypeEdit from '@src/modules/meeting/views/Invoice/contractType/ContractTypeModal'

// do not remove
export type PermissionType = {
    action: string
    resource: string
    belongs_to?: any
}
export const Permissions = Object.freeze({
    // Dashboard
    dashboardBrowse: {
        action: 'dashboard-browse', // Check
        resource: 'dashboard',
        module: 'dashboard',
        belongs_to: 3
    },
    // Meeting
    kmeet: {
        action: 'kmeet',
        resource: 'kmeet',
        belongs_to: 3
    },
    allMeetingBrowse: {
        action: 'all-meeting-browse',
        resource: 'meeting',
        belongs_to: 3
    },
    meetingBrowse: {
        action: 'meeting-browse',
        resource: 'meeting',
        belongs_to: 3
    },
    meetingAdd: {
        action: 'meeting-add',
        resource: 'meeting',
        belongs_to: 3
    },
    meetingEdit: {
        action: 'meeting-edit',
        resource: 'meeting',
        belongs_to: 3
    },
    meetingDelete: {
        action: 'meeting-delete',
        resource: 'meeting',
        belongs_to: 3
    },
    meetingRead: {
        action: 'meeting-browse',
        resource: 'meeting',
        belongs_to: 3
    },

    // Notes
    notesBrowse: {
        action: 'notes-browse',
        resource: 'notes',
        belongs_to: 3
    },
    notesAdd: {
        action: 'notes-add',
        resource: 'notes',
        belongs_to: 3
    },
    notesEdit: {
        action: 'notes-edit',
        resource: 'notes',
        belongs_to: 3
    },
    notesDelete: {
        action: 'notes-delete',
        resource: 'notes',
        belongs_to: 3
    },
    notesRead: {
        action: 'notes-browse',
        resource: 'notes',
        belongs_to: 3
    },
    //invoice
    invoice: {
        action: 'invoice',
        resource: 'invoice',
        belongs_to: 3
    },
    invoiceBrowse: {
        action: 'invoices-browse',
        resource: 'invoices',
        belongs_to: 3
    },
    invoiceAdd: {
        action: 'invoices-add',
        resource: 'invoices',
        belongs_to: 3
    },
    invoiceEdit: {
        action: 'invoices-edit',
        resource: 'invoices',
        module: 'invoice'
    },
    invoiceDelete: {
        action: 'invoices-delete',
        resource: 'invoices',
        belongs_to: 3
    },

    invoiceRead: {
        action: 'invoices-browse',
        resource: 'invoices',
        belongs_to: 3
    },

    invoiceAction: {
        action: 'invoices-action',
        resource: 'invoices',
        belongs_to: 3
    },
    invoiceLogs: {
        action: 'invoices-log',
        resource: 'invoices',
        belongs_to: 3
    },
    invoiceExport: {
        action: 'invoices-export',
        resource: 'invoices',
        belongs_to: 3
    },
    // Action Items
    actionItemsBrowse: {
        action: 'action-items-browse',
        resource: 'action-items',
        belongs_to: 3
    },
    actionItemsAdd: {
        action: 'action-items-add',
        resource: 'action-items',
        belongs_to: 3
    },
    actionItemsEdit: {
        action: 'action-items-edit',
        resource: 'action-items',
        belongs_to: 3
    },
    actionItemsDelete: {
        action: 'action-items-delete',
        resource: 'action-items',
        belongs_to: 3
    },
    actionItemsRead: {
        action: 'action-items-browse',
        resource: 'action-items',
        belongs_to: 3
    },
    // Users
    userBrowse: {
        action: 'user-browse',
        resource: 'user',
        belongs_to: 3
    },
    userAdd: {
        action: 'user-add',
        resource: 'user',
        belongs_to: 3
    },
    userEdit: {
        action: 'user-edit',
        resource: 'user',
        belongs_to: 3
    },
    userDelete: {
        action: 'user-delete',
        resource: 'user',
        belongs_to: 3
    },
    userRead: {
        action: 'user-browse',
        resource: 'user',
        belongs_to: 3
    },

    // Roles
    roleBrowse: {
        action: 'role-browse',
        resource: 'role',
        belongs_to: 3
    },
    roleAdd: {
        action: 'role-add',
        resource: 'role',
        belongs_to: 3
    },
    roleEdit: {
        action: 'role-edit',
        resource: 'role',
        belongs_to: 3
    },
    roleDelete: {
        action: 'role-delete',
        resource: 'role',
        belongs_to: 3
    },
    roleRead: {
        action: 'role-browse',
        resource: 'role',
        belongs_to: 3
    },

    // logs
    logsBrowse: {
        action: 'logs-browse',
        resource: 'logs',
        belongs_to: 1
    },

    // contractor
    contractorBrowse: {
        action: 'contractor-browse',
        resource: 'contractor'
    },
    contractorAdd: {
        action: 'contractor-add',
        resource: 'contractor'
    },
    contractorEdit: {
        action: 'contractor-edit',
        resource: 'contractor'
    },
    contractorDelete: {
        action: 'contractor-delete',
        resource: 'contractor'
    },
    contractorRead: {
        action: 'contractor-browse',
        resource: 'contractor'
    },

    // Hindrance
    hindrance: {
        action: 'hindrance',
        resource: 'hindrance'
    },
    hindranceBrowse: {
        action: 'hindrances-browse',
        resource: 'hindrances'
    },
    hindranceAdd: {
        action: 'hindrances-add',
        resource: 'hindrances'
    },
    hindranceEdit: {
        action: 'hindrances-edit',
        resource: 'hindrances'
    },
    hindranceDelete: {
        action: 'hindrances-delete',
        resource: 'hindrances'
    },
    hindranceRead: {
        action: 'hindrances-browse',
        resource: 'hindrances'
    },
    hindranceAction: {
        action: 'hindrances-action',
        resource: 'hindrances'
    },
    hindranceLogs: {
        action: 'hindrances-log',
        resource: 'hindrances'
    },

    // package
    packageBrowse: {
        action: 'packages-browse',
        resource: 'packages'
    },
    packageAdd: {
        action: 'packages-add',
        resource: 'packages'
    },
    packageEdit: {
        action: 'packages-edit',
        resource: 'packages'
    },
    packageDelete: {
        action: 'packages-delete',
        resource: 'packages'
    },
    packageRead: {
        action: 'packages-browse',
        resource: 'packages'
    },
    packageAction: {
        action: 'packages-action',
        resource: 'packages'
    },
    // project
    projectBrowse: {
        action: 'projects-browse',
        resource: 'projects'
    },
    projectAdd: {
        action: 'projects-add',
        resource: 'projects'
    },
    projectEdit: {
        action: 'projects-edit',
        resource: 'projects'
    },
    projectDelete: {
        action: 'projects-delete',
        resource: 'projects'
    },
    projectRead: {
        action: 'projects-browse',
        resource: 'projects'
    },
    // hindrance type
    hindranceTypeBrowse: {
        action: 'hindrance-types-browse',
        resource: 'hindrance-types'
    },
    hindranceTypeAdd: {
        action: 'hindrance-types-add',
        resource: 'hindrance-types'
    },
    hindranceTypeEdit: {
        action: 'hindrance-types-edit',
        resource: 'hindrance-types'
    },
    hindranceTypeDelete: {
        action: 'hindrance-types-delete',
        resource: 'hindrance-types'
    },
    hindranceTypeRead: {
        action: 'hindrance-types-browse',
        resource: 'hindrance-types'
    },

    hindranceExport: {
        action: 'hindrances-export',

        resource: 'hindrances'
    },
    hindranceImport: {
        action: 'hindrances-import',
        resource: 'hindrances'
    },

    //Contract
    contractBrowse: {
        action: 'contracts-browse',
        resource: 'contracts'
    },
    contractAdd: {
        action: 'contracts-add',
        resource: 'contracts'
    },
    contractEdit: {
        action: 'contracts-edit',
        resource: 'contracts'
    },
    contractDelete: {
        action: 'contracts-delete',
        resource: 'contracts'
    },
    contractRead: {
        action: 'contracts-browse',
        resource: 'contracts'
    },
    //checklist
    checklistBrowse: {
        action: 'check-lists-browse',
        resource: 'check-lists'
    },
    checklistAdd: {
        action: 'check-lists-add',
        resource: 'check-lists'
    },
    checklistRead: {
        action: 'check-lists-browse',
        resource: 'check-lists'
    },
    checklistEdit: {
        action: 'check-lists-edit',
        resource: 'check-lists'
    },
    checklistDelete: {
        action: 'check-lists-delete',
        resource: 'check-lists'
    },
    //contractType
    contractTypeBrowse: {
        action: 'contract-types-browse',
        resource: 'contract-types'
    },
    contractTypeAdd: {
        action: 'contract-types-add',
        resource: 'contract-types'
    },
    contractTyprRead: {
        action: 'contract-types-browse',
        resource: 'contract-types'
    },
    contractTypeEdit: {
        action: 'contract-types-edit',
        resource: 'contract-types'
    },
    contractTypeDelete: {
        action: 'contract-types-delete',
        resource: 'contract-types'
    },

    // app settings
    appSettingsBrowse: {
        action: 'app-setting-browse',
        resource: 'app-setting',
        belongs_to: 3
    },
    //venues
    venueBrowse: {
        belongs_to: 3,
        action: 'venues-browse',
        resource: 'venues'
    },
    venueAdd: {
        belongs_to: 3,
        action: 'venues-add',
        resource: 'venues'
    },
    venueEdit: {
        belongs_to: 3,
        action: 'venues-edit',
        resource: 'venues'
    },
    venueDelete: {
        belongs_to: 3,
        action: 'venues-delete',
        resource: 'venues'
    },


})
