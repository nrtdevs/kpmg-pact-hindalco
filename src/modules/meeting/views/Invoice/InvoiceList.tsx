import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser'
import CustomDataTable, {
    TableDropDownOptions,
    TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import DropDownMenu from '@src/modules/common/components/dropdown'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import {
    FM,
    JsonParseValidate,
    createConstSelectOptions,
    emitAlertStatus,
    getKeyByValue,
    isValid,
    isValidArray,
    log,
    setInputErrors,
    setValues,
    userType
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { InvoiceResponse } from '@src/utility/types/typeAuthApi'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import {
    CheckCircle,
    CheckSquare,
    Download,
    Edit,
    FilePlus,
    FileText,
    Pause,
    RefreshCcw,
    Send,
    Upload,
    X
} from 'react-feather'
import { useForm } from 'react-hook-form'
import {
    Button,
    ButtonGroup,
    ButtonProps,
    Col,
    Form,
    Row
} from 'reactstrap'
import * as yup from 'yup'

import { InvoiceStatus, InvoiceType } from '@src/utility/Const'
import {
    useActionInvoiceMutation,
    useCreateOrUpdateInvoiceMutation,
    useExportInvoiceLogMutation,
    useLoadInvoiceMutation
} from '../../redux/RTKQuery/InvoiceManagement'
import InvoiceFilter from './InvoiceFilter'

// import CheckAttachChecklistModal from './CheckAttachChecklistModal'

import { getPath } from '@src/router/RouteHelper'
import httpConfig from '@src/utility/http/httpConfig'
import { Link } from 'react-router-dom'
import InvoiceActionModal from './InvoiceActionModal'
import InvoiceExportModal from './InvoiceExportModal'
import InvoiceImport from './InvoiceImport'

// validation schema
const userFormSchema = {
    invoice_number: yup
        .string()
        .required()
        .when({
            is: (values: string) => values?.length > 0,
            then: (schema) =>
                schema
                    .min(5, FM('mobile-number-must-be-at-least-5-characters'))
                    .max(244, FM('invoice-number-must-be-at-most-244-characters'))
                    .required(),
            otherwise: (schema) => schema.notRequired()
        }),
    notes: yup
        .string()
        .required()
        .when({
            is: (values: string) => values?.length > 0,
            then: (schema) =>
                schema
                    .min(5, FM('mobile-number-must-be-at-least-5-characters'))
                    .max(244, FM('invoice-number-must-be-at-most-244-characters'))
                    .required(),
            otherwise: (schema) => schema.notRequired()
        }),
    basic_amount: yup.number().required(),
    gst_amount: yup.number().required(),
    total_amount: yup.number().required(),

    description: yup
        .string()
        .required()
        .when({
            is: (values: string) => values?.length > 0,
            then: (schema) =>
                schema.max(244, FM('invoice-number-must-be-at-most-244-characters')).required(),
            otherwise: (schema) => schema.notRequired()
        })
}
// validate
const schema = yup.object(userFormSchema).required()

// states

type States = {
    page?: any
    per_page_record?: any
    exportData?: any
    actionData?: any
    creatorUserType?: any
    responseChecklist?: any
    statusTitle?: any
    filterData?: any
    reload?: any
    isAddingNewData?: boolean
    search?: string
    lastRefresh?: any
    selectedUser?: InvoiceResponse
    verifyData?: any
    selectedRowsCount?: any
    enableEdit?: boolean
}

const defaultValues: InvoiceResponse = {
    id: undefined,
    invoice_no: undefined,
    invoice_type: undefined,
    package: undefined,
    invoice_check_id: undefined,
    vendor_name: undefined,
    basic_amount: undefined,
    gst_amount: undefined,
    total_amount: undefined,
    reason_of_rejection: undefined,
    vendor_contact_number: undefined,
    vendor_contact_email: undefined,
    status: undefined,

    //   uploaded_files: undefined,
    owner_id: undefined,
    epcm_id: undefined,
    notes: undefined
}
const InvoiceList = (props: any) => {
    // header menu context
    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    // user
    const user = useUser()
    // can add invoice
    const canAddInvoice = Can(Permissions.invoiceAdd)

    //can invoice log
    const canInvoiceLog = Can(Permissions.invoiceLogs)
    // can edit invoice
    const canEditInvoice = Can(Permissions.invoiceEdit)
    // can delete invoice
    //can view
    const canViewInvoice = Can(Permissions.invoiceBrowse)
    const canExport = Can(Permissions.invoiceExport)
    const canAddAction = Can(Permissions.invoiceAction)

    // form hook
    const form = useForm<InvoiceResponse>({
        resolver: yupResolver(schema),
        defaultValues
    })

    // toggle add modal
    const [modalAdd, toggleModalAdd] = useModal()

    const [rejectModal, toggleRejectModal] = useModal()

    const [actionModal, toggleActionModal] = useModal()
    // create or update user mutation
    const [createInvoice, createInvoiceResponse] = useCreateOrUpdateInvoiceMutation()
    // load users
    const [loadInvoice, loadInvoiceResponse] = useLoadInvoiceMutation()
    // delete mutation
    const [invoiceAction, invoiceActionResult] = useActionInvoiceMutation()
    const [actvityLogExport, exportRes] = useExportInvoiceLogMutation()

    // default states
    const initState: States = {
        page: 1,
        per_page_record: 20,
        filterData: undefined,
        creatorUserType: userType.epcm,
        search: '',
        enableEdit: false,
        selectedRowsCount: undefined,

        lastRefresh: new Date().getTime()
    }
    // state reducer
    const reducers = stateReducer<States>
    // state
    const [state, setState] = useReducer(reducers, initState)

    // close add
    const closeAddModal = () => {
        setState({
            selectedUser: undefined,
            enableEdit: false
        })
        form.reset()
        toggleModalAdd()
    }

    const closeRejectModal = () => {
        form.reset()
        toggleRejectModal()
    }

    useEffect(() => {
        if (
            invoiceActionResult?.isSuccess &&
            invoiceActionResult?.originalArgs?.action === 'rejected'
        ) {
            closeRejectModal()
        }
    }, [invoiceActionResult])
    // close view modal
    const closeViewModal = (reset = true) => {
        if (reset) {
            setState({
                selectedUser: undefined
            })
            form.reset()
        }
    }

    // handle save user
    const handleSaveUser = (data: InvoiceResponse) => {
        createInvoice({
            jsonData: {
                ...data,
                id: state?.selectedUser?.id,
                contract_number: data?.contract_number?.value,
                owner_id:
                    user?.user_type === userType.contractor ? user?.owner_id : state?.selectedUser?.owner?.id,
                invoice_type: data?.invoice_type?.value,
                invoice_check_id: data?.invoice_check_id?.value,
                uploaded_files: isValidArray(data?.uploaded_files)
                    ? data?.uploaded_files
                    : state?.selectedUser?.uploaded_files
                // status: data?.status === InvoiceStatus.rejected ? InvoiceStatus.resend : data?.status
            }
        })
    }

    // load user list

    const loadUserList = () => {
        if (`${user?.user_type}` === `${userType.epcm}`) {
            loadInvoice({
                page: state.page,
                per_page_record: state.per_page_record,
                jsonData: {
                    name: !isValid(state.filterData) ? state.search : undefined,
                    creator_user_type: state.creatorUserType,
                    ...state.filterData
                }
            })
        } else {
            loadInvoice({
                page: state.page,
                per_page_record: state.per_page_record,
                jsonData: {
                    name: !isValid(state.filterData) ? state.search : undefined,
                    //   creator_user_type: user?.user_type === userType.epcm ? state.creatorUserType : '',
                    ...state.filterData
                }
            })
        }
    }

    // handle user create response
    useEffect(() => {
        if (!createInvoiceResponse.isUninitialized) {
            if (createInvoiceResponse.isSuccess) {
                closeAddModal()
                loadUserList()
                // SuccessToast(FM('invoice-created-successfully'))
            } else if (createInvoiceResponse.isError) {
                // handle error
                const errors: any = createInvoiceResponse.error
                log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createInvoiceResponse])

    //write use effect

    // handle pagination and load list
    useEffect(() => {
        loadUserList()
    }, [
        state.page,
        state.search,
        state.per_page_record,
        state.filterData,
        state.lastRefresh,

        state.creatorUserType,
        invoiceActionResult?.isSuccess
    ])

    // handle page change
    const handlePageChange = (e: TableFormData) => {
        setState({ ...e })
    }

    // handle filter data
    const handleFilterData = (e: any) => {
        setState({
            filterData: { ...e, role_id: e?.role_id?.value, package: e?.package?.value },
            page: 1,
            search: '',
            per_page_record: 20
        })
    }

    // total amount calculation with gst and basic amount
    useEffect(() => {
        if (Number(form?.watch('basic_amount')) || Number(form?.watch('gst_amount'))) {
            form?.setValue(
                'total_amount',
                Number(form.watch('basic_amount')) + Number(form.watch('gst_amount'))
            )
        } else {
            form?.setValue('total_amount', 0)
        }
    }, [form?.watch('basic_amount'), form?.watch('gst_amount')])

    // reload Data
    const reloadData = () => {
        setState({
            page: 1,
            search: '',
            creatorUserType: undefined,
            filterData: undefined,
            per_page_record: 20,
            lastRefresh: new Date().getTime()
        })
    }

    //set user name email and mobile no in  form vendor name vendor_contact_email vendor_contact_number

    // create a menu on header
    //   useEffect(() => {
    //     if (!canAddInvoice) return
    //     setHeaderMenu(
    //       <>
    //         <NavItem className=''>
    //           <BsTooltip title={FM('create-invoice')}>
    //             <NavLink
    //               className=''
    //               onClick={() => {
    //                 setState({
    //                   enableEdit: false
    //                 })
    //                 form.reset()
    //                 toggleModalAdd()
    //               }}
    //             >
    //               <FilePlus className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
    //             </NavLink>
    //           </BsTooltip>
    //         </NavItem>
    //       </>
    //     )
    //     return () => {
    //       setHeaderMenu(null)
    //     }
    //   }, [modalAdd, canAddInvoice])

    // handle actions
    const handleActions = (ids?: any, action?: any, eventId?: any) => {
        if (isValidArray(ids)) {
            invoiceAction({
                ids,
                eventId,
                action,
                jsonData: {
                    ids,
                    action
                }
            })
        }
    }

    const activityLogExport = (ids?: any, action?: any, eventId?: any) => {
        if (isValidArray(ids)) {
            actvityLogExport({
                ids,
                eventId,
                action,

                jsonData: {
                    id: ids[0]
                }
            })
        }
    }

    // handle action result
    useEffect(() => {
        if (invoiceActionResult?.isLoading === false) {
            if (invoiceActionResult?.isSuccess) {
                emitAlertStatus('success', null, invoiceActionResult?.originalArgs?.eventId)
            } else if (invoiceActionResult?.error) {
                emitAlertStatus('failed', null, invoiceActionResult?.originalArgs?.eventId)
            }
        }
    }, [invoiceActionResult])

    useEffect(() => {
        if (exportRes?.isLoading === false) {
            if (exportRes?.isSuccess) {
                emitAlertStatus('success', null, exportRes?.originalArgs?.eventId)

                window.open(`${httpConfig.baseUrl3}${exportRes?.data?.data?.url}`, '_blank')
            } else if (exportRes?.error) {
                emitAlertStatus('failed', null, exportRes?.originalArgs?.eventId)
            }
        }
    }, [exportRes])

    log('data', state.selectedUser?.vendor_contact_email)

    // open view modal
    useEffect(() => {
        if (isValid(state.selectedUser)) {
            setValues<InvoiceResponse>(
                {
                    ...state.selectedUser,
                    contractor_id: state.selectedUser?.contractor?.id,
                    contract_number: {
                        label: state.selectedUser?.contract_number,
                        value: state.selectedUser?.contract_number
                    },
                    epcms: state.selectedUser?.epcms?.map((e) => ({
                        label: e?.epcm?.name,
                        value: e?.id
                    })),
                    contract_type_id: state.selectedUser?.contract_type_id,

                    vendor_contact_email: state.selectedUser?.vendor_contact_email,
                    vendor_contact_number: state.selectedUser?.vendor_contact_number,
                    vendor_name: state.selectedUser?.vendor_name,
                    basic_amount: state.selectedUser?.basic_amount,
                    gst_amount: state.selectedUser?.gst_amount,
                    total_amount: state.selectedUser?.total_amount,
                    package: state.selectedUser?.package,

                    invoice_type: {
                        label: getKeyByValue(InvoiceType, state.selectedUser?.invoice_type),
                        value: state.selectedUser?.invoice_type
                    },
                    uploaded_files: JsonParseValidate(state.selectedUser?.uploaded_files)
                },
                form.setValue
            )

            toggleModalAdd()
        }
    }, [state.selectedUser])

    //set value with contract_number
    useEffect(() => {
        if (isValid(form.watch('contract_number'))) {
            setValues<InvoiceResponse>(
                {
                    epcms: form.watch('contract_number')?.extra?.contract_epcms?.map((e) => ({
                        label: e?.epcm?.name,
                        value: e?.id
                    })),
                    package: form.watch('contract_number')?.extra?.package,

                    contract_type_id: form.watch('contract_number')?.extra?.contract_type_id,
                    contractor_id: form.watch('contract_number')?.extra?.contractor?.id,

                    vendor_name: form.watch('contract_number')?.extra?.contractor?.name,
                    vendor_contact_email: form.watch('contract_number')?.extra?.contractor?.email,
                    vendor_contact_number: form.watch('contract_number')?.extra?.contractor?.mobile_number
                },
                form.setValue
            )
        } else {
            setValues<InvoiceResponse>(
                {
                    epcms: undefined,
                    package: undefined,

                    contract_type_id: undefined,
                    contractor_id: undefined,

                    vendor_name: undefined,
                    vendor_contact_email: undefined,
                    vendor_contact_number: undefined
                },
                form.setValue
            )
        }
    }, [form.watch('contract_number')?.extra])

    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modalAdd}
                done={state.enableEdit ? 'save' : 'save'}
                modalClass={'modal-lg'}
                title={state.enableEdit ? FM('edit') : FM('create-invoice')}
                handleModal={closeAddModal}
                loading={createInvoiceResponse.isLoading}
                handleSave={form.handleSubmit(handleSaveUser)}
            >
                <div className='p-2'>
                    <Form onSubmit={form.handleSubmit(handleSaveUser)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            <Col md='6'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.invoice_no}`}
                                    control={form.control}
                                    label={FM('invoice-no')}
                                    name='invoice_no'
                                    type='text'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `invoice_no`
                                    }}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md='6'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.invoice_type}`}
                                    control={form.control}
                                    label={FM('invoice-type')}
                                    isClearable
                                    name='invoice_type'
                                    selectOptions={createConstSelectOptions(InvoiceType, FM)}
                                    type='select'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>

                            {/* invoice date */}

                            <Col md='6'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.invoice_check_id}`}
                                    control={form.control}
                                    label={FM('invoice-date')}
                                    name='invoice_date'
                                    type='date'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>
                            <Col md='6'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.invoice_check_id}`}
                                    control={form.control}
                                    label={FM('contract-number')}
                                    name='contract_number'
                                    type='select'
                                    async
                                    isClearable
                                    loadOptions={loadDropdown}
                                    path={ApiEndpoints.contracts_list}
                                    selectLabel={(e) => e?.contract_number}
                                    selectValue={(e) => e.contract_number}
                                    // searchResponse={state?.responseChecklist?.check_group}
                                    defaultOptions
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <FormGroupCustom
                                key={`${state?.selectedUser?.contract_type_id}-${form.watch('contract_number')?.value
                                    }`}
                                control={form.control}
                                noLabel
                                noGroup
                                name='contract_type_id'
                                type='hidden'
                                isDisabled={true}
                                rules={{ required: false }}
                            />
                            <Col md='6'>
                                <FormGroupCustom
                                    control={form.control}
                                    async
                                    label={FM('epcm')}
                                    name='epcms'
                                    isDisabled
                                    isClearable
                                    isMulti
                                    loadOptions={loadDropdown}
                                    path={ApiEndpoints.users_list_dropdown}
                                    //   selectLabel={(e) => `${e.epcm_id} `}
                                    selectLabel={(e) => e?.name}
                                    selectValue={(e) => e?.id}
                                    defaultOptions
                                    jsonData={{
                                        user_type: userType.epcm
                                    }}
                                    type='select'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>
                            <Col md='6'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.package}-${form.watch('contract_number')?.value}`}
                                    label={FM('package')}
                                    isDisabled
                                    name='package'
                                    type='text'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `package`
                                    }}
                                    control={form.control}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <FormGroupCustom
                                key={`${state?.selectedUser?.contractor_id}-${form.watch('contract_number')?.value
                                    }`}
                                control={form.control}
                                noLabel
                                noGroup
                                name='contractor_id'
                                type='hidden'
                                isDisabled={true}
                                rules={{ required: false }}
                            />
                            <Col md='6'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.vendor_name}-${form.watch('contract_number')?.value
                                        }`}
                                    control={form.control}
                                    label={FM('contractor-name')}
                                    noLabel={user?.user_type === userType.epcm ? true : false}
                                    noGroup={user?.user_type === userType.epcm ? true : false}
                                    name='vendor_name'
                                    isDisabled={true}
                                    type={user?.user_type === userType.epcm ? 'hidden' : 'text'}
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `vendor_name`
                                    }}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md='6'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.vendor_contact_email}-${form.watch('contract_number')?.value
                                        }`}
                                    control={form.control}
                                    noLabel={user?.user_type === userType.epcm ? true : false}
                                    noGroup={user?.user_type === userType.epcm ? true : false}
                                    label={FM('contractor-email')}
                                    name='vendor_contact_email'
                                    type={user?.user_type === userType.epcm ? 'hidden' : 'email'}
                                    isDisabled={true}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='6'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.vendor_contact_number}-${form.watch('contract_number')?.value
                                        }`}
                                    control={form.control}
                                    label={FM('contractor-mobile-no')}
                                    noLabel={user?.user_type === userType.epcm ? true : false}
                                    noGroup={user?.user_type === userType.epcm ? true : false}
                                    name='vendor_contact_number'
                                    //   type='text'
                                    type={user?.user_type === userType.epcm ? 'hidden' : 'text'}
                                    isDisabled={true}
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <hr />
                            {/* basic amount */}
                            <Col md='4'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.vendor_contact_email}`}
                                    control={form.control}
                                    label={FM('basic-amount')}
                                    name='basic_amount'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `basic_amount`
                                    }}
                                    type='text'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            {/* gst amount */}
                            <Col md='4'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.vendor_contact_email}`}
                                    control={form.control}
                                    label={FM('gst-amount')}
                                    name='gst_amount'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `gst_amount`
                                    }}
                                    type='text'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            {/* total amount */}
                            <Col md='4'>
                                <FormGroupCustom
                                    key={`${form.watch('basic_amount')}-${form.watch('gst_amount')}`}
                                    control={form.control}
                                    isDisabled
                                    label={FM('total-amount')}
                                    name='total_amount'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `total_amount`
                                    }}
                                    type='text'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <hr />
                            <Col md='12'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.notes}`}
                                    control={form.control}
                                    label={FM('notes')}
                                    name='notes'
                                    type='textarea'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `notes`
                                    }}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='12'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.notes}`}
                                    control={form.control}
                                    label={FM('description')}
                                    name='description'
                                    type='textarea'

                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `description`
                                    }}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <hr />
                            <Col md='12'>
                                <p className='text-dark mb-0'>{FM('attach-documents')}</p>
                                <p className='text-muted small mb-2'>{FM('add-documents-required-on-invoice')}</p>
                            </Col>
                            <Col md='12' className=''>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('documents')}
                                    name='uploaded_files'
                                    type='dropZone'
                                    className='mb-2'
                                    noLabel
                                    noGroup
                                    rules={{ required: true }}
                                />
                            </Col>
                        </Row>
                    </Form>
                </div>
            </CenteredModal>
        )
    }

    log(
        'condition',
        user?.user_type !== userType.contractor &&
        (state?.selectedUser?.status !== 'pending' || state?.selectedUser?.status !== 'rejected')
    )

    const renderCreatedBY = (d: any) => {
        return (
            <Fragment>
                <span
                    className={`badge badge-pill badge-light-${d === `${userType.admin}`
                        ? 'danger'
                        : d === `${userType.contractor}`
                            ? 'success'
                            : d === `${userType.owner}`
                                ? 'dark'
                                : d === `${userType.epcm}`
                                    ? 'primary'
                                    : 'info'
                        }`}
                >
                    {d === `${userType.admin}`
                        ? FM('admin')
                        : d === `${userType.contractor}`
                            ? FM('contractor')
                            : d === `${userType.owner}`
                                ? FM('owner')
                                : d === `${userType.epcm}`
                                    ? FM('epcm')
                                    : FM('admin')}
                </span>
            </Fragment>
        )
    }

    //for edit
    const isVisibleEdit = (row: any) => {
        let re = false
        // check if user has permission
        if (canEditInvoice) {
            // if user is a contractor
            if (user?.user_type === userType.contractor) {
                // check status
                if (`${user?.user_type}` === `${row.creator_user_type}`) {
                    if (
                        row?.status === InvoiceStatus.rejected ||
                        row?.status === InvoiceStatus['re-assigned']
                    ) {
                        re = true
                    }
                }
            }
            // for epcm
            else if (user?.user_type === userType.epcm) {
                if (`${user?.user_type}` === `${row.creator_user_type}`) {
                    if (
                        row?.status === InvoiceStatus.rejected ||
                        row?.status === InvoiceStatus['re-assigned']
                    ) {
                        re = true
                    }
                }
            }
            // for admin
            else if (user?.user_type === userType.admin) {
                re = false
            }
            // for owner
            else if (user?.user_type === userType.owner) {
                re = false
            }
        }
        return re
    }
    //for re-assign
    const isVisibleReAssign = (row: any) => {
        //   canAddAction &&
        //   user?.user_type !== userType.contractor &&
        //   row.creator_user_type !== `${userType.epcm}`,
        let re = false
        // check if user has permission
        if (canAddAction) {
            // if user is a contractor
            if (user?.user_type === userType.contractor) {
                // check status=
                re = false
            }
            // for epcm
            else if (user?.user_type === userType.epcm) {
                if (row.creator_user_type !== `${userType.epcm}`) {
                    if (
                        row.status === InvoiceStatus['re-assigned'] ||
                        row.status === InvoiceStatus.approved
                    ) {
                        re = false
                    } else {
                        re = true
                    }
                }
            }
            // for admin
            else if (user?.user_type === userType.admin) {
                if (row.status === InvoiceStatus['re-assigned'] || row.status === InvoiceStatus.approved) {
                    re = false
                } else {
                    re = true
                }
            }
            // for owner
            else if (user?.user_type === userType.owner) {
                if (row.status === InvoiceStatus['re-assigned'] || row.status === InvoiceStatus.approved) {
                    re = false
                } else {
                    re = true
                }
            }
        }
        return re
    }
    //for isVisibleApprove
    const isVisibleApprove = (row: any) => {
        // canAddAction && user?.user_type == userType.owner && row?.status !== 'approved',
        let re = false
        // check if user has permission
        if (canAddAction) {
            // if user is a contractors
            if (user?.user_type === userType.contractor) {
                re = false
            }
            // for epcm
            else if (user?.user_type === userType.epcm) {
                re = false
            }
            // for admin
            else if (user?.user_type === userType.admin) {
                re = false
            }
            // for owner
            else if (user?.user_type === userType.owner) {
                if (row?.is_checks_verified === 1) {
                    re = true
                }
            }
        }
        return re
    }
    // for isVisibleOnHold

    const isVisibleOnHold = (row: any) => {
        //   canAddAction &&
        //   user?.user_type !== userType.contractor &&
        //   user?.user_type === userType.contractor &&
        //   row?.status !== 'on_hold' &&
        //   row?.status !== 'approved',
        let re = false
        // check if user has permission
        if (canAddAction) {
            // if user is a contractor
            if (user?.user_type === userType.contractor) {
                // check status

                re = false
            }
            // for epcm
            else if (user?.user_type === userType.epcm) {
                if (row.creator_user_type === `${userType.contractor}`) {
                    if (row?.status !== InvoiceStatus['on-hold'] || row?.status !== InvoiceStatus.approved) {
                        re = true
                    }
                }
            }
            // for admin
            else if (user?.user_type === userType.admin) {
                if (row?.status !== InvoiceStatus['on-hold'] || row?.status !== InvoiceStatus.approved) {
                    re = true
                }
            }
            // for owner
            else if (user?.user_type === userType.owner) {
                if (row?.status !== InvoiceStatus['on-hold'] || row?.status !== InvoiceStatus.approved) {
                    re = true
                }
            }
        }
        return re
    }
    //for under review
    const isVisibleUnderReview = (row: any) => {
        //   canAddAction &&
        //   row.creator_user_type !== `${userType.epcm}` &&
        //   row?.status !== 'under_review_by_owner' &&
        //   row?.status !== 'approved',
        let re = false
        // check if user has permission
        if (canAddAction) {
            // if user is a contractor
            if (user?.user_type === userType.contractor) {
                re = false
            }
            // for epcm
            else if (user?.user_type === userType.epcm) {
                re = false
            }
            // for admin
            else if (user?.user_type === userType.admin) {
                re = false
            }
            // for owner
            else if (user?.user_type === userType.owner) {
                re = false
            }
        }
        return re
    }

    // send for payment

    const isVisibleSendForPayment = (row: any) => {
        //   canAddAction &&
        //   (user?.user_type === userType.owner ||
        //     row.creator_user_type !== `${userType.epcm}`) &&
        //   row?.status !== 'sent_for_payment' &&
        //   row?.status !== 'approved' &&
        //   row?.status !== InvoiceStatus.completed,
        let re = false
        // check if user has permission
        if (canAddAction) {
            // if user is a contractor
            if (user?.user_type === userType.contractor) {
                // check status

                re = false
            }
            // for epcm
            else if (user?.user_type === userType.epcm) {
                re = false
            }
            // for admin
            else if (user?.user_type === userType.admin) {
                re = false
            }
            // for owner
            else if (user?.user_type === userType.owner) {
                if (row?.is_checks_verified === 1 && row?.status === InvoiceStatus.approved) {
                    re = true
                }
            }
        }
        return re
    }
    //for mark as paid

    const isVisibleMarkAsPaid = (row: any) => {
        //   canAddAction &&
        //   (user?.user_type === userType.owner ||
        //     row.creator_user_type !== `${userType.epcm}`) &&
        //   row?.status !== 'paid' &&
        //   row?.status !== 'approved',

        let re = false
        // check if user has permission
        if (canAddAction) {
            // if user is a contractor
            if (user?.user_type === userType.contractor) {
                re = false
            }
            // for epcm
            else if (user?.user_type === userType.epcm) {
                re = false
            }
            // for admin
            else if (user?.user_type === userType.admin) {
                re = false
            }
            // for owner
            else if (user?.user_type === userType.owner) {
                if (row?.is_checks_verified === 1 && row?.status === InvoiceStatus.approved) {
                    re = true
                }
            }
        }
        return re
    }

    // for rejected

    const isVisibleRejected = (row: any) => {
        //   canAddAction &&
        //   user?.user_type !== userType.contractor &&
        //   row?.status !== 'rejected' &&
        //   row?.status !== 'approved',
        let re = false
        // check if user has permission
        if (canAddAction) {
            // if user is a contractor
            if (user?.user_type === userType.contractor) {
                re = false
            }
            // for epcm
            else if (user?.user_type === userType.epcm) {
                if (row.creator_user_type !== `${userType.epcm}`) {
                    re = false
                }
            }
            // for admin
            else if (user?.user_type === userType.admin) {
                if (row?.status !== InvoiceStatus.rejected || row?.status !== InvoiceStatus.approved) {
                    re = true
                }
            }
            // for owner
            else if (user?.user_type === userType.owner) {
                if (row?.status !== InvoiceStatus.rejected || row?.status !== InvoiceStatus.approved) {
                    re = true
                }
            }
        }
        return re
    }

    // for export activity log
    const isVisibleExportActvityLog = (row: any) => {
        let re = false
        // check if user has permission
        if (canExport) {
            if (user?.user_type === userType.contractor) {
                re = false
            }
            // for epcm
            else if (user?.user_type === userType.epcm) {
                re = false
            }
            // for admin
            else if (user?.user_type === userType.admin) {
                re = true
            }
            // for owner
            else if (user?.user_type === userType.owner) {
                re = false
            }
        }
        return re
    }

    const renderStatus = (d: any) => { }
    // table columns
    const columns: TableColumn<InvoiceResponse>[] = [
        {
            name: FM('unique-no'),
            id: 'unique-no',
            cell: (row) => (
                <Fragment>
                    <Link
                        state={{ ...row }}
                        to={getPath('invoice.view', { id: row?.id })}
                        role={'button'}
                        className={canViewInvoice ? 'text-primary' : 'pe-none'}
                    >
                        {row?.unique_no}
                    </Link>
                </Fragment>
            )
        },
        {
            name: FM('invoice-no'),

            id: 'invoice-no',
            cell: (row) => <Fragment>{row?.invoice_no}</Fragment>
        },
        {
            name: FM('name'),

            id: 'name',
            cell: (row) => <Fragment>{row?.vendor_name}</Fragment>
        },
        {
            name: FM('email'),

            id: 'email',
            cell: (row) => <Fragment>{row?.vendor_contact_email}</Fragment>
        },
        {
            name: FM('contact-no'),

            id: 'contact_number',
            cell: (row) => <Fragment>{row?.vendor_contact_number}</Fragment>
        },
        {
            name: FM('description'),

            id: 'description',
            cell: (row) => <Fragment>{row?.notes}</Fragment>
        },

        {
            name: FM('created-by'),


            id: 'pending-by',
            cell: (row) => (
                <Fragment>
                    <span>{renderCreatedBY(row?.creator_user_type)}</span>
                </Fragment>
            )
        },
        {
            name: FM('status'),

            maxWidth: "250px",
            minWidth: "250px",
            id: 'status',
            cell: (row) => (
                <Fragment>
                    <span
                        className={`badge badge-pill badge-light-${row?.status === InvoiceStatus.approved
                            ? 'success'
                            : row?.status === InvoiceStatus.rejected
                                ? 'danger'
                                : row?.status === InvoiceStatus.pending
                                    ? 'warning'
                                    : row?.status === InvoiceStatus['on-hold']
                                        ? row?.status === InvoiceStatus['re-assigned']
                                            ? row?.status === InvoiceStatus['pending-with-epcm']
                                                ? 'primary'
                                                : row?.status === InvoiceStatus['pending-with-owner']
                                                    ? 'info'
                                                    : 'dark'
                                            : 'secondary'
                                        : 'info'
                            }`}
                    >
                        {isValid(row?.last_action_performed_by?.name)
                            ? FM('status-by-name-to-contractor-for-reason', {
                                name: row?.last_action_performed_by?.name,
                                // reason: tempData?.description,
                                status: FM(getKeyByValue(InvoiceStatus, row?.status))
                            })
                            : FM(getKeyByValue(InvoiceStatus, row?.status))}
                    </span>
                </Fragment>
            )
        },

        {
            name: FM('action'),
            cell: (row) => (
                <Fragment>
                    <DropDownMenu
                        options={[
                            {
                                IF: isVisibleEdit(row),
                                icon: <Edit size={14} />,
                                onClick: () => {
                                    setState({
                                        enableEdit: true,
                                        selectedUser: row
                                    })
                                    //   toggleModalAdd()
                                },
                                name: FM('edit')
                            },
                            {
                                IF: isVisibleReAssign(row),

                                icon: <RefreshCcw size={14} />,
                                onClick: () => {
                                    setState({
                                        actionData: { ...row, action: 're-assign', statusTitle: FM('re-assign') }
                                    })
                                    toggleActionModal()
                                },
                                name: FM('re-assigned')
                            },
                            {
                                IF: isVisibleApprove(row),

                                icon: <CheckCircle size={14} />,
                                onClick: () => {
                                    setState({
                                        actionData: { ...row, action: 'approved', statusTitle: FM('approve') }
                                    })
                                    toggleActionModal()
                                },
                                name: FM('approve')
                            },

                            {
                                IF: isVisibleOnHold(row),

                                icon: <Pause size={14} />,
                                onClick: () => {
                                    setState({
                                        actionData: { ...row, action: 'on_hold', statusTitle: FM('on-hold') }
                                    })
                                    toggleActionModal()
                                },
                                name: FM('on-hold')
                            },
                            {
                                IF: isVisibleUnderReview(row),

                                icon: <FileText size={14} />,
                                onClick: () => {
                                    setState({
                                        actionData: {
                                            ...row,
                                            action: 'under_review_by_owner',
                                            statusTitle: FM('under-review')
                                        }
                                    })
                                    toggleActionModal()
                                },
                                name: FM('under-review')
                            },
                            {
                                IF: isVisibleSendForPayment(row),

                                icon: <Send size={14} />,
                                onClick: () => {
                                    setState({
                                        actionData: {
                                            ...row,
                                            action: 'sent_for_payment',
                                            statusTitle: FM('send-for-payment')
                                        }
                                    })
                                    toggleActionModal()
                                },
                                name: FM('send-for-payment')
                            },
                            {
                                IF: isVisibleMarkAsPaid(row),

                                icon: <CheckSquare size={14} />,
                                onClick: () => {
                                    setState({
                                        actionData: { ...row, action: 'paid', statusTitle: FM('mark-as-paid') }
                                    })
                                    toggleActionModal()
                                },
                                name: FM('mark-as-paid')
                            },
                            {
                                IF: isVisibleRejected(row),

                                icon: <X size={14} />,
                                onClick: () => {
                                    setState({
                                        actionData: { ...row, action: 'rejected', statusTitle: FM('reject-invoice') }
                                    })
                                    toggleActionModal()
                                },
                                name: FM('reject-invoice')
                            },
                            {
                                IF: isVisibleExportActvityLog(row),
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<Download size={14} />}
                                        onDropdown
                                        eventId={`export-${row?.id}`}
                                        text={FM('are-you-sure')}
                                        title={FM('export-lof-of', { count: row?.invoice_no })}
                                        onClickYes={() => {
                                            activityLogExport([row?.id], 'export', `export-${row?.id}`)
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('export-activity-log')}
                                    </ConfirmAlert>
                                )
                            }
                        ]}
                    />
                </Fragment>
            )
        }
    ]
    const onSuccessEvent = () => {
        reloadData()
    }
    const options: TableDropDownOptions = (selectedRows) => [
        {
            IF: canAddAction && user?.user_type !== userType.contractor,
            noWrap: true,
            name: (
                <ConfirmAlert
                    menuIcon={<CheckCircle size={14} />}
                    onDropdown
                    eventId={`item-approved`}
                    text={FM('are-you-sure')}
                    title={FM('approve-selected', { count: selectedRows?.selectedCount })}
                    onClickYes={() => {
                        if (user?.user_type === userType.epcm) {
                            handleActions(selectedRows?.ids, 'under_review_by_owner', 'item-approved')
                        } else if (user?.user_type === userType.owner) {
                            handleActions(selectedRows?.ids, 'approved', 'item-approved')
                        }
                        // handleActions(selectedRows?.ids, 'approved', 'item-approved')
                    }}
                    onSuccessEvent={onSuccessEvent}
                >
                    {FM('approve')}
                </ConfirmAlert>
            )
        },

        {
            IF: canAddAction && user?.user_type !== userType.contractor,
            noWrap: true,
            name: (
                <ConfirmAlert
                    menuIcon={<Pause size={14} />}
                    onDropdown
                    eventId={`item-on-hold`}
                    text={FM('are-you-sure')}
                    title={FM('set-on-hold-selected', { count: selectedRows?.selectedCount })}
                    onClickYes={() => {
                        handleActions(selectedRows?.ids, 'on_hold', 'item-on-hold')
                    }}
                    onSuccessEvent={onSuccessEvent}
                >
                    {FM('on-hold')}
                </ConfirmAlert>
            )
        },
        {
            IF: canAddAction && user?.user_type === userType.epcm,
            noWrap: true,
            name: (
                <ConfirmAlert
                    menuIcon={<Send size={14} />}
                    onDropdown
                    eventId={`item-send-for-payment`}
                    text={FM('are-you-sure')}
                    title={FM('set-send-for-payment-selected', { count: selectedRows?.selectedCount })}
                    onClickYes={() => {
                        handleActions(selectedRows?.ids, 'sent_for_payment', 'item-send-for-payment')
                    }}
                    onSuccessEvent={onSuccessEvent}
                >
                    {FM('send-for-payment')}
                </ConfirmAlert>
            )
        },
        {
            IF: canAddAction && user?.user_type === userType.owner,
            noWrap: true,
            name: (
                <ConfirmAlert
                    menuIcon={<CheckSquare size={14} />}
                    onDropdown
                    eventId={`item-mark-as-paid`}
                    text={FM('are-you-sure')}
                    title={FM('set-mark-as-paid-selected', { count: selectedRows?.selectedCount })}
                    onClickYes={() => {
                        handleActions(selectedRows?.ids, 'paid', 'item-mark-as-paid')
                    }}
                    onSuccessEvent={onSuccessEvent}
                >
                    {FM('mark-as-paid')}
                </ConfirmAlert>
            )
        }
    ]
    // handle sort
    const handleSort = (column: any, dir: string) => {
        setState({
            filterData: {
                ...state.filterData,
                sort: {
                    column: column?.id,
                    dir:
                        loadInvoiceResponse?.originalArgs?.jsonData?.sort?.column === column?.id
                            ? loadInvoiceResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
                                ? 'desc'
                                : 'asc'
                            : dir
                }
            }
        })
    }

    return (
        <Fragment>
            {renderCreateModal()}
            <InvoiceActionModal
                edit={state.actionData}
                showModal={actionModal}
                responseData={() => reloadData()}
                setShowModal={toggleActionModal}
                noView
            />
            {/* <CheckVerifyModal
        responseData={(e: boolean) => {
          if (e === true) {
            setState({
              verifyData: undefined
            })
          }
        }}
        showModal={verifyModal}
        edit={state?.verifyData}
        setShowModal={toggleVerifyModal}
        noView
      /> */}
            <Header route={props?.route} icon={<FileText size='25' />} title={FM('invoices')}>
                <ButtonGroup color='dark'>
                    <Show IF={canAddInvoice}>
                        <BsTooltip<ButtonProps>
                            Tag={Button}
                            className='btn-secondary'
                            color='secondary'
                            size='sm'
                            onClick={() => {
                                setState({
                                    enableEdit: false
                                })
                                form.reset()
                                toggleModalAdd()
                            }}
                            title={FM('create-invoice')}
                        >
                            <FilePlus size='14' className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
                            {/* <GetApp size='5px' /> */}
                        </BsTooltip>
                    </Show>
                    {/* <BsTooltip<ButtonProps> title={FM('import-invoice')}> */}
                    <Show IF={canAddInvoice}>
                        <BsTooltip<ButtonProps>
                            Tag={Button}
                            size='sm'
                            color='primary'
                            title={FM('import-invoice')}
                            className='btn btn-primary'
                        >
                            <InvoiceImport<ButtonProps>
                                responseData={() =>
                                    setState({
                                        lastRefresh: new Date().getTime()
                                    })
                                }
                            >
                                <Upload size={'14'} />
                            </InvoiceImport>
                        </BsTooltip>
                    </Show>
                    <Show IF={canExport}>
                        <BsTooltip<ButtonProps>
                            Tag={Button}
                            size='sm'
                            color='dark'
                            title={FM('export')}
                            className='btn btn-dark'
                        >
                            <InvoiceExportModal>
                                <Download size={'14'} />
                            </InvoiceExportModal>
                        </BsTooltip>
                    </Show>

                    {/* </BsTooltip> */}

                    <InvoiceFilter handleFilterData={handleFilterData} />
                    <BsTooltip<ButtonProps>
                        Tag={Button}
                        size='sm'
                        title={FM('reload')}
                        onClick={reloadData}
                        color='info'
                        className='btn btn-info'
                    >
                        <RefreshCcw size='14' />
                    </BsTooltip>
                </ButtonGroup>
            </Header>
            <CustomDataTable<InvoiceResponse>
                initialPerPage={20}
                isLoading={loadInvoiceResponse.isLoading}
                columns={columns}
                extraButtons={
                    <Fragment>
                        <Show IF={user?.user_type === userType.epcm}>
                            <Show IF={canViewInvoice}>
                                <BsTooltip<ButtonProps>
                                    Tag={Button}
                                    size='sm'
                                    color={state.creatorUserType === userType.contractor ? 'primary' : 'secondary'}
                                    title={FM('from-contractor')}
                                    onClick={() => {
                                        setState({
                                            creatorUserType: userType.contractor
                                        })
                                    }}
                                    className='btn btn-dark'
                                >
                                    <FileText size={'14'} />
                                </BsTooltip>
                            </Show>
                            <Show IF={canViewInvoice}>
                                <BsTooltip<ButtonProps>
                                    Tag={Button}
                                    size='sm'
                                    color={state.creatorUserType === userType.epcm ? 'primary' : 'secondary'}
                                    onClick={() => {
                                        setState({
                                            creatorUserType: userType.epcm
                                        })
                                    }}
                                    title={FM('from-epcm')}
                                    className='btn btn-dark ms-1'
                                >
                                    <FileText size={'14'} />
                                </BsTooltip>
                            </Show>
                        </Show>
                    </Fragment>
                }
                options={options}
                // selectableRows={canAddAction && user?.user_type !== userType.contractor}
                searchPlaceholder='search-invoice'
                onSort={handleSort}
                // selectableRowDisabled={(row: any) => row?.id === user?.id}
                defaultSortField={loadInvoiceResponse?.originalArgs?.jsonData?.sort}
                paginatedData={loadInvoiceResponse?.data}
                handlePaginationAndSearch={handlePageChange}
            />
        </Fragment>
    )
}

export default InvoiceList
