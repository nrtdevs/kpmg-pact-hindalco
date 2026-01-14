import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser'
import { QueryStatus } from '@reduxjs/toolkit/dist/query'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import { Patterns } from '@src/utility/Const'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import {
    FM,
    SuccessToast,
    emitAlertStatus,
    isValid,
    isValidArray,
    setInputErrors,
    truncateText
} from '@src/utility/Utils'
import CustomDataTable, {
    TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import { Button, ButtonGroup, ButtonProps, Col, Form, NavItem, NavLink, Row } from 'reactstrap'
import BsTooltip from '@src/modules/common/components/tooltip'
import { CheckCircle, Edit, FilePlus, FileText, PauseCircle, RefreshCcw, Trash2 } from 'react-feather'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { t } from 'i18next'
import DropDownMenu from '@src/modules/common/components/dropdown'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import Header from '@src/modules/common/components/header'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import { Link, useNavigate } from 'react-router-dom'
import { getPath } from '@src/router/RouteHelper'
import * as yup from 'yup'
import { HindranceTypeResponse } from '@src/utility/types/typeAuthApi'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { useForm } from 'react-hook-form'

import { stateReducer } from '@src/utility/stateReducer'
import { TableColumn } from 'react-data-table-component'
import {
    useCreateOrUpdateHindranceTypeMutation,
    useDeleteHindranceTypeMutation,
    useLoadHindranceTypeMutation
} from '../../redux/RTKQuery/HindranceTypeRTK'

const projectFormSchema = {
    name: yup
        .string()
        .required()
        // match alphabets and spaces only
        .matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces'))
    //   projectId: yup
    //     .string()
    //     .required()
    //     // match alphabets and spaces only
    //     .matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces'))
    //   description: yup.string().when({
    //     is: (values: string) => values?.length > 0,
    //     then: (schema) =>
    //       schema.matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces')),
    //     otherwise: (schema) => schema.notRequired()
    //   })
}

// validate
const schema = yup.object(projectFormSchema).required()

type States = {
    page?: any
    per_page_record?: any
    enalbleVerify?: boolean

    enableReject?: boolean
    filterData?: any
    reload?: any
    isAddingNewData?: boolean
    search?: string
    lastRefresh?: any
    selectedUser?: HindranceTypeResponse
    verifyData?: HindranceTypeResponse
    selectedRowsCount?: any
    enableEdit?: boolean
}

const defaultValues: HindranceTypeResponse = {
    id: undefined,
    name: undefined,
    description: undefined,
    created_at: undefined,
    updated_at: undefined,
    status: undefined
}
const HindranceType = (props: any) => {
    // header menu context
    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    // user
    const user = useUser()
    // can add project
    const canAddHindranceType = Can(Permissions.hindranceTypeAdd)
    // can edit project
    const canEditHindranceType = Can(Permissions.hindranceTypeEdit)
    // can delete project
    const canDeleteHindranceType = Can(Permissions.hindranceTypeDelete)
    // can view project
    const canView = Can(Permissions.hindranceTypeRead)

    // form hook
    const form = useForm<HindranceTypeResponse>({
        resolver: yupResolver(schema),
        defaultValues
    })

    // toggle add modal
    const navigation = useNavigate()
    const [modalAdd, toggleModalAdd] = useModal()
    const [rejectModal, toggleRejectModal] = useModal()
    const [verifyModal, toggleVerifyModal] = useModal()
    // toggle view modal
    const [modalView, toggleModalView] = useModal()
    // create and update HindranceType mutation
    const [createHindranceType, createHindranceTypeResponse] =
        useCreateOrUpdateHindranceTypeMutation()
    // delete HindranceType mutation
    const [deleteHindranceType, deleteHindranceTypeResponse] = useDeleteHindranceTypeMutation()
    // load HindranceType mutation
    const [loadHindranceType, loadHindranceTypeResponse] = useLoadHindranceTypeMutation()
    // default states
    const initState: States = {
        page: 1,
        per_page_record: 20,
        filterData: undefined,
        search: '',
        enableEdit: false,
        selectedRowsCount: undefined,
        enalbleVerify: false,
        enableReject: false,
        lastRefresh: new Date().getTime()
    }

    // state reducer
    const reducers = stateReducer<States>
    // state
    const [state, setState] = useReducer(reducers, initState)

    const closeVerifyModal = () => {
        setState({
            enalbleVerify: false
        })
        form.reset()
        toggleVerifyModal()
    }

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
        setState({
            enableReject: false
        })
        form.reset()
        toggleRejectModal()
    }

    // handle save user
    const handleSaveUser = (data: HindranceTypeResponse) => {
        createHindranceType({
            jsonData: {
                ...state?.selectedUser,
                ...data,
                id: isValid(state?.selectedUser?.id) ? state?.selectedUser?.id : undefined
                // owner_id: data?.owner_id?.value,
                // invoice_check_id: data?.invoice_check_id?.value,
                // epcm_id: data?.epcm_id?.value,
                // status: isValid(data?.status) ? data?.status : 'pending'
            }
        })
    }

    // handle Package list
    const hindranceTypeList = () => {
        loadHindranceType({
            page: state.page,
            per_page_record: state.per_page_record,
            jsonData: {
                name: !isValid(state.filterData) ? state.search : undefined,
                ...state.filterData
            }
        })
    }
    // handle project create response
    useEffect(() => {
        if (!createHindranceTypeResponse.isUninitialized) {
            if (createHindranceTypeResponse.isSuccess) {
                closeAddModal()
                hindranceTypeList()
                // SuccessToast(FM('hindranceType-created-successfully'))
            } else if (createHindranceTypeResponse.isError) {
                // handle error
                const errors: any = createHindranceTypeResponse.error
                //   log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createHindranceTypeResponse])
    const onSuccessEvent = () => {
        reloadData()
    }
    // handle pagination and load list
    useEffect(() => {
        hindranceTypeList()
    }, [
        state.page,
        state.search,
        state.per_page_record,
        state.filterData,
        state.lastRefresh
        // invoiceActionResult?.isSuccess
    ])

    const handlePageChange = (e: TableFormData) => {
        setState({ ...e })
    }

    // handle filter data
    const handleFilterData = (e: any) => {
        setState({
            filterData: { ...e },
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

    // handle actions
    const handleActions = (ids?: any, action?: any, eventId?: any) => {
        if (isValidArray(ids)) {
            deleteHindranceType({
                ids,
                eventId,
                action
            })
        }
    }

    //   useEffect(() => {
    //     if (!canAddHindranceType) return
    //     setHeaderMenu(
    //       <>
    //         <NavItem className=''>
    //           <BsTooltip title={FM('create-hindrance-type')}>
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
    //   }, [modalAdd, canAddHindranceType])

    // handle action result
    useEffect(() => {
        if (
            (deleteHindranceTypeResponse.status = QueryStatus?.fulfilled) &&
            deleteHindranceTypeResponse?.isLoading === false
        ) {
            if (deleteHindranceTypeResponse?.isSuccess) {
                emitAlertStatus('success', null, deleteHindranceTypeResponse?.originalArgs?.eventId)
            } else if (deleteHindranceTypeResponse?.error) {
                emitAlertStatus('failed', null, deleteHindranceTypeResponse?.originalArgs?.eventId)
            }
        }
    }, [deleteHindranceTypeResponse])

    useEffect(() => {
        if (state.enableEdit) {
            form.setValue('name', state?.selectedUser?.name)
            form.setValue('description', state?.selectedUser?.description)
        }
    }, [state.enableEdit])

    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modalAdd}
                done={state.enableEdit ? 'save' : 'save'}
                modalClass={'modal-sm'}
                title={state.enableEdit ? FM('edit-hindrance-type') : FM('create-hindrance-type')}
                handleModal={closeAddModal}
                loading={createHindranceTypeResponse.isLoading}
                handleSave={form.handleSubmit(handleSaveUser)}
            >
                <div className='p-2'>
                    <Form onSubmit={form.handleSubmit(handleSaveUser)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            <Col md='12'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.name}`}
                                    control={form.control}
                                    label={FM('name')}
                                    name='name'
                                    type='text'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'name'
                                    }}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='12'>
                                <FormGroupCustom
                                    key={`${state?.selectedUser?.description}`}
                                    control={form.control}
                                    label={FM('description')}
                                    name='description'
                                    //   isDisabled={isValid(state?.selectedUser?.description)}
                                    type='textarea'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'description'
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

    const columns: TableColumn<HindranceTypeResponse>[] = [
        {
            name: FM('name'),
            id: 'name',
            cell: (row) => (
                <Fragment>
                    {/* <Link
               state={{ ...row }}
               to={getPath('project.view', { id: row?.id })}
               role={'button'}
               className={canView ? 'text-primary' : 'pe-none'}
             > */}
                    {truncateText(row?.name, 50)}
                    {/* </Link> */}
                </Fragment>
            )
        },

        {
            name: FM('description'),

            id: 'description',
            cell: (row) => (
                <Fragment>
                    <div className='text-wrap'>{truncateText(row?.description, 80)}</div>
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
                                IF: canEditHindranceType,
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
                                IF: canDeleteHindranceType,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<Trash2 size={14} />}
                                        onDropdown
                                        eventId={`item-delete-${row?.id}`}
                                        text={FM('are-you-sure')}
                                        title={FM('delete-item', { name: row?.name })}
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
    const handleSort = (column: any, dir: string) => {
        setState({
            filterData: {
                ...state.filterData,
                sort: {
                    column: column?.id,
                    dir:
                        loadHindranceTypeResponse?.originalArgs?.jsonData?.sort?.column === column?.id
                            ? loadHindranceTypeResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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
            <Header
                route={props?.route}
                icon={<PauseCircle size='25' />}
                title={FM('hindrance-type')}
                goBack={true}
                onClickBack={() => navigation(-1)}
            >
                <ButtonGroup color='dark'>
                    {/* <InvoiceFilter handleFilterData={handleFilterData} /> */}
                    <Show IF={canAddHindranceType}>
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
                            title={FM('create-hindrance-type')}
                        >
                            <FilePlus size='14' className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
                            {/* <GetApp size='5px' /> */}
                        </BsTooltip>
                    </Show>
                    <LoadingButton
                        tooltip={FM('reload')}
                        loading={loadHindranceTypeResponse.isLoading}
                        size='sm'
                        color='info'
                        onClick={reloadData}
                    >
                        <RefreshCcw size='14' />
                    </LoadingButton>
                </ButtonGroup>
            </Header>
            <CustomDataTable<HindranceTypeResponse>
                initialPerPage={20}
                isLoading={loadHindranceTypeResponse.isLoading}
                columns={columns}
                // options={options}
                // selectableRows={canAddAction && user?.role_id !== 3}
                searchPlaceholder='search-hindrance-type'
                onSort={handleSort}
                // selectableRowDisabled={(row: any) => row?.id === user?.id}
                defaultSortField={loadHindranceTypeResponse?.originalArgs?.jsonData?.sort}
                paginatedData={loadHindranceTypeResponse?.data}
                handlePaginationAndSearch={handlePageChange}
            />
        </Fragment>
    )
}

export default HindranceType
