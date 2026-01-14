import { RequestType } from '../http/Http'
import { HttpResponse } from './typeResponse'

// Login Api Types
export interface LoginApiArgs extends RequestType {
    success?: (e?: LoginApiResponse) => void
}

export type LoginApiResponse = HttpResponse<UserData>

export interface VenueTypeResponse {
    id?: number
    venue?: string
    venues?: any[]
    created_at?: string
    updated_at?: string
    status?: number

    user?: any

}

export interface HindranceTypeResponse {
    id?: number
    epcm?: any
    invoice_no?: any
    amount?: any
    name?: any
    description?: any
    invoice_check_id?: any
    unique_no?: any
    invoice_type?: any
    uploaded_files?: any
    reason_of_rejection?: string
    invoice_check_verifications?: any
    package?: any
    owner?: any
    vendor_name?: any
    vendor_contact_number?: any
    vendor_contact_email?: any
    status?: any
    owner_id?: any
    epcm_id?: any
    notes?: any
    created_at?: string
    updated_at?: string
    deleted_at?: string
}
export interface PackageResponse {
    id?: number
    epcm?: any
    name?: any
    invoice_no?: any
    amount?: any
    description?: any
    invoice_check_id?: any
    unique_no?: any
    invoice_type?: any
    uploaded_files?: any
    reason_of_rejection?: string
    invoice_check_verifications?: any
    package?: any
    owner?: any
    vendor_name?: any
    vendor_contact_number?: any
    vendor_contact_email?: any
    status?: any
    owner_id?: any
    epcm_id?: any
    notes?: any
    created_at?: string
    updated_at?: string
    deleted_at?: string
}
export interface InvoiceResponse {
    id?: number
    creator_user_type?: any
    contract_type?: any
    last_action_performed_by?: any
    invoice_no?: any
    created_by?: any
    epcms?: any
    assignees?: any
    contractor?: any
    hindrance_id?: any
    contract_number?: any
    invoice_id?: any
    contractor_id?: any
    check_group_id?: any
    amount?: any
    description?: any
    invoice_check_id?: any
    unique_no?: any
    invoice_type?: any
    uploaded_files?: any
    reason_of_rejection?: string
    reason_for_hold?: string
    invoice_check_verifications?: any
    package?: any
    owner?: any
    vendor_name?: any
    vendor_contact_number?: any
    vendor_contact_email?: any
    contract_type_id?: any
    basic_amount?: any
    gst_amount?: any
    total_amount?: any
    invoice_date?: string
    status?: any
    owner_id?: any
    epcm_id?: any
    notes?: any
    created_at?: string
    updated_at?: string
    deleted_at?: string
}
export interface HindranceResponse {
    id?: number
    created_by?: number
    epcm?: any
    project_id?: any
    hindrance_code?: any
    approved_date?: any
    name?: any
    hindrance_type?: any
    title?: any
    package?: any
    description?: any
    uploaded_files?: any
    vendor_name?: any
    vendor_contact_number?: string
    status?: any
    owner_id?: any
    epcm_id?: any
    notes?: any
    created_at?: string
    updated_at?: string
    deleted_at?: string
    project?: any
    ids?: any
    reason_of_rejection?: string
    action?: string
    contractor_id?: any
    assignees?: any
    hindrance_id?: any
    due_date?: any
    priority?: any
    vendor_contact_email?: any
    mobile_number?: any
    hindrance_activity_logs?: any
    user_type?: any
    contractor?: any
    from_date?: any
    to_date?: any
    reason_for_assignment?: any
}

export interface ProjectResponse {
    id?: number
    name?: string
    description?: string
    created_at?: string
    updated_at?: string
    status?: number
    projectId?: number
    user_id?: number
    user?: any
}

export interface DocumentResponse {
    id?: number
    name?: string
    files?: any
    created_at?: string
    updated_at?: string
}

