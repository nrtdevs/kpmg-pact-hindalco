import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser'
import { QueryStatus } from '@reduxjs/toolkit/dist/query'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
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
import {
    useActionUserMutation,
    useCreateOrUpdateUserMutation,
    useLoadUsersMutation
} from '@src/modules/meeting/redux/RTKQuery/UserManagement'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import Hide from '@src/utility/Hide'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import { stateReducer } from '@src/utility/stateReducer'
import {
    CheckParamsEntity,
    InvoiceCheksResponse,
    InvoiceResponse,
    UserData
} from '@src/utility/types/typeAuthApi'
import {
    emitAlertStatus,
    FM,
    formatDate,
    isValid,
    isValidArray,
    JsonParseValidate,
    log,
    setInputErrors,
    setValues,
    SuccessToast
} from '@src/utility/Utils'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import {
    Edit,
    Edit3,
    FilePlus,
    FileText,
    HelpCircle,
    Plus,
    RefreshCcw,
    Trash2,
    User,
    UserCheck,
    UserPlus,
    Users,
    UserX
} from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'
import {
    Button,
    ButtonGroup,
    ButtonProps,
    CardFooter,
    Col,
    Form,
    InputGroupText,
    InputGroupTextProps,
    Label,
    NavItem,
    NavLink,
    Row
} from 'reactstrap'
import * as yup from 'yup'
import { useLoadRolesMutation } from '../../../redux/RTKQuery/RoleManagement'

import { Patterns } from '@src/utility/Const'
import UserFilter from '../../users/UserFilter'
import InvoiceFilter from '../InvoiceFilter'
import {
    useCreateOrUpdateInvoiceCheckMutation,
    useLoadInvoiceCheckMutation
} from '../../../redux/RTKQuery/InvoiceChecksRTK'
import { stat } from 'fs'

// validation schema
const userFormSchema = {
    //   package: yup
    //     .object({
    //       label: yup.string().required(),
    //       value: yup.string().required()
    //     })
    //     .nullable()
    //     .required('required'),
    //   vendor_name: yup
    //     .string()
    //     .required()
    //     // match alphabets and spaces only
    //     .matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces')),
    //   vendor_contact_email: yup.string().email().required(FM('email-must-be-a-valid-email')),
    //   description: yup.string().when({
    //     is: (values: string) => values?.length > 0,
    //     then: (schema) =>
    //       schema.matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces')),
    //     otherwise: (schema) => schema.notRequired()
    //   }),
    //invoice_number
    //   invoice_number: yup
    //     .string()
    //     .notRequired()
    //     .when({
    //       is: (values: string) => values?.length > 0,
    //       then: (schema) =>
    //         schema
    //           .min(5, FM('mobile-number-must-be-at-least-5-characters'))
    //           .max(244, FM('invoice-number-must-be-at-most-244-characters'))
    //           .required(),
    //       otherwise: (schema) => schema.notRequired()
    //     }),
    //   vendor_contact_number: yup
    //     .string()
    //     .notRequired()
    //     .test((value) => {
    //       if (value?.includes('-')) {
    //         return false
    //       } else {
    //         return true
    //       }
    //     })
    //     .when({
    //       is: (values: string) => values?.length > 0,
    //       then: (schema) =>
    //         schema
    //           .min(10, FM('mobile-number-must-be-at-least-10-characters'))
    //           .max(12, FM('mobile-number-must-be-at-most-12-characters'))
    //           .required(),
    //       otherwise: (schema) => schema.notRequired()
    //     })
    //   password: yup.string().when('id', {
    //     is: (values: string) => !isValid(values),
    //     then: (schema) => schema.required(),
    //     otherwise: (schema) => schema.notRequired()
    //   }),
    //   'confirm-password': yup.string().when('id', {
    //     is: (values: string) => !isValid(values),
    //     then: (schema) =>
    //       schema.required().oneOf([yup.ref('password'), null], FM('passwords-must-match')),
    //     otherwise: (schema) => schema.notRequired().oneOf([])
    //   })
}
// validate
const schema = yup.object(userFormSchema).required()

// states

type States = {
    page?: any
    per_page_record?: any
    filterData?: any
    reload?: any
    isAddingNewData?: boolean
    search?: string
    lastRefresh?: any
    selectedUser?: InvoiceCheksResponse
    enableEdit?: boolean
}

const defaultValues: InvoiceCheksResponse = {
    id: undefined,

    checks: [
        {
            check: undefined,
            value: undefined
        }
    ]
}

