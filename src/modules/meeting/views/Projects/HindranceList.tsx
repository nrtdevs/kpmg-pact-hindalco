import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser'
import { QueryStatus } from '@reduxjs/toolkit/dist/query'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import {
    InvoiceType,
    Patterns,
    hindranceAction,
    hindranceAction1,
    hindranceStatus,
    hindranceType,
    priorityTypes,
    userType
} from '@src/utility/Const'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import {
    FM,
    JsonParseValidate,
    SuccessToast,
    createConstSelectOptions,
    emitAlertStatus,
    getKeyByValue,
    isValid,
    isValidArray,
    log,
    setInputErrors,
    truncateText
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { HindranceResponse } from '@src/utility/types/typeAuthApi'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { useForm } from 'react-hook-form'

import Verified from '@mui/icons-material/Verified'
import CustomDataTable, {
    TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import DropDownMenu from '@src/modules/common/components/dropdown'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import BsTooltip from '@src/modules/common/components/tooltip'
import { getPath } from '@src/router/RouteHelper'
import Hide from '@src/utility/Hide'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import httpConfig from '@src/utility/http/httpConfig'
import { stateReducer } from '@src/utility/stateReducer'
import { TableColumn } from 'react-data-table-component'
import {
    Award,
    Check,
    Download,
    Edit,
    Eye,
    EyeOff,
    FilePlus,
    FileText,
    Pause,
    PlusSquare,
    RefreshCcw,
    StopCircle,
    Trash2,
    Upload,
    User,
    UserCheck,
    X
} from 'react-feather'
import { Link, useNavigate } from 'react-router-dom'
import { Button, ButtonGroup, ButtonProps, Col, Form, NavItem, NavLink, Row } from 'reactstrap'
import * as yup from 'yup'
import {
    useActionHindranceMutation,
    useCreateOrUpdateHindranceMutation,
    useDeleteHindranceMutation,
    useExportHindranceMutation,
    useHindranceAssignMutation,
    useHindrancePriorityMutation,
    useLoadHindranceMutation
} from '../../redux/RTKQuery/HindranceRTK'
import HindranceImport from './HindranceImport'
import HindranceFilter from './Filter/HindranceFilter'
import AssignmentInd from '@mui/icons-material/AssignmentInd'

const hindranceFormSchema = {
    title: yup
        .string()
        .required()
        // match alphabets and spaces only
        .matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces')),
    hindrance_type: yup
        .object({
            label: yup.string().required(),
            value: yup.string().required()
        })
        .nullable()
        .required('required'),
    package: yup
        .object({
            label: yup.string().required(),
            value: yup.string().required()
        })
        .nullable()
        .required('required'),
    //   : yup.string().required(),
    //   vendor_name: yup
    //     .object({
    //       label: yup.string().required(),
    //       value: yup.string().required()
    //     })
    //     .nullable()
    //     .required('required'),
    //   vendor_contact_number: yup.string().required(),
    //   vendor_contact_email: yup.string().required(),
    notes: yup
        .string()
        .required()
        .when({
            is: (values: string) => values?.length > 0,
            then: (schema) =>
                schema.matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces'))
            //   otherwise: (schema) => schema.notRequired()
        })
        .max(244, FM('maximum-244-characters-allowed')),
    //project id  is dropdown  { label: "fdft", value: 2} with required validation
    project_id: yup
        .object({
            label: yup.string().required(),
            value: yup.string().required()
        })
        .nullable()
        .required('required')
    //   project_id: yup

    //   projectId: yup
    //     .string()
    //     .required()
    //     // match alphabets and spaces only
    //     .matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces')),
    //   description: yup.string().when({
    //     is: (values: string) => values?.length > 0,
    //     then: (schema) =>
    //       schema.matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces')),
    //     otherwise: (schema) => schema.notRequired()
    //   })
}
// validate
const schema = yup.object(hindranceFormSchema).required()

// states

type States = {
    page?: any
    per_page_record?: any
    enalbleVerify?: boolean
    responseChecklist?: any

    filterData?: any
    reload?: any
    isAddingNewData?: boolean
    search?: string
    lastRefresh?: any
    selectedUser?: HindranceResponse
    actionHindrance?: HindranceResponse
    verifyData?: HindranceResponse
    selectedRowsCount?: any
    enableEdit?: boolean
    enableAction?: boolean
}

const defaultValues: HindranceResponse = {
    id: undefined,
    name: undefined,
    project_id: undefined,
    title: undefined,
    description: undefined,
    created_at: undefined,
    updated_at: undefined,
    deleted_at: undefined,
    hindrance_code: undefined,
    hindrance_type: undefined,
    package: undefined,
    uploaded_files: undefined,
    vendor_name: undefined,
    vendor_contact_number: undefined,
    status: undefined,
    owner_id: undefined,
    epcm_id: undefined,
    notes: undefined,
    ids: undefined,
    reason_of_rejection: undefined,
    action: undefined,
    contractor_id: undefined,
    assignees: undefined,
    hindrance_id: undefined,
    priority: undefined,
    due_date: undefined,
    vendor_contact_email: undefined,
    contractor: undefined,
    from_date: undefined,
    to_date: undefined,
    reason_for_assignment: undefined
}

const HindranceList = (props: any) => {
    // header menu context
    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    const navigate = useNavigate()
    // user
    const user = useUser()
    // can add package
    const canAddPackage = Can(Permissions.packageAdd)

    // hindrance import
    const canImport = Can(Permissions.hindranceImport)
    const canExport = Can(Permissions.hindranceExport)
    // can add HindranceType
    const canAddHindranceType = Can(Permissions.hindranceTypeAdd)
    // can add hindrance
    const canAddHindrance = Can(Permissions.hindranceAdd)
    // can edit hindrance
    const canEditHindrance = Can(Permissions.hindranceEdit)
    // can delete hindrance
    const canDeleteHindrance = Can(Permissions.hindranceDelete)
    // can action hindrance
    const canActionHindrance = Can(Permissions.hindranceAction)

    // can view hindrance

    const canView = Can(Permissions.hindranceRead)

    // form hook
    const form = useForm<HindranceResponse>({
        resolver: yupResolver(schema),
        defaultValues
    })

    // toggle add modal
    const [modalAdd, toggleModalAdd] = useModal()
    const [modalAction, toggleModalAction] = useModal()
    const [modalResolve, toggleModalResolve] = useModal()
    const [modalExport, toggleModalExport] = useModal()
    const [modalAssign, toggleModalAssign] = useModal()
    const [modalPriority, toggleModalPriority] = useModal()

    // toggle view modal
    const [modalView, toggleModalView] = useModal()
    // create and update project mutation
    const [createHindrance, createHindranceResponse] = useCreateOrUpdateHindranceMutation()
    // delete Hindrance mutation
    const [deleteHindrance, deleteHindranceResponse] = useDeleteHindranceMutation()
    // load Hindrance mutation
    const [loadHindrance, loadHindranceResponse] = useLoadHindranceMutation()
    // load Hindrance mutation action
    const [createHindranceAction, loadHindranceActionResponse] = useActionHindranceMutation()
    //export Hindrance mutation
    const [exportHindrance, exportHindranceResponse] = useExportHindranceMutation()

    const [assignHindrance, assignHindranceResponse] = useHindranceAssignMutation()

    const [priority, assignPriority] = useHindrancePriorityMutation()

    // default states
    const initState: States = {
        page: 1,
        per_page_record: 20,
        filterData: undefined,
        search: '',
        enableEdit: false,
        enableAction: false,
        selectedRowsCount: undefined,
        // enalbleVerify: false,
        // enableReject: false,
        lastRefresh: new Date().getTime()
    }

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

    // close action modal
    const closeActionModal = () => {
        form.reset()
        toggleModalAction()
    }
    const closeResolveModal = () => {
        form.reset()
        toggleModalResolve()
    }
    const closeExportModal = () => {
        form.reset()
        toggleModalExport()
    }
    const closeAssignModal = () => {
        form.reset()
        toggleModalAssign()
    }
    const closePriorityModal = () => {
        form.reset()
        toggleModalPriority()
    }

    // handle save user
    const handleSaveUser = (data: any) => {
        createHindrance({
            jsonData: {
                ...state?.selectedUser,
                ...data,
                // owner_id: user?.id,
                project_id: data?.project_id?.value,
                // epcm_id: user?.user_type === 3 ? user?.epcm_id : data?.epcm_id?.value,
                status: data?.status?.value,
                package: data?.package?.value,
                contractor_id:
                    user?.user_type === 4
                        ? user?.id
                        : data?.vendor_name?.extra?.id || state.selectedUser?.contractor?.id,
                vendor_name: user?.user_type === 4 ? user?.name : data?.vendor_name?.value,
                vendor_contact_number:
                    user?.user_type === 4 ? user?.mobile_number : data?.vendor_contact_number,
                vendor_contact_email: user?.user_type === 4 ? user?.email : data?.vendor_contact_email,
                hindrance_type: data?.hindrance_type?.value,
                id: isValid(state?.selectedUser?.id) ? state?.selectedUser?.id : undefined,
                uploaded_files: data?.uploaded_files

                // invoice_check_id: data?.invoice_check_id?.value,
                // epcm_id: data?.epcm_id?.value,
                // status: isValid(data?.status) ? data?.status : 'pending'
            }
        })
    }

    // handle hindrance list
    const hindranceList = () => {
        loadHindrance({
            page: state.page,
            per_page_record: state.per_page_record,
            jsonData: {
                name: !isValid(state.filterData) ? state.search : undefined,
                ...state.filterData
            }
        })
    }
    // reload Data
    const reloadData = () => {
        setState({
            page: 1,
            search: '',
            filterData: undefined,
            per_page_record: 20,
            lastRefresh: new Date().getTime()
        })
    }

    // handle project create response
    useEffect(() => {
        if (!createHindranceResponse.isUninitialized) {
            if (createHindranceResponse.isSuccess) {
                closeAddModal()
                hindranceList()
                // SuccessToast(FM('hindrance-created-successfully'))
            } else if (createHindranceResponse.isError) {
                // handle error
                const errors: any = createHindranceResponse.error
                //   log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createHindranceResponse])

    // handle hindrance create response
    useEffect(() => {
        if (!loadHindranceActionResponse.isUninitialized) {
            if (loadHindranceActionResponse.isSuccess) {
                // closeActionModal()
                hindranceList()
                // SuccessToast(FM('hindrance-status-updated-successfully'))
            } else if (loadHindranceActionResponse.isError) {
                // handle error
                const errors: any = loadHindranceActionResponse.error
                //   log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [loadHindranceActionResponse])

    useEffect(() => {
        hindranceList()
    }, [
        state.page,
        state.search,
        state.per_page_record,
        state.filterData,
        state.lastRefresh
        // invoiceActionResult?.isSuccess
    ])

    // handle actions
    const handleActions = (ids?: any, action?: any, eventId?: any) => {
        if (isValidArray(ids)) {
            deleteHindrance({
                ids,
                eventId,
                action
            })
        }
    }
    const handleActionsHindrance = (ids?: any, action?: any, eventId?: any) => {
        if (isValidArray(ids)) {
            createHindranceAction({
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
    // handle filter data
    const handleFilterData = (e: any) => {
        setState({
            filterData: {
                ...e,
                owner_id: e?.owner_id?.value,
                contractor_id: e?.contractor_id?.value,
                epcm_id: e?.epcm_id?.value,
                status: e?.status?.value,
                priority: e?.priority?.value
            },
            page: 1,
            search: '',
            per_page_record: 20
        })
    }

    //   useEffect(() => {
    //     if (!canAddHindrance) return
    //     setHeaderMenu(
    //       <>
    //         <NavItem className=''>
    //           <BsTooltip title={FM('create-hindrance')}>
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
    //   }, [modalAdd, canAddHindrance])

    // handle action result
    useEffect(() => {
        if (deleteHindranceResponse?.isLoading === false) {
            if (deleteHindranceResponse?.isSuccess) {
                emitAlertStatus('success', null, deleteHindranceResponse?.originalArgs?.eventId)
            } else if (deleteHindranceResponse?.error) {
                emitAlertStatus('failed', null, deleteHindranceResponse?.originalArgs?.eventId)
            }
        }
    }, [deleteHindranceResponse])

    // handle action result
    useEffect(() => {
        if (loadHindranceActionResponse?.isLoading === false) {
            if (loadHindranceActionResponse?.isSuccess) {
                emitAlertStatus('success', null, loadHindranceActionResponse?.originalArgs?.eventId)
            } else if (loadHindranceActionResponse?.error) {
                emitAlertStatus('failed', null, loadHindranceActionResponse?.originalArgs?.eventId)
            }
        }
    }, [loadHindranceActionResponse])

    const handlePageChange = (e: TableFormData) => {
        setState({ ...e })
    }

    useEffect(() => {
        if (state.enableEdit) {
            form.setValue('project_id', {
                value: state?.selectedUser?.project_id,
                label: state?.selectedUser?.project?.name
            })
            form.setValue('hindrance_code', state?.selectedUser?.hindrance_code)
            //   form.setValue('hindrance_type', {
            //     value: state?.selectedUser?.hindrance_type,
            //     label: getKeyByValue(hindranceType, state?.selectedUser?.hindrance_type)
            //   })
            form.setValue('hindrance_type', {
                value: state?.selectedUser?.hindrance_type,
                label: state?.selectedUser?.hindrance_type
            })

            form.setValue('title', state?.selectedUser?.title)
            form.setValue('package', {
                value: state?.selectedUser?.package,
                label: state?.selectedUser?.package
            })
            form.setValue('description', state?.selectedUser?.description)
            //   form.setValue('uploaded_files', state?.selectedUser?.uploaded_files)
            //   log('files', JsonParseValidate(state.selectedUser?.uploaded_files))
            setTimeout(() => {
                form.setValue('uploaded_files', JsonParseValidate(state.selectedUser?.uploaded_files))
            }, 1000)
            form.setValue('vendor_name', {
                value: state?.selectedUser?.vendor_name,
                label: state?.selectedUser?.vendor_name
            })
            form.setValue('vendor_contact_number', state?.selectedUser?.vendor_contact_number)
            form.setValue('status', state?.selectedUser?.status)
            form.setValue('owner_id', state?.selectedUser?.owner_id)
            form.setValue('epcm_id', {
                value: state?.selectedUser?.epcm_id,
                label: state?.selectedUser?.epcm?.name
            })
            form.setValue('notes', state?.selectedUser?.notes)
            //   form.setValue('hindrance_id', state?.selectedUser?.title)
            form.setValue('action', state?.selectedUser?.action)
            form.setValue('due_date', state?.selectedUser?.due_date)
            form.setValue('priority', {
                value: state?.selectedUser?.priority,
                label: getKeyByValue(priorityTypes, state?.selectedUser?.priority)
            })
            form.setValue('reason_of_rejection', state?.selectedUser?.reason_of_rejection)
            form.setValue('assignees', {
                value: state?.selectedUser?.assignees,
                label: state?.selectedUser?.assignees?.assigned_to?.name
            })
        }
    }, [state.enableEdit])

    //   useEffect(() => {
    //     form.setValue('assignees', {
    //         value: state?.selectedUser?.assignees.map((e) => e?.id)),
    //         label: state?.selectedUser?.assignees?.assigned_to?.name
    //         })
    //     }
    //   }, [state.selectedUser])

    useEffect(() => {
        form.setValue(
            'assignees',
            state?.selectedRowsCount?.assignees?.map((e) => {
                return {
                    value: e?.assigned_to?.id,
                    label: e?.assigned_to?.name
                }
            })
        ),
            form.setValue('reason_for_assignment', state?.selectedRowsCount?.reason_for_assignment)
    }, [state.selectedRowsCount])

    useEffect(() => {
        form.setValue('due_date', state?.selectedRowsCount?.due_date)
        form.setValue('priority', {
            value: state?.selectedRowsCount?.priority,
            label: getKeyByValue(priorityTypes, state?.selectedRowsCount?.priority)
        })
    }, [state.selectedRowsCount])
    useEffect(() => {
        if (state.enableAction) {
            form.setValue('action', state?.actionHindrance?.action)
            form.setValue('reason_of_rejection', state?.actionHindrance?.reason_of_rejection)
        }
    }, [state.enableAction])

    //   useEffect(() => {
    //     if (user?.role_id === 3) {
    //       form.setValue('vendor_name', {
    //         value: `${user.email} | ${user.name} `,
    //         label: user?.name
    //       })
    //     }
    //   }, [user])
    //open action modal
    useEffect(() => {
        if (state.enableAction) {
            toggleModalAction()
        }
    }, [state.enableAction])

    // save contractor details
    useEffect(() => {
        if (form.watch('vendor_name')) {
            form.setValue(
                'vendor_contact_number',
                form.watch('vendor_name')?.extra?.mobile_number ?? state.selectedUser?.vendor_contact_number
            )
            form.setValue(
                'vendor_contact_email',
                form.watch('vendor_name')?.extra?.email ?? state.selectedUser?.vendor_contact_email
            )
        }
    }, [form.watch('vendor_name')])

    useEffect(() => {
        if (form.watch('hindrance_id')) {
            form.setValue('package', form.watch('hindrance_id')?.extra?.package)
        }
    }, [form.watch('hindrance_id')])

    useEffect(() => {
        if (
            loadHindranceActionResponse?.isSuccess &&
            loadHindranceActionResponse?.originalArgs?.action === 'rejected'
        ) {
            closeActionModal()
        }
    }, [loadHindranceActionResponse])

    useEffect(() => {
        if (
            loadHindranceActionResponse?.isSuccess &&
            loadHindranceActionResponse?.originalArgs?.action === 'resolved'
        ) {
            closeResolveModal()
        }
    }, [loadHindranceActionResponse])

    useEffect(() => {
        if (exportHindranceResponse?.isSuccess) {
            closeExportModal()
            window.open(httpConfig?.baseUrl3 + exportHindranceResponse?.data?.data?.url, '_blank')
        }
    }, [exportHindranceResponse])

    useEffect(() => {
        if (assignPriority?.isSuccess) {
            closePriorityModal()
            hindranceList()
        }
    }, [assignPriority])

    useEffect(() => {
        if (assignHindranceResponse?.isSuccess) {
            closeAssignModal()
            hindranceList()
            //   SuccessToast(FM('hindrance-assigned-successfully'))
        }
    }, [assignHindranceResponse])

    const redirectToHindrance = (row: HindranceResponse, id: any) => {
        navigate(getPath('hindrance.view', { id: row?.id }))
    }

    const handleReject = (data: any) => {
        if (isValid(form.watch('reason_of_rejection')) && isValid(state?.selectedRowsCount)) {
            createHindranceAction({
                ids: [state?.selectedRowsCount],
                eventId: 'item-rejected',
                action: 'rejected',
                jsonData: {
                    ids: [state?.selectedRowsCount],
                    action: 'rejected',
                    reason_of_rejection: form.watch('reason_of_rejection')
                }
            })
        }
    }

    const handleResolve = (data: any) => {
        if (isValid(form.watch('reason_of_rejection')) && isValid(state?.selectedRowsCount)) {
            createHindranceAction({
                ids: [state?.selectedRowsCount],
                eventId: 'item-resolved',
                action: 'resolved',
                jsonData: {
                    ids: [state?.selectedRowsCount],
                    action: 'resolved',
                    reason_of_rejection: form.watch('reason_of_rejection')
                }
            })
        }
    }
    const handleExportModal = (data: any) => {
        // if (isValid(form.watch('status')) && isValid('contractor_id')) {
        exportHindrance({
            // ids: [state?.selectedRowsCount],
            // eventId: 'item-resolved',
            // action: 'resolved',
            jsonData: {
                //   ids: [state?.selectedRowsCount],
                //   action: 'resolved',
                contractor_id: user?.user_type === 4 ? user?.id : form.watch('contractor_id')?.value,
                status: form.watch('status')?.value,
                from_date: form.watch('from_date'),
                to_date: form.watch('to_date')
            }
        })
        // }
    }

    const handleAssignModal = (data: any) => {
        if (isValid(form.watch('assignees')) && isValid('hindrance_id')) {
            assignHindrance({
                jsonData: {
                    assignees: form.watch('assignees')?.map((e) => e?.value),
                    //   hindrance_id: form.watch('hindrance_id')?.value
                    hindrance_id: state?.selectedRowsCount?.id,
                    reason_for_assignment: form.watch('reason_for_assignment')
                }
            })
        }
    }

    //priority modal
    const handlePriorityModal = () => {
        if (isValid(form.watch('due_date'))) {
            priority({
                // ids: [state?.selectedRowsCount],
                // eventId: 'item-resolved',
                // action: 'resolved',
                jsonData: {
                    hindrance_id: state?.selectedRowsCount?.id,
                    priority: form.watch('priority')?.value,
                    due_date: form.watch('due_date')
                }
            })
        }
    }
    const renderActionModal = () => {
        return (
            <CenteredModal
                open={modalAction}
                done={'reject'}
                modalClass={'modal-sm'}
                disableSave={!isValid(form.watch('reason_of_rejection'))}
                handleModal={closeActionModal}
                title={FM('reject-hindrance')}
                loading={loadHindranceActionResponse.isLoading}
                handleSave={handleReject}
            >
                <div className='p-2'>
                    <Form>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            <Col md='12'>
                                <FormGroupCustom
                                    key={'handleReject'}
                                    control={form.control}
                                    label={FM('reason-of-rejection')}
                                    name='reason_of_rejection'
                                    type='text'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'reason_of_rejection'
                                    }}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                        </Row>
                    </Form>
                </div>
            </CenteredModal>
        )
    }

    const renderResolveModal = () => {
        return (
            <CenteredModal
                open={modalResolve}
                done={'resolve'}
                modalClass={'modal-sm'}
                disableSave={!isValid(form.watch('reason_of_rejection'))}
                handleModal={closeResolveModal}
                title={FM('resolve-hindrance')}
                loading={loadHindranceActionResponse.isLoading}
                handleSave={handleResolve}
            >
                <div className='p-2'>
                    <Form>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            <Col md='12'>
                                <FormGroupCustom
                                    key={'handleReject'}
                                    control={form.control}
                                    label={FM('reason')}
                                    name='reason_of_rejection'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'reason_of_rejection'
                                    }}
                                    type='text'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>
                        </Row>
                    </Form>
                </div>
            </CenteredModal>
        )
    }
    const renderExportModal = () => {
        return (
            <CenteredModal
                open={modalExport}
                done={'export'}
                modalClass={'modal-md'}
                // disableSave={!isValid(form.watch('status')) && !isValid(form.watch('contractor_id'))}
                handleModal={closeExportModal}
                title={FM('export-hindrance')}
                loading={exportHindranceResponse.isLoading}
                handleSave={handleExportModal}
            >
                <div className='p-2'>
                    <Form>
                        {/* submit form ohandleExportModaln enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            <Hide IF={user?.user_type === 4}>
                                <Col md='12'>
                                    <FormGroupCustom
                                        control={form.control}
                                        async
                                        label={FM('contractor-name')}
                                        name='contractor_id'
                                        loadOptions={loadDropdown}
                                        path={ApiEndpoints.global_user}
                                        selectLabel={(e) => `${e.name} | ${e.email} `}
                                        selectValue={(e) => e.id}
                                        defaultOptions
                                        type='select'
                                        className='mb-1'
                                        rules={{ required: false }}
                                    />
                                </Col>
                            </Hide>
                            <Col md='12'>
                                <FormGroupCustom
                                    //   key={`${state?.selectedUser?.status}`}
                                    control={form.control}
                                    label={FM('status')}
                                    name='status'
                                    selectOptions={createConstSelectOptions(hindranceAction1, FM)}
                                    type='select'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('from')}
                                    name='from_date'
                                    type='date'
                                    className='mb-1'
                                    //   datePickerOptions={{
                                    //     minDate: new Date()
                                    //   }}
                                    rules={{ required: false }}
                                />
                            </Col>
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('to')}
                                    name='to_date'
                                    type='date'
                                    className='mb-1'
                                    datePickerOptions={{
                                        minDate: form.watch('from_date')
                                    }}
                                    rules={{ required: false }}
                                />
                            </Col>
                        </Row>
                    </Form>
                </div>
            </CenteredModal>
        )
    }
    const renderAssignModal = () => {
        return (
            <CenteredModal
                open={modalAssign}
                done={'assign'}
                modalClass={'modal-lg'}
                disableSave={!isValid(form.watch('hindrance_id')) && !isValid(form.watch('assignees'))}
                handleModal={closeAssignModal}
                // title={`${FM('assign-hindrance')}  ${state?.selectedRowsCount?.title}`}
                title={FM('assign-hindrance')}
                loading={assignHindranceResponse.isLoading}
                scrollControl={false}
                handleSave={handleAssignModal}
            >
                <div className='p-2'>
                    <Form>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            <Col md='6'>
                                <FormGroupCustom
                                    key={'handleExportModal'}
                                    control={form.control}
                                    label={FM('hindrance')}
                                    defaultValue={state?.selectedRowsCount?.title}
                                    isDisabled={true}
                                    name='hindrance_id'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'hindrance_id'
                                    }}
                                    type='text'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>
                            <Col md='6'>
                                <FormGroupCustom
                                    control={form.control}
                                    async
                                    label={FM('assignees')}
                                    name='assignees'
                                    loadOptions={loadDropdown}
                                    isMulti
                                    path={ApiEndpoints.global_user}
                                    selectLabel={(e) =>
                                        `${e.name} | ${e.package?.name === undefined || e.package?.name === null
                                            ? 'N/A'
                                            : e.package?.name
                                        } `
                                    }
                                    selectValue={(e) => e.id}
                                    defaultOptions
                                    type='select'
                                    jsonData={{
                                        // filter by user_type 3 & 4
                                        user_type_arr: [3, 4]
                                    }}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            {/* <Col md='12'>
                <FormGroupCustom
                  defaultValue={state?.selectedRowsCount?.package}
                  control={form.control}
                  label={FM('package')}
                  name='package'
                  type='text'
                  isDisabled={true}
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col> */}
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    key={`${state?.selectedRowsCount?.reason_for_assignment}`}
                                    label={FM('reason-for-assigning')}
                                    name='reason_for_assignment'
                                    type='text'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'reason_for_assignment'
                                    }}
                                    className='mb-1'
                                    //   datePickerOptions={{
                                    //     minDate: formatDate(new Date(), 'YYYY-MM-DD')
                                    //   }}
                                    rules={{ required: true }}
                                />
                            </Col>
                        </Row>
                    </Form>
                </div>
            </CenteredModal>
        )
    }
    const renderPriorityModal = () => {
        return (
            <CenteredModal
                open={modalPriority}
                done={'save'}
                modalClass={'modal-md'}
                disableSave={!isValid(form.watch('priority')) && !isValid(form.watch('due_date'))}
                handleModal={closePriorityModal}
                title={FM('hindrance-priority')}
                loading={assignPriority.isLoading}
                handleSave={handlePriorityModal}
            >
                <div className='p-2'>
                    <Form>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    key={`${state?.selectedUser?.due_date}`}
                                    label={FM('due-date')}
                                    name='due_date'
                                    type='date'
                                    className='mb-1'
                                    //   datePickerOptions={{
                                    //     minDate: formatDate(new Date(), 'YYYY-MM-DD')
                                    //   }}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='12'>
                                <FormGroupCustom
                                    label={FM('priority')}
                                    type={'select'}
                                    isClearable
                                    defaultOptions
                                    control={form.control}
                                    selectOptions={createConstSelectOptions(priorityTypes, FM)}
                                    name={'priority'}
                                    className='mb-2'
                                />
                            </Col>
                        </Row>
                    </Form>
                </div>
            </CenteredModal>
        )
    }

    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modalAdd}
                done={state.enableEdit ? 'save' : 'save'}
                modalClass={'modal-lg'}
                title={state.enableEdit ? FM('edit-hindrance') : FM('create-hindrance')}
                handleModal={closeAddModal}
                loading={createHindranceResponse.isLoading}
                handleSave={form.handleSubmit(handleSaveUser)}
            >
                <div className='p-2'>
                    <Form onSubmit={form.handleSubmit(handleSaveUser)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            <Col md='4'>
                                <FormGroupCustom
                                    control={form.control}
                                    async
                                    label={FM('project')}
                                    name='project_id'
                                    loadOptions={loadDropdown}
                                    path={ApiEndpoints.loadProjectGlobal}
                                    selectLabel={(e) => `${e.name} | ${e.projectId} `}
                                    selectValue={(e) => e.id}
                                    defaultOptions
                                    type='select'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md='4'>
                                <FormGroupCustom
                                    control={form.control}
                                    async
                                    label={FM('hindrance-type')}
                                    name='hindrance_type'
                                    loadOptions={loadDropdown}
                                    path={ApiEndpoints.loadHindranceTypeGlobal}
                                    //   selectLabel={(e) => `${e.epcm_id} `}
                                    selectLabel={(e) => `${e.name} `}
                                    selectValue={(e) => e.name}
                                    defaultOptions
                                    type='select'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md='4'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.title}`}
                                    control={form.control}
                                    label={FM('title')}
                                    name='title'
                                    type='text'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'title'
                                    }}
                                    isDisabled={false}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='4'>
                                <FormGroupCustom
                                    control={form.control}
                                    async
                                    label={FM('package')}
                                    name='package'
                                    loadOptions={loadDropdown}
                                    path={ApiEndpoints.loadPackageGlobal}
                                    //   selectLabel={(e) => `${e.epcm_id} `}
                                    selectLabel={(e) => `${e.name} `}
                                    selectValue={(e) => e.name}
                                    defaultOptions
                                    type='select'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Hide IF={user?.user_type === 4}>
                                <Col md='4'>
                                    <FormGroupCustom
                                        key={`${state?.selectedUser?.vendor_name} -- ${user?.name}`}
                                        control={form.control}
                                        async
                                        label={FM('contractor-name')}
                                        name='vendor_name'
                                        loadOptions={loadDropdown}
                                        path={ApiEndpoints.global_user}
                                        //   selectLabel={(e) => `${e.epcm_id} `}
                                        selectLabel={(e) => `${e.name} | ${e.email} `}
                                        selectValue={(e) => e.name}
                                        defaultOptions
                                        jsonData={{
                                            user_type: 4
                                        }}
                                        type='select'
                                        className='mb-1'
                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Hide>
                            <Show IF={user?.user_type === 4}>
                                <Col md='4'>
                                    <FormGroupCustom
                                        key={`${user?.name}`}
                                        control={form.control}
                                        label={FM('contractor-name')}
                                        name='vendor_names'
                                        defaultValue={user?.name}
                                        type='text'
                                        onRegexValidation={{
                                            form: form,
                                            fieldName: 'vendor_names'
                                        }}
                                        isDisabled={true}
                                        className='mb-1'
                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Show>
                            {/* <Hide IF={user?.user_type === 4}>
                <Col md='4'>
                  <FormGroupCustom
                    key={`${state?.selectedUser?.vendor_contact_number}`}
                    control={form.control}
                    label={FM('pending-with')}
                    name='vendor_contact_number'
                    type='number'
                    isDisabled={true}
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
              </Hide> */}
                            {/* <Show IF={user?.user_type === 4}>
                <Col md='4'>
                  <FormGroupCustom
                    key={`${state?.selectedUser?.vendor_contact_number}`}
                    control={form.control}
                    label={FM('pending-with')}
                    name='vendor_contact_number'
                    defaultValue={user?.mobile_number}
                    type='number'
                    isDisabled={true}
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
              </Show> */}
                            <Hide IF={user?.user_type === userType.contractor}>
                                <Col md='4'>
                                    <FormGroupCustom
                                        key={`${state?.selectedUser?.vendor_contact_email}`}
                                        control={form.control}
                                        label={FM('contractor-email')}
                                        name='vendor_contact_email'
                                        type='text'
                                        onRegexValidation={{
                                            form: form,
                                            fieldName: 'vendor_contact_email'
                                        }}
                                        isDisabled={true}
                                        className='mb-1'
                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Hide>
                            <Show IF={user?.user_type === userType.contractor}>
                                <Col md='4'>
                                    <FormGroupCustom
                                        key={`${state?.selectedUser?.vendor_contact_email}`}
                                        control={form.control}
                                        label={FM('contractor-email')}
                                        name='vendor_contact_email'
                                        defaultValue={user?.email}
                                        type='text'
                                        onRegexValidation={{
                                            form: form,
                                            fieldName: 'vendor_contact_email'
                                        }}
                                        isDisabled={true}
                                        className='mb-1'
                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Show>
                        </Row>
                        <Row>
                            {/* <Show IF={user?.role_id === 3}> */}
                            <Col md='12'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.notes}`}
                                    control={form.control}
                                    label={FM('description-of-issue')}
                                    name='notes'
                                    type='textarea'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'notes'
                                    }}
                                    isDisabled={false}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            {/* <Col md='6'>
                <FormGroupCustom
                  key={`${state?.selectedUser?.description}`}
                  control={form.control}
                  label={FM('description')}
                  name='description'
                  type='textarea'
                  isDisabled={false}
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col> */}
                            {/* </Show> */}
                        </Row>
                        <Row>
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

    const columns: TableColumn<HindranceResponse>[] = [
        {
            name: FM('title'),
            id: 'title',
            cell: (row) => (
                <Fragment>
                    <Link
                        state={{ ...row }}
                        to={getPath('hindrance.view', { id: row?.id })}
                        role={'button'}
                        className={canView ? 'text-primary' : 'pe-none'}
                    >
                        {truncateText(row?.title, 50)}
                    </Link>
                </Fragment>
            )
        },
        // {
        //   name: FM('project-name'),

        //   id: 'project?.name',
        //   cell: (row) => (
        //     <Fragment>
        //       {' '}
        //       <Link
        //         state={{ ...row }}
        //         to={getPath('project.view', { id: row?.project_id })}
        //         role={'button'}
        //         className={canView ? 'text-primary' : 'pe-none'}
        //       >
        //         {row?.project?.name}
        //       </Link>
        //     </Fragment>
        //   )
        // },
        {
            name: FM('hindrance-code'),

            id: 'hindrance_code',
            cell: (row) => <Fragment>{row?.hindrance_code}</Fragment>
        },
        {
            name: FM('hindrance-type'),

            id: 'hindrance_type',
            cell: (row) => <Fragment>{row?.hindrance_type}</Fragment>
        },
        {
            name: FM('contractor-name'),

            id: 'vendor_name',
            cell: (row) => <Fragment>{row?.vendor_name}</Fragment>
        },
        // {
        //   name: FM('pending-with'),

        //   id: 'vendor_contact_number',
        //   cell: (row) => <Fragment>{row?.vendor_contact_number}</Fragment>
        // },

        // {
        //   name: FM('status'),

        //   id: 'status',
        //   cell: (row) => <Fragment>{row?.status}</Fragment>
        // },

        {
            name: FM('status'),

            id: 'status',
            cell: (row) => (
                <Fragment>
                    <span
                        className={`badge badge-pill badge-light-${row?.status === hindranceAction1['rejected-by-owner']
                            ? 'danger'
                            : row?.status === hindranceAction1['rejected-by-epcm']
                                ? 'danger'
                                : row?.status === hindranceAction1['rejected-by-admin']
                                    ? 'danger'
                                    : row?.status === hindranceAction1['on-hold']
                                        ? 'warning'
                                        : row?.status === hindranceAction1['under-review-by-owner']
                                            ? 'info'
                                            : row?.status === hindranceAction1['under-review-by-epcm']
                                                ? 'dark'
                                                : row?.status === hindranceAction1.pending
                                                    ? 'secondary'
                                                    : 'success'
                            }`}
                    >
                        {getKeyByValue(hindranceAction1, row?.status)}
                    </span>
                </Fragment>
            )
        },
        {
            name: FM('priority'),

            id: 'priority',
            cell: (row) => (
                <Fragment>
                    <span
                        className={`badge badge-pill badge-light-${row?.priority === priorityTypes.high
                            ? 'danger'
                            : row?.priority === priorityTypes.medium
                                ? 'warning'
                                : 'success'
                            }`}
                    >
                        {getKeyByValue(priorityTypes, row?.priority ?? 'N/A')}
                    </span>
                </Fragment>
            )
        },
        {
            name: FM('reason-for-assigning'),
            minWidth: '200px',
            id: 'reason_for_assignment',
            cell: (row) => <Fragment>{truncateText(row?.reason_for_assignment ?? 'N/A', 80)}</Fragment>
        },

        {
            name: FM('action'),
            cell: (row) => (
                <Fragment>
                    <DropDownMenu
                        options={[
                            {
                                IF:
                                    canEditHindrance &&
                                    row?.status !== hindranceAction.resolved &&
                                    row?.status !== hindranceAction['on-hold'] &&
                                    //   row?.created_by !== user?.id,
                                    row?.created_by === user?.id,

                                icon: <Edit size={14} />,
                                onClick: () => {
                                    setState({
                                        enableEdit: true,
                                        selectedUser: row
                                    })
                                    toggleModalAdd()
                                },
                                name: FM('edit')
                            },
                            {
                                IF: canView,
                                icon: <Eye size={14} />,
                                onClick: () => {
                                    setState({
                                        //   enableEdit: true,
                                        //   selectedUser: row
                                    })
                                    // toggleModalAdd()
                                    redirectToHindrance(row, row?.id)
                                },
                                name: FM('view')
                            },

                            {
                                IF:
                                    canDeleteHindrance &&
                                    row?.status !== hindranceAction.resolved &&
                                    row?.created_by !== user?.id,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<Trash2 size={14} />}
                                        onDropdown
                                        eventId={`item-delete-hindrance-${row?.id}`}
                                        text={FM('are-you-sure')}
                                        title={FM('delete-item', { name: row?.title })}
                                        onClickYes={() => {
                                            handleActions([row?.id], 'delete', `item-delete-hindrance-${row?.id}`)
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('delete')}
                                    </ConfirmAlert>
                                )
                            },
                            {
                                IF: canActionHindrance && row?.status !== hindranceAction.resolved,

                                icon: <User size={14} />,
                                onClick: () => {
                                    setState({
                                        selectedRowsCount: row
                                    })
                                    toggleModalAssign()
                                },
                                name: FM('assign-hindrance')
                            },
                            {
                                IF:
                                    canActionHindrance &&
                                    user?.user_type !== 4 &&
                                    row?.status !== hindranceAction.resolved,

                                icon: <Award size={14} />,
                                onClick: () => {
                                    setState({
                                        selectedRowsCount: row
                                    })
                                    toggleModalPriority()
                                },
                                name: FM('set-priority')
                            },
                            {
                                IF:
                                    canActionHindrance &&
                                    row?.status !== hindranceAction['on-hold'] &&
                                    row?.status !== hindranceAction.resolved &&
                                    row?.status !== hindranceAction['reject-by-epcm'] &&
                                    row?.status !== hindranceAction['reject-by-owner'] &&
                                    row?.status !== hindranceAction['reject-by-admin'] &&
                                    row?.created_by !== user?.id,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<StopCircle size={14} />}
                                        onDropdown
                                        eventId={`item-on-hold-${row?.id}}`}
                                        text={FM('are-you-sure')}
                                        title={FM('set-on-hold-selected', { count: 1 })}
                                        onClickYes={() => {
                                            handleActionsHindrance([row?.id], 'on_hold', `item-on-hold-${row?.id}}`)
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('on-hold')}
                                    </ConfirmAlert>
                                )
                            },
                            {
                                IF:
                                    user?.user_type === 2 &&
                                    user?.user_type === 3 &&
                                    row?.status !== hindranceAction.resolved,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<AssignmentInd />}
                                        onDropdown
                                        eventId={`re-assign-${row?.id}}`}
                                        text={FM('are-you-sure')}
                                        title={FM('re-assign-to-contractor', { count: 1 })}
                                        onClickYes={() => {
                                            handleActionsHindrance([row?.id], 're-assign', `re-assign-${row?.id}}`)
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('re-assign-to-contractor')}
                                    </ConfirmAlert>
                                )
                            },
                            //   {
                            //     IF:
                            //       canActionHindrance &&
                            //       user?.user_type !== 2 &&
                            //       row?.status !== hindranceAction['under-review-by-epcm'] &&
                            //       row?.status !== hindranceAction.resolved &&
                            //       row?.status !== hindranceAction.rejected,
                            //     noWrap: true,
                            //     name: (
                            //       <ConfirmAlert
                            //         menuIcon={<Pause size={14} />}
                            //         onDropdown
                            //         eventId={`item-under-review-${row?.id}}`}
                            //         text={FM('are-you-sure')}
                            //         title={FM('review-item-by-owner', { count: 1 })}
                            //         onClickYes={() => {
                            //           handleActionsHindrance(
                            //             [row?.id],
                            //             'under_review_by_owner',
                            //             `item-under-review-${row?.id}}`
                            //           )
                            //         }}
                            //         onSuccessEvent={onSuccessEvent}
                            //       >
                            //         {FM('under-review-by-owner')}
                            //       </ConfirmAlert>
                            //     )
                            //   },
                            //   {
                            //     IF: canActionHindrance,
                            //     noWrap: true,
                            //     name: (
                            //       <ConfirmAlert
                            //         menuIcon={<Check size={14} />}
                            //         onDropdown
                            //         eventId={`item-approve-${row?.id}}`}
                            //         text={FM('are-you-sure')}
                            //         title={FM('approve', { count: 1 })}
                            //         onClickYes={() => {
                            //           handleActionsHindrance([row?.id], 'approved', `item-approve-${row?.id}}`)
                            //         }}
                            //         onSuccessEvent={onSuccessEvent}
                            //       >
                            //         {FM('approved')}
                            //       </ConfirmAlert>
                            //     )
                            //   },
                            {
                                IF:
                                    canActionHindrance &&
                                    row?.status !== hindranceAction['reject-by-epcm'] &&
                                    row?.status !== hindranceAction['reject-by-owner'] &&
                                    row?.status !== hindranceAction['reject-by-admin'] &&
                                    row?.status !== hindranceAction.resolved &&
                                    row?.created_by !== user?.id,

                                icon: <X size={14} />,
                                onClick: () => {
                                    setState({
                                        selectedRowsCount: row?.id
                                    })
                                    toggleModalAction()
                                },
                                name: FM('reject-hindrance')
                            },

                            {
                                IF:
                                    canActionHindrance &&
                                    row?.status !== hindranceAction.resolved &&
                                    row?.status !== hindranceAction['reject-by-epcm'] &&
                                    row?.status !== hindranceAction['reject-by-owner'] &&
                                    row?.status !== hindranceAction['reject-by-admin'] &&
                                    row?.created_by !== user?.id,

                                icon: <Verified />,
                                onClick: () => {
                                    setState({
                                        selectedRowsCount: row?.id
                                    })
                                    toggleModalResolve()
                                },
                                name: FM('resolve-hindrance')
                            }
                            //   {
                            //     IF: canEditHindrance,
                            //     icon: <PenTool size={14} />,
                            //     onClick: () => {
                            //       setState({
                            //         enableAction: true,
                            //         actionHindrance: row
                            //       })
                            //     },
                            //     name: FM('action')
                            //   }
                        ]}
                    />
                </Fragment>
            )
        }
    ]

    const onSuccessEvent = () => {
        reloadData()
    }

    // handle sort
    const handleSort = (column: any, dir: string) => {
        setState({
            filterData: {
                ...state.filterData,
                sort: {
                    column: column?.id,
                    dir:
                        loadHindranceResponse?.originalArgs?.jsonData?.sort?.column === column?.id
                            ? loadHindranceResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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
            {renderActionModal()}
            {renderResolveModal()}
            {renderExportModal()}
            {renderAssignModal()}
            {renderPriorityModal()}
            {/* {renderActionModal()}
      / */}
            <Header route={props?.route} icon={<Pause size='25' />} title={FM('hindrance')}>
                <ButtonGroup color='dark'>
                    <Show IF={canAddHindrance}>
                        <BsTooltip<ButtonProps>
                            Tag={Button}
                            className='btn-primary'
                            color='primary'
                            size='sm'
                            onClick={() => {
                                setState({
                                    enableEdit: false
                                })
                                form.reset()
                                toggleModalAdd()
                            }}
                            title={FM('create-hindrance')}
                        >
                            <FilePlus size='14' className={'ficon ' + (modalAdd ? 'text-white' : '')} />
                            {/* <GetApp size='5px' /> */}
                        </BsTooltip>
                    </Show>
                    {/* <InvoiceFilter handleFilterData={handleFilterData} /> */}
                    <HindranceFilter handleFilterData={handleFilterData} />
                    <Show IF={user?.user_type === userType.admin}>
                        <BsTooltip<ButtonProps>
                            title={FM('import-hindrance')}
                            size='sm'
                            Tag={Button}
                            color='primary'
                            className='btn  size-sm'
                        >
                            <HindranceImport>
                                <Upload size='14' />
                            </HindranceImport>
                        </BsTooltip>
                    </Show>
                    <Show IF={canExport}>
                        <BsTooltip<ButtonProps>
                            Tag={Button}
                            className='btn-secondary'
                            color='secondary'
                            size='sm'
                            onClick={() => {
                                toggleModalExport()
                            }}
                            title={FM('export-hindrance')}
                        >
                            <Download size='14' />
                            {/* <GetApp size='5px' /> */}
                        </BsTooltip>
                    </Show>
                    <Show IF={canAddPackage}>
                        <BsTooltip<ButtonProps>
                            Tag={Button}
                            className='btn-secondary'
                            color='info'
                            size='sm'
                            onClick={() => {
                                navigate('/package')
                            }}
                            title={FM('create-package')}
                        >
                            <PlusSquare size='14' />
                            {/* <FilePlus size='15px' /> */}
                        </BsTooltip>
                    </Show>
                    <Show IF={canAddHindranceType}>
                        <BsTooltip<ButtonProps>
                            Tag={Button}
                            className='btn-secondary'
                            size='sm'
                            color='dark'
                            onClick={() => {
                                navigate('/hindrance-type')
                            }}
                            title={FM('create-hindrance-type')}
                        >
                            {/* <NoteAlt size='15px' /> */}
                            <FilePlus size='14' />
                        </BsTooltip>
                    </Show>
                    <LoadingButton
                        tooltip={FM('reload')}
                        loading={loadHindranceResponse.isLoading}
                        size='sm'
                        color='info'
                        onClick={reloadData}
                    >
                        <RefreshCcw size='14' />
                    </LoadingButton>
                </ButtonGroup>
            </Header>
            <CustomDataTable<HindranceResponse>
                initialPerPage={20}
                isLoading={loadHindranceResponse.isLoading}
                columns={columns}
                // options={options}
                // selectableRows={canAddAction && user?.role_id !== 3}

                searchPlaceholder='search-hindrance'
                onSort={handleSort}
                // selectableRowDisabled={(row: any) => row?.id === user?.id}
                defaultSortField={loadHindranceResponse?.originalArgs?.jsonData?.sort}
                paginatedData={loadHindranceResponse?.data}
                handlePaginationAndSearch={handlePageChange}
            />
        </Fragment>
    )
}

export default HindranceList
