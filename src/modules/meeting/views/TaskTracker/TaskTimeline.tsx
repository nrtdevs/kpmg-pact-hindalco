import { stateReducer } from '@src/utility/stateReducer'
import React, { useEffect, useReducer } from 'react'
import { useTaskTimelineMutation, useTaskTrackerMutation } from '../../redux/RTKQuery/AppSettingRTK'
import { TableColumn } from 'react-data-table-component'
import { FM, createConstSelectOptions, formatDate, isValid, log, truncateText, userType } from '@src/utility/Utils'
import CustomDataTable, { TableFormData } from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import { useLoadActionsMutation } from '../../redux/RTKQuery/ActionMangement'
import useUser from '@hooks/useUser'
import { ActionItem } from '@src/utility/types/typeMeeting'
import { getPath } from '@src/router/RouteHelper'
import { Link } from 'react-router-dom'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import { Badge, Col, Form, Row } from 'reactstrap'
import KeyboardDoubleArrowUp from '@mui/icons-material/KeyboardDoubleArrowUp'
import KeyboardDoubleArrowDown from '@mui/icons-material/KeyboardDoubleArrowDown'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useForm } from 'react-hook-form'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import { priorityType, roleIds } from '@src/utility/Const'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { RefreshCcw } from 'react-feather'
import Hide from '@src/utility/Hide'

type theProps = {
    loading?: any
    filterTransaction?: boolean
    filterMonthly?: boolean
    filterTimeline?: boolean
    tabIndex?: any
    closeForm: () => void
}

interface States {
    page?: any
    per_page_record?: any
    changeObject?: any
    search?: any
    reload?: any
    reportData?: any
    isRemoving?: boolean
    isReloading?: boolean
    isAddingNewData?: boolean
    transactionFilter?: boolean
    filterData?: any
    lastRefresh?: any
}

// export type ActionItem = {
//     id?: string
//     task?: any
//     description?: any
//     meeting?: any
//     status?: any
//     priority?: any
//     created_on?: any
//     created_by?: any
//     assigned_on?: any
//     assigned_to?: any
//     due_date?: any
// }

const defaultValues: ActionItem = {
    task: null,
    comment: '',
    mm_ref_id: '',
    due_date: '',
    owner_id: '',
    priority: '',
    status: ''
}