const Checklist = (props: any) => {
    // header menu context
    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    // user
    const user = useUser()
    const canAddChecklist = Can(Permissions.checklistAdd)
    const canEditChecklist = Can(Permissions.checklistEdit)
    const canViewChecklist = Can(Permissions.checklistRead)

    // form hook
    const form = useForm<any>({
        resolver: yupResolver(schema),
        defaultValues
    })

    const { fields, append, remove } = useFieldArray({
        control: form?.control,
        name: 'checks'
    })

    // toggle add modal
    const [modalAdd, toggleModalAdd] = useModal()
    // toggle view modal
    const [modalView, toggleModalView] = useModal()
    // create or update user mutation
    const [createInvoice, createInvoiceResponse] = useCreateOrUpdateInvoiceCheckMutation()
    // load users
    const [loadInvoice, loadInvoiceResponse] = useLoadInvoiceCheckMutation()

    // default states
    const initState: States = {
        page: 1,
        per_page_record: 20,
        filterData: undefined,
        search: '',
        enableEdit: false,
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

    // close view modal
    const closeViewModal = (reset = true) => {
        if (reset) {
            setState({
                selectedUser: undefined
            })
            form.reset()
        }
        toggleModalView()
    }

    // handle save user
    const handleSaveUser = (data: InvoiceCheksResponse) => {
        if (isValid(state.selectedUser?.id)) {
            createInvoice({
                jsonData: {
                    ...data,
                    id: state.selectedUser?.id,
                    check: data?.check,
                    value: data?.value === 1 ? 'required' : 'optional'
                }
            })
        } else {
            createInvoice({
                jsonData: {
                    ...data,
                    checks: data?.checks?.map((item) => {
                        return {
                            check: item?.check,
                            value: item?.value === 1 ? 'required' : 'optional'
                        }
                    })
                }
            })
        }
    }

    // load user list
    const loadUserList = () => {
        loadInvoice({
            page: state.page,
            per_page_record: state.per_page_record,
            jsonData: {
                name: !isValid(state.filterData) ? state.search : undefined,
                ...state.filterData
            }
        })
    }

    // handle user create response
    useEffect(() => {
        if (!createInvoiceResponse.isUninitialized) {
            if (createInvoiceResponse.isSuccess) {
                closeAddModal()
                loadUserList()
                // SuccessToast(FM('checklist-created-successfully'))
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
    }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

    // handle page change
    const handlePageChange = (e: TableFormData) => {
        setState({ ...e })
    }

    // handle filter data
    const handleFilterData = (e: any) => {
        setState({
            filterData: { ...e, role_id: e?.role_id?.value },
            page: 1,
            search: '',
            per_page_record: 20
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

    // create a menu on header
    //   useEffect(() => {
    //     if (!canAddChecklist) return
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
    //   }, [modalAdd, canAddChecklist])

    //aPPEND CHECK PARAMS
    useEffect(() => {
        if (fields?.length === 0) {
            append({})
        }
    }, [fields])

    // handle actions
    //   const handleActions = (ids?: any, action?: any, eventId?: any) => {
    //     if (isValidArray(ids)) {
    //       invoiceAction({
    //         ids,
    //         eventId,
    //         action
    //       })
    //     }
    //   }

    //   // handle action result
    //   useEffect(() => {
    //     if (invoiceActionResult?.isLoading === false) {
    //       if (invoiceActionResult?.isSuccess) {
    //         emitAlertStatus('success', null, invoiceActionResult?.originalArgs?.eventId)
    //       } else if (invoiceActionResult?.error) {
    //         emitAlertStatus('failed', null, invoiceActionResult?.originalArgs?.eventId)
    //       }
    //     }
    //   }, [invoiceActionResult])

    // open view modal
    useEffect(() => {
        if (isValid(state.selectedUser)) {
            setValues<InvoiceCheksResponse>(
                {
                    //   checks: JsonParseValidate(state?.selectedUser?.checks)?.map((item) => {
                    //     return {
                    //       param: item?.param,
                    //       status: item?.status === 'required' ? 1 : 0
                    //     }
                    //   })
                    check: state?.selectedUser?.check,
                    value: state?.selectedUser?.value === 'required' ? 1 : 0
                },
                form.setValue
            )
            if (!state.enableEdit) {
                toggleModalView()
            } else {
                toggleModalAdd()
            }
        }
    }, [state.selectedUser])

    //auto generate invoice_number
    // create user modal
    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modalAdd}
                done={state.enableEdit ? FM('edit') : FM('create')}
                modalClass={'modal-lg'}
                title={state.enableEdit ? FM('edit-checks') : FM('create-checklist')}
                handleModal={closeAddModal}
                loading={createInvoiceResponse.isLoading}
                handleSave={form.handleSubmit(handleSaveUser)}
            >
                <div className='p-2'>
                    <Hide IF={state.enableEdit === true}>
                        <Form onSubmit={form.handleSubmit(handleSaveUser)}>
                            {/* submit form on enter button!! */}
                            <button className='d-none'></button>
                            <Row>
                                <Label className='text-uppercase mb-1'>{FM('check-params')}</Label>
                                {fields.map((field, index) => (
                                    <>
                                        <Col md='12'>
                                            <Row className='g'>
                                                {/* <hr className='' /> */}

                                                <Col md='12' key={index}>
                                                    <FormGroupCustom
                                                        label={FM('check-params')}
                                                        name={`checks.${index}.check`}
                                                        type={'text'}
                                                        onRegexValidation={{
                                                            form: form,
                                                            fieldName: `checks.${index}.check`
                                                        }}
                                                        noLabel
                                                        className='mb-50'
                                                        prepend={
                                                            <>
                                                                <InputGroupText>#{index + 1}</InputGroupText>
                                                                <InputGroupText>
                                                                    <BsTooltip
                                                                        title={FM(
                                                                            'is-param-status-is-checked-it-means-that-this-param-is-required'
                                                                        )}
                                                                    >
                                                                        <FormGroupCustom
                                                                            control={form.control}
                                                                            placeholder={FM('check-value')}
                                                                            name={`checks.${index}.value`}
                                                                            tooltip={FM(
                                                                                'is-param-status-is-checked-it-means-that-this-param-is-required'
                                                                            )}
                                                                            noGroup
                                                                            noLabel
                                                                            type='checkbox'
                                                                            rules={{ required: false }}
                                                                            prepend={<InputGroupText>#{index + 1}</InputGroupText>}
                                                                        />
                                                                    </BsTooltip>
                                                                </InputGroupText>
                                                            </>
                                                        }
                                                        append={
                                                            <>
                                                                <BsTooltip<InputGroupTextProps>
                                                                    Tag={InputGroupText}
                                                                    role={'button'}
                                                                    className='btn-icon'
                                                                    title={FM('remove')}
                                                                    onClick={() => {
                                                                        remove(index)
                                                                    }}
                                                                >
                                                                    <Trash2 size={16} className='text-danger' />
                                                                </BsTooltip>

                                                                <Show IF={index === fields?.length - 1}>
                                                                    <BsTooltip<InputGroupTextProps>
                                                                        Tag={InputGroupText}
                                                                        title={FM('add-more')}
                                                                        role={'button'}
                                                                        className='btn-icon'
                                                                        onClick={() => {
                                                                            append({})
                                                                        }}
                                                                    >
                                                                        <Plus size={16} className='text-primary' />
                                                                    </BsTooltip>
                                                                </Show>
                                                            </>
                                                        }
                                                        control={form?.control}
                                                        rules={{ required: false }}
                                                    />
                                                </Col>
                                                {/* </Hide> */}
                                            </Row>
                                        </Col>
                                    </>
                                ))}
                            </Row>
                        </Form>
                    </Hide>
                    <Show IF={state.enableEdit === true}>
                        <Form>
                            <Col md='12'>
                                <FormGroupCustom
                                    label={FM('check-params')}
                                    name={`check`}
                                    type={'text'}

                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `check`
                                    }}
                                    noLabel
                                    className='mb-50'
                                    prepend={
                                        <>
                                            {/* <InputGroupText>#{index + 1}</InputGroupText> */}
                                            <InputGroupText>
                                                <BsTooltip
                                                    title={FM(
                                                        'is-param-status-is-checked-it-means-that-this-param-is-required'
                                                    )}
                                                >
                                                    <FormGroupCustom
                                                        control={form.control}
                                                        placeholder={FM('check-value')}
                                                        name={`value`}
                                                        tooltip={FM(
                                                            'is-param-status-is-checked-it-means-that-this-param-is-required'
                                                        )}
                                                        noGroup
                                                        noLabel
                                                        type='checkbox'
                                                        rules={{ required: false }}
                                                    />
                                                </BsTooltip>
                                            </InputGroupText>
                                        </>
                                    }
                                    control={form?.control}
                                    rules={{ required: false }}
                                />
                            </Col>
                        </Form>
                    </Show>
                </div>
            </CenteredModal>
        )
    }

    // view User modal
    const renderViewModal = () => {
        return (
            <CenteredModal
                open={modalView}
                title={state.selectedUser?.check}
                done='edit'
                hideClose
                hideSave={!canEditChecklist}
                handleSave={() => {
                    setState({
                        enableEdit: true
                    })
                    closeViewModal(false)
                    toggleModalAdd()
                }}
                handleModal={() => closeViewModal(true)}
            >
                <div className='p-2'>
                    <Row>
                        {JsonParseValidate(state.selectedUser?.checks)?.map((item) => {
                            return (
                                <>
                                    <Col md='9'>
                                        <span className=' mb-1  fw-bold text-capitalize'>
                                            {item?.param}
                                            <span className='text-danger'>{item?.status === 'required' ? '*' : ''}</span>
                                        </span>
                                    </Col>
                                    <Col md='2'>
                                        <span
                                            className={`mb-1  badge badge-pill badge-light-${item?.status === 'required'
                                                ? 'danger'
                                                : item?.status === 'optional'
                                                    ? 'success'
                                                    : 'dark'
                                                }`}
                                        >
                                            {item?.status === 'required' ? 'required' : 'optional'}
                                        </span>
                                    </Col>
                                    <hr />
                                </>
                            )
                        })}
                    </Row>
                </div>
            </CenteredModal>
        )
    }

    // table columns
    const columns: TableColumn<InvoiceCheksResponse>[] = [
        {
            name: FM('check'),

            id: 'name',
            cell: (row) => (
                <Fragment>
                    <BsTooltip
                        role={'button'}
                        title={FM('edit-checks')}
                        className={canViewChecklist ? 'text-primary' : 'pe-none'}
                        onClick={() => {
                            setState({
                                selectedUser: row,
                                enableEdit: true
                            })
                        }}
                    >
                        <>{row?.check}</>
                    </BsTooltip>
                </Fragment>
            )
        },
        {
            maxWidth: '15%',
            name: FM('value'),

            id: 'name',
            cell: (row) => (
                <Fragment>
                    {/* write span in badge class */}
                    <span
                        className={`badge badge-pill badge-light-${row?.value === 'required' ? 'danger' : 'primary'
                            }`}
                    >
                        {row?.value}
                    </span>
                </Fragment>
            )
        }
    ]

    log('selectedChecks', state.selectedUser)
    const onSuccessEvent = () => {
        reloadData()
    }
    //   const options: TableDropDownOptions = (selectedRows) => [
    //     {
    //       IF: canEditInvoice,
    //       noWrap: true,
    //       name: (
    //         <ConfirmAlert
    //           menuIcon={<UserCheck size={14} />}
    //           onDropdown
    //           eventId={`item-active`}
    //           text={FM('are-you-sure')}
    //           title={FM('active-selected-user', { count: selectedRows?.selectedCount })}
    //           onClickYes={() => {
    //             handleActions(selectedRows?.ids, 'active', 'item-active')
    //           }}
    //           onSuccessEvent={onSuccessEvent}
    //         >
    //           {FM('activate')}
    //         </ConfirmAlert>
    //       )
    //     },
    //     {
    //       IF: canEditInvoice,
    //       noWrap: true,
    //       name: (
    //         <ConfirmAlert
    //           menuIcon={<UserX size={14} />}
    //           onDropdown
    //           eventId={`item-inactive`}
    //           text={FM('are-you-sure')}
    //           title={FM('inactive-selected-user', { count: selectedRows?.selectedCount })}
    //           onClickYes={() => {
    //             handleActions(selectedRows?.ids, 'inactive', 'item-inactive')
    //           }}
    //           onSuccessEvent={onSuccessEvent}
    //         >
    //           {FM('inactivate')}
    //         </ConfirmAlert>
    //       )
    //     }
    //   ]
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
            {renderViewModal()}

            <Header route={props?.route} icon={<FileText size='25' />} title={FM('checklist')}>
                <ButtonGroup color='dark'>
                    {/* <InvoiceFilter handleFilterData={handleFilterData} /> */}
                    <Show IF={canAddChecklist}>
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
                            title={FM('create-checklist')}
                        >
                            <FilePlus size='14' className={'ficon ' + (modalAdd ? 'text-white' : '')} />
                            {/* <GetApp size='5px' /> */}
                        </BsTooltip>
                    </Show>
                    <LoadingButton
                        tooltip={FM('reload')}
                        loading={loadInvoiceResponse.isLoading}
                        size='sm'
                        color='info'
                        onClick={reloadData}
                    >
                        <RefreshCcw size='14' />
                    </LoadingButton>
                </ButtonGroup>
            </Header>
            <CustomDataTable<InvoiceCheksResponse>
                initialPerPage={20}
                isLoading={loadInvoiceResponse.isLoading}
                columns={columns}
                // options={options}
                // selectableRows={canEditInvoice || canDeleteInvoice}
                searchPlaceholder='search-invoice'
                onSort={handleSort}
                selectableRowDisabled={(row: any) => row?.id === user?.id}
                defaultSortField={loadInvoiceResponse?.originalArgs?.jsonData?.sort}
                paginatedData={loadInvoiceResponse?.data}
                handlePaginationAndSearch={handlePageChange}
            />
        </Fragment>
    )
}

export default Checklist
