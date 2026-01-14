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
import { ContractsResponse } from '@src/utility/types/typeAuthApi'
import {
    createConstSelectOptions,
    DesignationType,
    emitAlertStatus,
    FM,
    getKeyByValue,
    isValid,
    isValidArray,
    log,
    setInputErrors,
    setValues,
    SuccessToast
} from '@src/utility/Utils'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import {
    Briefcase,
    Edit,
    Edit3,
    FilePlus,
    RefreshCcw,
    Trash2,
    User,
    UserCheck,
    UserPlus,
    Users,
    UserX
} from 'react-feather'
import { useForm } from 'react-hook-form'
import {
    Badge,
    Button,
    ButtonGroup,
    ButtonProps,
    Col,
    Form,
    Label,
    NavItem,
    NavLink,
    Row
} from 'reactstrap'
import * as yup from 'yup'

import { Patterns, userType } from '@src/utility/Const'
import {
    useActionContractsMutation,
    useCreateOrUpdateContractsMutation,
    useLoadContractsMutation
} from '../../redux/RTKQuery/ContractRTK'

// validation schema
const userFormSchema = {
    contract_number: yup
        .string()
        .required()
        // match alphabets and spaces only
        .matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces')),
    description: yup.string().when({
        is: (values: string) => values?.length > 0,
        then: (schema) =>
            schema.matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces')),
        otherwise: (schema) => schema.notRequired()
    })
    //   epcms: yup
    //     .object({
    //       label: yup.string().required(),
    //       value: yup.string().required()
    //     })
    //     .nullable()
    //     .required('required')

    //   mobile_number: yup
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
    selectedUser?: ContractsResponse
    enableEdit?: boolean
}