export interface CheckParamsEntity {
    check_param_1?: any
    param_status?: any
}
export interface contractEpcm {
    id?: number
    contract_id?: number
    epcm_id?: any
    created_at?: string
    updated_at?: string
    epcm?: any
}

//contracts response
export interface ContractsResponse {
    id?: number
    user_id?: any
    contract_number?: string
    contractor_id?: any
    contractor?: any
    contract_type_id?: any
    contract_type?: any
    package?: any
    epcms?: any

    epcm?: any
    epcm_id?: any
    description?: string
    created_at?: string
    updated_at?: string
    contract_epcms?: any
}
export interface ContractType {
    id?: number
    contract_type?: string
    check_lists?: any[]
}

export interface InvoiceCheksResponse {
    id?: number
    check?: string
    value?: any
    checks?: any[]
    updated_at?: string
    created_at?: string

    //    CheckParamsEntity[] | string[]
    //   check_params: [
    //     {
    //       check_param_1: 'file should be uploaded'
    //       param_status: 'required'
    //     },
    //     {
    //       check_param_2: 'amount should match sum of all department cost'
    //       param_status: 'required'
    //     }
    //   ]
}

// User data
export interface UserData {
    password_last_updated?: string
    id?: number
    assigned_modules?: any[]
    venue?: any
    name?: string
    email?: string
    user_type?: any
    email_verified_at?: string
    owner_id?: any
    owner?: any
    epcm?: any
    epcm_id?: any
    role_id?: any
    mobile_number?: string
    address?: string
    designation?: any
    role?: any
    status?: number | string
    created_at?: string
    updated_at?: string
    deleted_at?: string
    access_token?: string
    roles?: any
    package_id?: any
    package?: any
    role_name?: string
    password?: string
    permissions?: PermissionsEntity[] | string[]
    contractor_id?: number
    module?: any
    kmeet?: any
    invoice?: any
    hindrance?: any
    filterData?: any
    hindrance_id?: any
    contractor?: any
}
export interface PermissionsEntity {
    id?: number
    action?: string
    subject?: string
    se_name?: string
    pivot?: Pivot
}

export interface Password {
    old_password?: string
    password?: string
    'confirm-password'?: string
}

export interface Role {
    id?: number
    name?: string
    guard_name?: string
    se_name?: string
    is_default?: number
    created_at?: string
    updated_at?: string
    description?: string
    user_type?: any
    permissions?: Permission[] | null
}

export interface Permission {
    id?: number
    name?: string
    guard_name?: string
    created_at?: string
    updated_at?: string
    se_name?: string
    group_name: string
    description?: any
    belongs_to?: number
    pivot?: Pivot
}

export interface Pivot {
    role_id?: number
    permission_id?: number
}

export interface Log {
    event?: string
    id?: number
    created_by?: any
    type?: string
    ip_address?: string
    location?: any
    status?: string
    last_record_before_edition?: any
    failure_reason?: any
    created_at?: string
    updated_at?: string
}

export interface AuditLog {
    id: number
    log_name: string
    description: string
    subject_type: string
    event: string
    subject_id: number
    causer_type: string
    causer_id: number
    properties: Properties
    batch_uuid: any
    created_at: string
    updated_at: string
    name: string
    causer: Causer
}

export interface Properties {
    attributes: any
    old: any
}

export interface Causer {
    id: number
    name: string
}

export interface Settings {
    app_name: string
    address: string
    email: string
    mobile_no: string
    log_expiry_days: number
    description: string
    app_logo: any
    copyright: string
    support_email: string
    support_phone: string
    password_expiry_for_privileged_account: number
    password_expiry_for_normal_account: number
    password_history_limit: number
    password_minimum_length_for_normal_account: number
    password_minimum_length_for_privileged_account: number
    inactivity_timeout: number
    inactivity_timeout_user: number
    invalid_login_attempts: number
    account_lockout_threshold: number
    account_lockout_duration: number
    system_log_retention_period: number
    jsonData?: any
}