const TaskTimeline = ({
    loading = null,
    filterMonthly = false,
    filterTransaction = false,
    filterTimeline = false,
    tabIndex = null,
    closeForm = () => { }
}: theProps) => {
    // Local States
    const initState: States = {
        page: 1,
        lastRefresh: new Date().getTime(),
        per_page_record: 15,
        reportData: [],
        changeObject: null,
        transactionFilter: false,
        filterData: undefined,
        search: undefined,
        isRemoving: false,
        isReloading: false,
        isAddingNewData: false
    }
    const reducers = stateReducer<States>
    const [state, setState] = useReducer(reducers, initState)
    const user = useUser()
    const form = useForm<ActionItem>()
    const { handleSubmit, control, reset, setValue, watch, clearErrors } = form

    // user hook
    // check read permission
    const canView = Can(Permissions.meetingRead)
    const canList = Can(Permissions.meetingBrowse)
    // load data mutation
    const [loadTasks, resultTask] = useTaskTimelineMutation()

    // load meeting list
    const loadMeetingList = () => {
        if (roleIds.client === user?.roles?.id) {
            if (isValid(state.filterData)) {
                loadTasks({
                    page: state.page,
                    per_page_record: state.per_page_record,
                    jsonData: {
                        task: !isValid(state.filterData) ? state.search : undefined,
                        ...state.filterData,
                        priority: state?.filterData?.priority?.value ?? undefined,
                        meeting_id: state?.filterData?.meeting_id?.value ?? undefined,
                        //owner_id: roleIds.client === user?.roles?.id ? user?.id : isValid(state?.filterData) ? state?.filterData?.owner_id?.value : undefined
                    }
                })
            } else {
                loadTasks({
                    page: state.page,
                    per_page_record: state.per_page_record,
                    jsonData: {
                        // task: !isValid(state.filterData) ? state.search : undefined,
                        // ...state.filterData,
                        // priority: state?.filterData?.priority?.value ?? undefined,
                        // meeting_id: state?.filterData?.meeting_id?.value ?? undefined,
                        owner_id: roleIds.client === user?.roles?.id ? user?.id : undefined
                    }
                })
            }

        } else {
            loadTasks({
                page: state.page,
                per_page_record: state.per_page_record,
                jsonData: {
                    task: !isValid(state.filterData) ? state.search : undefined,
                    ...state.filterData,
                    priority: state?.filterData?.priority?.value ?? undefined,
                    meeting_id: state?.filterData?.meeting_id?.value ?? undefined,
                    owner_id: state.filterData?.owner_id ?? undefined
                }
            })
        }
    }
    // handle pagination and load list
    useEffect(() => {
        if (tabIndex === '2') {
            loadMeetingList()
        }
    }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh, user, tabIndex])


    const handlePageChange = (e: TableFormData) => {
        setState({ ...e })
    }
    const renderPriority = (row: any) => {
        switch (row?.priority) {
            case 'high':
                return <Badge color='danger' className='text-uppercase'><KeyboardDoubleArrowUp fontSize='large' /> {row?.priority}</Badge>
            case 'medium':
                return <Badge color='warning' className='text-uppercase'><KeyboardDoubleArrowUp fontSize='large' /> {row?.priority}</Badge>
            case 'low':
                return <Badge color='success' className='text-uppercase'><KeyboardDoubleArrowDown fontSize='large' />{row?.priority}</Badge>

        }
    }

    const onSubmit = (d: any) => {
        setState({
            filterData: {
                ...d,
                task_id: d?.task_id?.value,
                owner_id: d?.owner_id?.value
            }
        })
    }

    const renderStatus = (row: any) => {
        switch (row?.status) {
            case 'pending':
                return <Badge color='dark' className='text-uppercase'>{row?.status}</Badge>
            case 'in_progress':
                return <Badge color='primary' className='text-uppercase'>{FM('in-progress')}</Badge>
            case 'on_hold':
                return <Badge color='warning' className='text-uppercase'>{FM('on-hold')}</Badge>
            case 'cancelled':
                return <Badge color='danger' className='text-uppercase'>{row?.status}</Badge>
            case 'completed':
                return <Badge color='success' className='text-uppercase'>{row?.status}</Badge>
            case 'verified':
                return <Badge color='success' className='text-uppercase'>{row?.status}</Badge>
        }
    }

    // handle filter data
    const handleFilterData = (e: any) => {
        setState({
            filterData: {
                ...e,
                owner_id: e?.owner_id?.value,
                status: e?.status?.value,
                priority: e?.priority?.value
            },
            page: 1,
            search: '',
            per_page_record: 10
        })
    }


    // reload Data
    const reloadData = () => {
        setState({
            page: 1,
            search: '',
            filterData: undefined,
            per_page_record: 10,
            lastRefresh: new Date().getTime()
        })
    }

    // handle sort
    // const handleSort = (column: any, dir: string) => {
    //     setState({
    //         filterData: {
    //             ...state.filterData,
    //             sort: {
    //                 column: column?.id,
    //                 dir:
    //                     loadActionResponse?.originalArgs?.jsonData?.sort?.column === column?.id
    //                         ? loadActionResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
    //                             ? 'desc'
    //                             : 'asc'
    //                         : dir
    //             }
    //         }
    //     })
    // }




    let columns: TableColumn<ActionItem>[] = []

    columns = [
        {
            name: '#',
            maxWidth: '10px',
            cell: (row, index: any) => {
                // eslint-disable-next-line no-mixed-operators
                return parseInt(state?.per_page_record) * (state?.page - 1) + (index + 1)
            }
        },
        {
            name: FM('task'),
            minWidth: '200px',
            cell: (row, index: any) => (
                <Link
                    state={{ ...row?.meeting }}
                    to={getPath('meeting.view', { id: row?.meeting?.id })}
                    role={'button'}
                    className={canView ? 'text-primary' : 'pe-none'}
                >
                    {truncateText(row?.task, 50)}

                </Link>

            )
        },
        {
            name: FM('decision'),
            minWidth: '200px',
            cell: (row, index: any) => (
                <div className='d-flex align-items-center'>
                    {/* <div className='user-info text-truncate'> */}
                    {truncateText(row?.comment, 50)}
                    {/* </div> */}
                </div>
            )
        },
        {
            name: FM('meeting'),
            minWidth: '200px',
            cell: (row, index: any) => (
                <Link
                    state={{ ...row?.meeting }}
                    to={getPath('meeting.view', { id: row?.meeting?.id })}
                    role={'button'}
                    className={canView ? 'text-primary' : 'pe-none'}
                >
                    {truncateText(row?.meeting?.meeting_title, 50)}
                </Link>
            )
        },
        {
            name: FM('status'),
            minWidth: '50px',
            cell: (row, index: any) => (
                <div className='d-flex align-items-center'>
                    <div className='user-info text-truncate'>
                        <span className='d-block fw-bold text-truncate'>{renderStatus(row)}</span>
                    </div>
                </div>
            )
        },
        {
            name: FM('priority'),
            minWidth: '50px',
            cell: (row, index: any) => (
                <div className='d-flex align-items-center'>
                    <div className='user-info text-truncate'>
                        <span className='d-block fw-bold text-truncate'> {renderPriority(row)}</span>
                    </div>
                </div>
            )
        },
        {
            name: FM('created-by'),
            minWidth: '120px',
            cell: (row, index: any) => (
                <div className='d-flex align-items-center'>
                    <div className='user-info text-truncate'>
                        <span className='d-block fw-bold text-truncate'>{row?.assigned_by}</span>
                    </div>
                </div>
            )
        },
        {
            name: FM('created-on'),
            minWidth: '140px',
            cell: (row, index: any) => (
                <div className='d-flex align-items-center'>
                    <div className='user-info text-truncate'>
                        <span className='d-block fw-bold text-truncate'>{formatDate(row?.created_at)}</span>
                    </div>
                </div>
            )
        },
        {
            name: FM('assigned-on'),
            minWidth: '150px',
            cell: (row, index: any) => (
                <div className='d-flex align-items-center'>
                    <div className='user-info text-truncate'>
                        <span className='d-block fw-bold text-truncate'>{formatDate(row?.date_opened)}</span>
                    </div>
                </div>
            )
        },

        {
            name: FM('assigned-to'),
            minWidth: '150px',
            cell: (row, index: any) => (
                <div className='d-flex align-items-center'>
                    <div className='user-info text-truncate'>
                        <span className='d-block fw-bold text-truncate'>{row?.owner_details}</span>
                    </div>
                </div>
            )
        },
        {
            name: FM('due-date'),
            minWidth: '50px',
            cell: (row, index: any) => (
                <div className='d-flex align-items-center'>
                    <div className='user-info text-truncate'>
                        <span className='d-block fw-bold text-truncate'>{formatDate(row?.due_date)}</span>
                    </div>
                </div>
            )
        },


    ]
    useEffect(() => {
        log('resultTask', resultTask)
    }
        , [resultTask])
    return (
        <>
            {/* <TasTimeLineFilter handleFilterData={handleFilterData} /> */}
            <Show IF={filterTimeline ?? false}>
                <div className='p-2' style={{ backgroundColor: "#fff" }}>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>


                            <Show IF={canList}>
                                <Col md='3'>
                                    <FormGroupCustom
                                        control={form.control}
                                        async
                                        label={FM('meeting')}
                                        name='meeting_id'
                                        loadOptions={loadDropdown}
                                        path={ApiEndpoints.meetings}
                                        selectLabel={(e) => `${e.meeting_title} `}
                                        selectValue={(e) => e.id}
                                        searchItem={'meeting_title'}
                                        // jsonData={{
                                        //     user_type: userType.owner
                                        // }}
                                        defaultOptions
                                        type='select'
                                        isClearable
                                        className='mb-1'
                                        rules={{ required: false }}
                                    />
                                </Col>
                            </Show>
                            <Show IF={String(user?.roles?.name).toLowerCase() === 'admin'}>
                                <Col md='3'>
                                    <FormGroupCustom
                                        control={form.control}
                                        async
                                        label={FM('owner')}
                                        name='owner_id'
                                        loadOptions={loadDropdown}
                                        path={ApiEndpoints.global_user}
                                        selectLabel={(e) => `${e.email} | ${e.name} `}
                                        selectValue={(e) => e.id}
                                        // jsonData={{
                                        //     user_type: userType.owner
                                        // }}
                                        defaultOptions
                                        type='select'
                                        isClearable
                                        className='mb-1'
                                        rules={{ required: false }}
                                    />
                                </Col>
                            </Show>

                            <Show IF={isValid(form.watch("meeting_id"))}>
                                <Col md='3'>
                                    <FormGroupCustom
                                        key={`${form.watch("meeting_id")?.value}`}
                                        control={form.control}
                                        async
                                        label={FM('task')}

                                        name='task_id'
                                        loadOptions={loadDropdown}
                                        path={ApiEndpoints.actionItems}
                                        selectLabel={(e) => `${e.task} `}
                                        selectValue={(e) => e.id}
                                        jsonData={{
                                            meeting_id: form.watch("meeting_id")?.value
                                        }}
                                        searchItem="task"
                                        defaultOptions
                                        type='select'
                                        isClearable
                                        className='mb-1'
                                        rules={{ required: false }}
                                    />
                                </Col>
                            </Show>

                            <Hide IF={isValid(form.watch("meeting_id"))}>


                                <Col md='3'>
                                    <FormGroupCustom
                                        control={form.control}
                                        label={FM('task')}
                                        name='task'
                                        type='text'
                                        onRegexValidation={{
                                            form: form,
                                            fieldName: 'task'
                                        }}
                                        className='mb-1'
                                        rules={{ required: false }}
                                    />
                                </Col>
                            </Hide>


                            <Col md='3'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('priority')}
                                    name='priority'
                                    isClearable
                                    selectOptions={createConstSelectOptions(priorityType, FM)}
                                    type='select'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>

                            <Col md='1' className='mt-1'>
                                <LoadingButton className='btn btn-primary mt-0' type='submit' loading={false}>
                                    {FM('filter')}
                                </LoadingButton>
                            </Col>
                            {/* <Col md='1' className='mt-25'>
                                    <LoadingButton
                                        className='btn btn-primary mt-2'
                                        tooltip={FM('reload')}
                                        loading={resultTask.isLoading}
                                        // size='sm'
                                        color='info'
                                        onClick={reloadData}
                                    >
                                        {FM('reset')}
                                    </LoadingButton>
                                </Col> */}
                        </Row>
                    </Form>
                </div>
            </Show>
            <CustomDataTable<any>
                initialPerPage={10}
                isLoading={resultTask.isLoading}
                columns={columns}
                hideHeader
                // options={options}
                // onSort={handleSort}
                hideSearch
                defaultSortField={resultTask?.originalArgs?.jsonData?.sort}
                // selectableRows
                // selectableRowDisabled={
                //     UserAction?.user_type === userType.admin || user?.id
                //         ? (row) => row?.status === 'verified'
                //         : () => false
                // }
                searchPlaceholder='search-action'
                // paginatedData={{
                //     code: resultTask?.data?.code,
                //     data: resultTask?.data?.data?.tasks_list,
                //     message: resultTask?.data?.message,
                //     success: resultTask?.data?.success,
                // }}
                paginatedData={resultTask?.data}
                handlePaginationAndSearch={handlePageChange}
            />
        </>
    )
}

export default TaskTimeline