const defaultValues: ContractsResponse = {
    contract_number: '',
    contractor_id: undefined,
    contract_type_id: undefined,
    package: '',
    epcms: undefined,
    created_at: '',
    description: '',
    user_id: '',
    id: undefined
}
const Contracts = (props: any) => {
    // header menu context
    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    // user
    const user = useUser()
    // can add user
    const canAddContract = Can(Permissions.contractAdd)
    // can edit user
    const canEditContract = Can(Permissions.contractEdit)
    // can delete user
    const canDeleteContract = Can(Permissions.contractDelete)

    // form hook
    const form = useForm<ContractsResponse>({
        resolver: yupResolver(schema),
        defaultValues
    })
    const {
        formState: { errors },
        handleSubmit,
        control,
        reset,
        setValue,
        watch
    } = form
    // toggle add modal
    const [modalAdd, toggleModalAdd] = useModal()
    // toggle view modal
    const [modalView, toggleModalView] = useModal()
    // create or update user mutation
    const [createContracts, createContractResponse] = useCreateOrUpdateContractsMutation()
    // load users
    const [loadContracts, loadContractResponse] = useLoadContractsMutation()
    // delete mutation
    const [contractAction, contractActionResult] = useActionContractsMutation()

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
    const handleSaveContract = (contractData: ContractsResponse) => {
        log('dddd', contractData)

        createContracts({
            jsonData: {
                ...contractData,
                contractor_id: contractData?.contractor_id?.value,
                contract_type_id: contractData?.contract_type_id?.value,
                package: contractData?.package?.value,
                epcms: contractData?.epcms?.value,
                user_id: user?.id
            }
        })
    }

    // load user list
    const loadContractList = () => {
        loadContracts({
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
        if (!createContractResponse.isUninitialized) {
            if (createContractResponse.isSuccess) {
                closeAddModal()
                loadContractList()
                // SuccessToast(FM('contract-created-successfully'))
            } else if (createContractResponse.isError) {
                // handle error
                const errors: any = createContractResponse.error
                log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createContractResponse])

    // handle pagination and load list
    useEffect(() => {
        loadContractList()
    }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

    // handle page change
    const handlePageChange = (e: TableFormData) => {
        setState({ ...e })
    }

    // handle filter data
    const handleFilterData = (e: any) => {
        setState({
            filterData: { ...e, role_id: e?.role_id?.value, user_type: e?.user_type?.value },
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

    //   // create a menu on header
    //   useEffect(() => {
    //     if (!canAddContract) return
    //     setHeaderMenu(
    //       <>
    //         <NavItem className=''>
    //           <BsTooltip title={FM('create-contract')}>
    //             <NavLink className='' onClick={toggleModalAdd}>
    //               <FilePlus className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
    //             </NavLink>
    //           </BsTooltip>
    //         </NavItem>
    //       </>
    //     )
    //     return () => {
    //       setHeaderMenu(null)
    //     }
    //   }, [modalAdd, canAddContract])

    // handle actions
    const handleActions = (ids?: any, action?: any, eventId?: any) => {
        if (isValidArray(ids)) {
            contractAction({
                ids,
                eventId,
                action
            })
        }
    }

    // handle action result
    useEffect(() => {
        if (contractActionResult?.isLoading === false) {
            if (contractActionResult?.isSuccess) {
                emitAlertStatus('success', null, contractActionResult?.originalArgs?.eventId)
            } else if (contractActionResult?.error) {
                emitAlertStatus('failed', null, contractActionResult?.originalArgs?.eventId)
            }
        }
    }, [contractActionResult])

    // open view modal
    useEffect(() => {
        if (isValid(state.selectedUser)) {
            setValues<ContractsResponse>(
                {
                    ...state.selectedUser,
                    epcms: {
                        label: state.selectedUser?.contract_epcms[0]?.epcm?.name,
                        value: state.selectedUser?.contract_epcms[0]?.epcm?.id
                    },
                    contractor_id: {
                        label: state.selectedUser?.contractor?.name,
                        value: state.selectedUser?.contractor?.id
                    },
                    contract_type_id: {
                        label: state.selectedUser?.contract_type?.contract_type,
                        value: state.selectedUser?.contract_type?.id
                    },
                    package: {
                        label: state.selectedUser?.package,
                        value: state.selectedUser?.package
                    }
                },
                form.setValue
            )
            if (!state.enableEdit) {
                toggleModalView()
            } else {
                toggleModalAdd()
            }
        }
    }, [state.selectedUser, state.enableEdit])

    log('sleceted contract', state.selectedUser)

    // create user modal
    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modalAdd}
                done={state.enableEdit ? 'save' : 'save'}
                title={state.enableEdit ? FM('edit') : FM('create-contract')}
                handleModal={closeAddModal}
                loading={createContractResponse.isLoading}
                handleSave={form.handleSubmit(handleSaveContract)}
            >
                <div className='p-2'>
                    <Form onSubmit={form.handleSubmit(handleSaveContract)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('contract-number')}
                                    name='contract_number'
                                    type='text'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `contract_number`
                                    }}
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    async
                                    label={FM('epcm')}
                                    name='epcms'
                                    isClearable
                                    loadOptions={loadDropdown}
                                    path={ApiEndpoints.global_user}
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
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('contractors')}
                                    name='contractor_id'
                                    type='select'
                                    async
                                    isClearable
                                    loadOptions={loadDropdown}
                                    path={ApiEndpoints.global_user}
                                    selectLabel={(e) => e?.name}
                                    selectValue={(e) => e.id}
                                    jsonData={{
                                        user_type: userType.contractor
                                    }}
                                    // searchResponse={state?.responseChecklist?.check_group}
                                    defaultOptions
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('contract-type')}
                                    name='contract_type_id'
                                    type='select'
                                    async
                                    isClearable
                                    loadOptions={loadDropdown}
                                    path={ApiEndpoints.loadContractType}
                                    selectLabel={(e) => e?.contract_type}
                                    selectValue={(e) => e.id}
                                    // searchResponse={state?.responseChecklist?.check_group}
                                    defaultOptions
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    async
                                    label={FM('package')}
                                    name='package'
                                    isClearable
                                    loadOptions={loadDropdown}
                                    path={ApiEndpoints.loadPackage}
                                    //   selectLabel={(e) => `${e.epcm_id} `}
                                    selectLabel={(e) => `${e.name} `}
                                    selectValue={(e) => e.name}
                                    defaultOptions
                                    //   jsonData={{
                                    //     role_id: 3
                                    //   }}
                                    type='select'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('description')}
                                    name='description'
                                    type='textarea'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `description`
                                    }}
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

    // view User modal
    const renderViewModal = () => {
        return (
            <CenteredModal
                open={modalView}
                title={state.selectedUser?.contract_number}
                done='edit'
                hideClose
                hideSave={!canAddContract}
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
                    <Row className='align-items-center mb-1'>
                        <Col md='1'>
                            <User size={35} />
                        </Col>
                        <Col md='8'>
                            <p className='text-dark mb-0'>{FM('epcm-details')}</p>
                            <p className='text-muted small mb-0'>{FM('edit-description')}</p>
                        </Col>
                    </Row>
                    {state.selectedUser?.contract_epcms?.map((e, i) => {
                        return (
                            <>
                                <Row>
                                    <Col md='4'>
                                        <Label className='text-uppercase mb-25'>{FM('name')}</Label>
                                        <p className='text-dark fw-bold text-capitalize'>
                                            {e?.epcm?.name ?? 'N/A'}
                                            {/* <span className='text-dark fw-bold text-capitalize small ms-50'>
                  <span
                    className={state.selectedUser?.status === 1 ? 'text-success' : 'text-danger'}
                  >
                    ({state.selectedUser?.status === 1 ? FM('active') : FM('inactive')})
                  </span>
                </span> */}
                                        </p>
                                    </Col>
                                    <Col md='4'>
                                        <Label className='text-uppercase mb-25'>{FM('email')}</Label>
                                        <p className='text-dark fw-bold text-capitalize'>{e?.epcm?.email ?? 'N/A'}</p>
                                    </Col>
                                    <Col md='4'>
                                        <Label className='text-uppercase mb-25'>{FM('mobile-number')}</Label>
                                        <p className='text-dark fw-bold text-capitalize'>
                                            {e?.epcm?.mobile_number ?? 'N/A'}
                                        </p>
                                    </Col>
                                    <hr />
                                </Row>
                            </>
                        )
                    })}
                </div>
            </CenteredModal>
        )
    }

    // table columns
    const columns: TableColumn<ContractsResponse>[] = [
        {
            name: FM('contract-number'),

            id: 'contract_number',
            cell: (row) => (
                <Fragment>
                    <span
                        role={'button'}
                        onClick={() => {
                            setState({
                                selectedUser: row
                            })
                        }}
                        className='text-primary'
                    >
                        {row?.contract_number}
                    </span>
                </Fragment>
            )
        },
        {
            name: FM('name'),

            id: 'name',
            cell: (row) => <Fragment>{row?.contractor?.name}</Fragment>
        },
        {
            name: FM('email'),

            id: 'email',
            cell: (row) => <Fragment>{row?.contractor?.email}</Fragment>
        },
        {
            name: FM('mobile-number'),

            id: 'contact-number',
            cell: (row) => <Fragment>{row?.contractor?.mobile_number}</Fragment>
        },
        {
            name: FM('package'),

            id: 'package',
            cell: (row) => <Fragment>{row?.package}</Fragment>
        },
        {
            name: FM('description'),

            id: 'description',
            cell: (row) => <Fragment>{row?.description}</Fragment>
        },
        {
            name: FM('epcm'),
            id: 'no-of-epcms',
            cell: (row) => (
                <Fragment>
                    {row?.contract_epcms?.map((e, i) => {
                        return <>{e?.epcm?.name ?? 'N/A'}</>
                    })}
                </Fragment>
            )
        },

        {
            maxWidth: '10px',
            name: FM('action'),
            cell: (row) => (
                <Fragment>
                    <DropDownMenu
                        options={[
                            //   {
                            //     IF: canDeleteUser,
                            //     noWrap: true,
                            //     name: (
                            //       <ConfirmAlert
                            //         menuIcon={<Trash2 size={14} />}
                            //         onDropdown
                            //         eventId={`item-delete-${row?.id}`}
                            //         text={FM('are-you-sure')}
                            //         title={FM('delete-item', { name: row?.name })}
                            //         onClickYes={() => {
                            //           handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                            //         }}
                            //         onSuccessEvent={onSuccessEvent}
                            //       >
                            //         {FM('delete')}
                            //       </ConfirmAlert>
                            //     )
                            //   },
                            {
                                IF: canEditContract,
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
                                IF: canDeleteContract,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<Trash2 size={14} />}
                                        onDropdown
                                        eventId={`item-delete-${row?.id}`}
                                        text={FM('are-you-sure')}
                                        title={FM('delete-item', { name: row?.contract_number })}
                                        onClickYes={() => {
                                            handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('delete')}
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
    // handle sort
    const handleSort = (column: any, dir: string) => {
        setState({
            filterData: {
                ...state.filterData,
                sort: {
                    column: column?.id,
                    dir:
                        loadContractResponse?.originalArgs?.jsonData?.sort?.column === column?.id
                            ? loadContractResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

            <Header route={props?.route} icon={<Briefcase size='25' />} title={FM('contracts')}>
                <ButtonGroup color='dark'>
                    <Show IF={canAddContract}>
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
                            title={FM('create-contract')}
                        >
                            <FilePlus size='14' className={'ficon ' + (modalAdd ? 'text-white' : '')} />
                            {/* <GetApp size='5px' /> */}
                        </BsTooltip>
                    </Show>
                    {/* <UserFilter handleFilterData={handleFilterData} /> */}
                    <LoadingButton
                        tooltip={FM('reload')}
                        loading={loadContractResponse.isLoading}
                        size='sm'
                        color='info'
                        onClick={reloadData}
                    >
                        <RefreshCcw size='14' />
                    </LoadingButton>
                </ButtonGroup>
            </Header>
            <CustomDataTable<ContractsResponse>
                initialPerPage={20}
                isLoading={loadContractResponse.isLoading}
                columns={columns}
                searchPlaceholder='search'
                onSort={handleSort}
                // selectableRowDisabled={(row: any) => row?.id === user?.id}
                defaultSortField={loadContractResponse?.originalArgs?.jsonData?.sort}
                paginatedData={loadContractResponse?.data}
                handlePaginationAndSearch={handlePageChange}
            />
        </Fragment>
    )
}

export default Contracts
