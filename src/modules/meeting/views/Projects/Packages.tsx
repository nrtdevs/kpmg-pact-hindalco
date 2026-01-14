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
import { CheckCircle, Edit, FilePlus, FileText, PieChart, RefreshCcw, Trash2 } from 'react-feather'
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
import { PackageResponse, ProjectResponse } from '@src/utility/types/typeAuthApi'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { useForm } from 'react-hook-form'
import {
    useCreateOrUpdatePackageMutation,
    useDeletePackageMutation,
    useLoadPackageMutation
} from '../../redux/RTKQuery/PackageRTK'
import { stateReducer } from '@src/utility/stateReducer'
import { TableColumn } from 'react-data-table-component'

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
    selectedUser?: PackageResponse
    verifyData?: PackageResponse
    selectedRowsCount?: any
    enableEdit?: boolean
}

const defaultValues: PackageResponse = {
    id: undefined,
    name: undefined,
    description: undefined,
    created_at: undefined,
    updated_at: undefined,
    status: undefined
}
const Packages = (props: any) => {
    // header menu context
    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    // user
    const user = useUser()
    // can add project
    const canAddPackage = Can(Permissions.packageAdd)
    const navigation = useNavigate()
    // can edit project
    const canEditPackage = Can(Permissions.packageEdit)
    // can delete project
    const canDeletePackage = Can(Permissions.packageDelete)
    // can view project
    const canView = Can(Permissions.packageRead)

    // form hook
    const form = useForm<PackageResponse>({
        resolver: yupResolver(schema),
        defaultValues
    })

    // toggle add modal
    const [modalAdd, toggleModalAdd] = useModal()
    const [rejectModal, toggleRejectModal] = useModal()
    const [verifyModal, toggleVerifyModal] = useModal()
    // toggle view modal
    const [modalView, toggleModalView] = useModal()
    // create and update Package mutation
    const [createPackage, createPackageResponse] = useCreateOrUpdatePackageMutation()
    // delete Package mutation
    const [deletePackage, deletePackageResponse] = useDeletePackageMutation()
    // load Package mutation
    const [loadPackage, loadPackageResponse] = useLoadPackageMutation()
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
    const handleSaveUser = (data: PackageResponse) => {
        createPackage({
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
    const packageList = () => {
        loadPackage({
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
        if (!createPackageResponse.isUninitialized) {
            if (createPackageResponse.isSuccess) {
                closeAddModal()
                packageList()
                // SuccessToast(FM('package-created-successfully'))
            } else if (createPackageResponse.isError) {
                // handle error
                const errors: any = createPackageResponse.error
                //   log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createPackageResponse])
    const onSuccessEvent = () => {
        reloadData()
    }
    // handle pagination and load list
    useEffect(() => {
        packageList()
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
            deletePackage({
                ids,
                eventId,
                action
            })
        }
    }

    //   useEffect(() => {
    //     if (!canAddPackage) return
    //     setHeaderMenu(
    //       <>
    //         <NavItem className=''>
    //           <BsTooltip title={FM('create-package')}>
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
    //   }, [modalAdd, canAddPackage])

    // handle action result
    useEffect(() => {
        if (
            (deletePackageResponse.status = QueryStatus?.fulfilled) &&
            deletePackageResponse?.isLoading === false
        ) {
            if (deletePackageResponse?.isSuccess) {
                emitAlertStatus('success', null, deletePackageResponse?.originalArgs?.eventId)
            } else if (deletePackageResponse?.error) {
                emitAlertStatus('failed', null, deletePackageResponse?.originalArgs?.eventId)
            }
        }
    }, [deletePackageResponse])

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
                title={state.enableEdit ? FM('edit-package') : FM('create-package')}
                handleModal={closeAddModal}
                loading={createPackageResponse.isLoading}
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

    const columns: TableColumn<ProjectResponse>[] = [
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
                                IF: canEditPackage,
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
                            // {
                            //     IF: canDeletePackage,
                            //     noWrap: true,
                            //     name: (
                            //         <ConfirmAlert
                            //             menuIcon={<Trash2 size={14} />}
                            //             onDropdown
                            //             eventId={`item-delete-${row?.id}`}
                            //             text={FM('are-you-sure')}
                            //             title={FM('delete-item', { name: row?.name })}
                            //             onClickYes={() => {
                            //                 handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                            //             }}
                            //             onSuccessEvent={onSuccessEvent}
                            //         >
                            //             {FM('delete')}
                            //         </ConfirmAlert>
                            //     )
                            // }
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
                        loadPackageResponse?.originalArgs?.jsonData?.sort?.column === column?.id
                            ? loadPackageResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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
                icon={<PieChart size='25' />}
                title={FM('package')}
                goBack={true}
                onClickBack={() => navigation(-1)}
            >
                <ButtonGroup color='dark'>
                    {/* <InvoiceFilter handleFilterData={handleFilterData} /> */}
                    <Show IF={canAddPackage}>
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
                            title={FM('create-package')}
                        >
                            <FilePlus size='14' className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
                            {/* <GetApp size='5px' /> */}
                        </BsTooltip>
                    </Show>
                    <LoadingButton
                        tooltip={FM('reload')}
                        loading={loadPackageResponse.isLoading}
                        size='sm'
                        color='info'
                        onClick={reloadData}
                    >
                        <RefreshCcw size='14' />
                    </LoadingButton>
                </ButtonGroup>
            </Header>
            <CustomDataTable<PackageResponse>
                initialPerPage={20}
                isLoading={loadPackageResponse.isLoading}
                columns={columns}
                // options={options}
                // selectableRows={canAddAction && user?.role_id !== 3}
                searchPlaceholder='search-package'
                onSort={handleSort}
                // selectableRowDisabled={(row: any) => row?.id === user?.id}
                defaultSortField={loadPackageResponse?.originalArgs?.jsonData?.sort}
                paginatedData={loadPackageResponse?.data}
                handlePaginationAndSearch={handlePageChange}
            />
        </Fragment>
    )
}

export default Packages
