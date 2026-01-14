import { stateReducer } from '@src/utility/stateReducer'
import React, { useEffect, useReducer } from 'react'
import { useTaskTrackerMutation } from '../../redux/RTKQuery/AppSettingRTK'
import { FM, calculateDifference, createConstSelectOptions, fastLoop, formatDate, isValid, isValidArray, log, truncateText } from '@src/utility/Utils'
import { Badge, Card, CardBody, CardFooter, CardHeader, Col, Form, Row } from 'reactstrap'
import KeyboardDoubleArrowUp from '@mui/icons-material/KeyboardDoubleArrowUp'
import KeyboardDoubleArrowDown from '@mui/icons-material/KeyboardDoubleArrowDown'
import Show from '@src/utility/Show'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { useForm } from 'react-hook-form'
import { priorityType, roleIds, userType } from '@src/utility/Const'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import useUser from '@hooks/useUser'
import BsTooltip from '@src/modules/common/components/tooltip'
import Hide from '@src/utility/Hide'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'
type theProps = {
    loading?: any
    filterBoard?: boolean,
    // filterTransaction?: boolean
    filterMonthly?: boolean
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
const TaskBoard = ({
    loading = null,
    filterBoard = false,
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
        filterData: {
            //   name: null,
            //   email: null,
            //   subscription_terms_select_value: null,
            //   status: null
        },
        search: undefined,
        isRemoving: false,
        isReloading: false,
        isAddingNewData: false


    }
    const reducers = stateReducer<States>
    const [state, setState] = useReducer(reducers, initState)
    const user = useUser()
    const [loadTasks, resultTask] = useTaskTrackerMutation()
    const form = useForm<any>()
    const { handleSubmit, control, reset, setValue, watch, clearErrors } = form
    const loadMeetingList = () => {

        if (roleIds.client === user?.roles?.id) {
            if (state.filterData.owner_id || state.filterData.meeting_id || state.filterData.priority || state.filterData.task_id || state.filterData.task) {
                loadTasks({
                    page: state.page,
                    per_page_record: state.per_page_record,
                    jsonData: {
                        task: !isValid(state.filterData) ? state.search : undefined,
                        ...state.filterData,
                        priority: state?.filterData?.priority ?? undefined,
                        meeting_id: state?.filterData?.meeting_id ?? undefined,
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
                    priority: state?.filterData?.priority ?? undefined,
                    meeting_id: state?.filterData?.meeting_id ?? undefined,
                    owner_id: state.filterData?.owner_id ?? undefined
                }
            })
        }

    }

    useEffect(() => {
        if (tabIndex === '1') {
            loadMeetingList()
        }
    }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh, user, tabIndex])


    useEffect(() => {
        if (resultTask?.isSuccess) {
            setState({
                reportData: resultTask?.data
            })
            // closeForm()
        }

    }, [resultTask])

    const onSubmit = (d: any) => {
        setState({
            filterData: {
                ...d,
                meeting_id: d?.meeting_id?.value,
                task_id: d?.task_id?.value,
                owner_id: d?.owner_id?.value,
                priority: d?.priority?.value,
            }
        })
    }

    const statsData = state?.reportData?.data

    log("statsData", statsData?.to_do_list?.data)

    const renderPriority = (item: any) => {
        switch (item?.priority) {
            case 'high':
                return <Badge color='danger' className='text-uppercase'><KeyboardDoubleArrowUp fontSize='large' /> {item?.priority}</Badge>
            case 'medium':
                return <Badge color='warning' className='text-uppercase'><KeyboardDoubleArrowUp fontSize='large' /> {item?.priority}</Badge>
            case 'low':
                return <Badge color='success' className='text-uppercase'><KeyboardDoubleArrowDown fontSize='large' />{item?.priority}</Badge>

        }
    }

    const renderTodoList = () => {
        const re: any = []
        if (resultTask?.isLoading) {

            return <div className=''>

                <Card className="animate__animated animate__fade">
                    <CardBody className='p-0'>
                        <div className='d-flex justify-content-around p-1'>


                            <div className='w-100 m-1'>
                                <Shimmer height={"50px"} />

                            </div>

                            <div className='w-100  m-1'>

                                <Shimmer height={"50px"} />
                            </div>
                        </div>
                        <div className='border-top p-1'>
                            <div className='d-flex justify-content-between'>
                                <div className='w-100  m-1'>
                                    <Shimmer height={"50px"} />
                                </div>
                                <div className='w-100  m-1'>
                                    <Shimmer height={"50px"} />
                                </div>
                            </div>
                        </div>

                    </CardBody>

                </Card>
            </div>

        } else {


            fastLoop(statsData?.to_do_list?.data, (item: any, index: any) => {
                re.push(
                    <>


                        <div className=''>

                            <Card className="animate__animated animate__fade">
                                <CardBody className='p-0'>
                                    <div className='d-flex justify-content-around p-1'>


                                        <div className='w-100'>
                                            {/* <h5 className='mb-3px fw-bolder text-primary text-truncate'> */}
                                            <span className='position-relative'>
                                                <span className='fw-bolder'>Meeting :-</span> <span className='fw-bolder text-primary'>{item?.meeting?.meeting_title}</span>,
                                            </span>
                                            {/* </h5> */}

                                        </div>

                                        <div className='w-100'>
                                            {/* <h5 className='mb-3px fw-bolder text-primary text-truncate'> */}
                                            <span className='position-relative'>

                                                <span className='fw-bolder'>Task :-</span>
                                                <span className='fw-bolder text-primary'>{item?.task}</span>

                                            </span>
                                            {/* </h5> */}

                                        </div>
                                    </div>
                                    <div className='border-top p-1'>
                                        <div className='d-flex justify-content-between'>
                                            <div className='w-100'>
                                                <p className='mb-0 fw-bold text-secondary text-truncate text-primary'>
                                                    {renderPriority(item)}
                                                </p>
                                            </div>
                                            <div className='w-100'>
                                                <p className='mb-0 fw-bold  text-truncate text-primary'>
                                                    {formatDate(item?.due_date) ?? 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='d-flex justify-content-between border-top'>
                                        <div className='w-100  m-1'>
                                            <BsTooltip title={FM("created_by")} placement='top' arrow>
                                                <p className='mb-0 fw-bold text-secondary text-truncate text-primary'>
                                                    <span>{`Created BY:  `}</span>   <Badge color='light-info'>   {item?.created_by?.name ?? 'N/A'}</Badge>
                                                </p>
                                            </BsTooltip>
                                        </div>
                                        <div className='w-100  m-1'>
                                            <BsTooltip title={FM("owner")} placement='top' arrow>
                                                <p className='mb-0 fw-bold text-secondary text-truncate text-primary'>
                                                    <span>{`Owner:  `}</span>   <Badge color='light-primary'>{item?.owner?.name ?? 'N/A'}</Badge>
                                                </p>
                                            </BsTooltip>
                                        </div>
                                        <div className='w-100  m-1'>
                                            <BsTooltip title={FM("owner")} placement='top' arrow>
                                                <p className='mb-0 fw-bold text-secondary text-truncate text-primary'>
                                                    <span>{`    Organizer:  `}</span>   <Badge color='light-warning'>{item?.meeting?.organiser?.name ?? 'N/A'}</Badge>
                                                </p>
                                            </BsTooltip>
                                        </div>
                                    </div>
                                </CardBody>

                            </Card>
                        </div>


                    </>
                )
            }
            )
        }
        return re
    }
    const renderOverDueList = () => {
        const re: any = []
        if (resultTask?.isLoading) {
            return <div className=''>

                <Card className="animate__animated animate__fade">
                    <CardBody className='p-1'>
                        <div className='d-flex justify-content-around p-1'>


                            <div className='w-100 m-2'>
                                <Shimmer height={"50px"} />

                            </div>

                            <div className='w-100 m-2'>

                                <Shimmer height={"50px"} />
                            </div>
                        </div>
                        <div className='border-top m-1'>
                            <div className='d-flex justify-content-between'>
                                <div className='w-100 m-2'>
                                    <Shimmer height={"50px"} />
                                </div>
                                <div className='w-100 m-1'>
                                    <Shimmer height={"50px"} />
                                </div>
                            </div>
                        </div>

                    </CardBody>
                </Card>
            </div>
        } else {


            fastLoop(statsData?.over_due_list?.data, (item: any, index: any) => {
                re.push(
                    <>


                        <>

                            <div className=''>
                                <Card className="animate__animated animate__fade">
                                    <CardBody className='p-0'>
                                        <div className='d-flex justify-content-around p-1'>


                                            <div className='w-100'>
                                                {/* <h5 className='mb-3px fw-bolder text-primary text-truncate'> */}
                                                <span className='position-relative'>
                                                    <span className='fw-bolder'>Meeting :-</span> <span className='fw-bolder text-primary'>{item?.meeting?.meeting_title}</span>,
                                                </span>
                                                {/* </h5> */}

                                            </div>

                                            <div className='w-100'>
                                                {/* <h5 className='mb-3px fw-bolder text-primary text-truncate'> */}
                                                <span className='position-relative'>
                                                    <span className='fw-bolder'>Task :-</span><span className='fw-bolder text-primary'>{item?.task}</span>
                                                </span>
                                                {/* </h5> */}

                                            </div>
                                        </div>
                                        <div className='border-top p-1'>
                                            <div className='d-flex justify-content-between'>
                                                <div className='w-100'>
                                                    <p className='mb-0 fw-bold text-secondary t text-primary'>
                                                        {renderPriority(item)}
                                                    </p>
                                                </div>
                                                <div className='w-100'>
                                                    <p className='mb-0 fw-bold text-secondary  text-danger'>
                                                        {formatDate(item?.due_date) ?? 'N/A'} ({calculateDifference(item?.due_date)} days)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='d-flex justify-content-between border-top'>
                                            <div className='w-100  m-1'>
                                                <BsTooltip title={FM("created_by")} placement='top' arrow>
                                                    <p className='mb-0 fw-bold text-secondary text-truncate text-primary'>
                                                        <span>{`Created By:  `}</span>     <Badge color='light-info'>   {item?.created_by?.name ?? 'N/A'}</Badge>
                                                    </p>
                                                </BsTooltip>
                                            </div>
                                            <div className='w-100  m-1'>
                                                <BsTooltip title={FM("owner")} placement='top' arrow>
                                                    <p className='mb-0 fw-bold text-secondary text-truncate text-primary'>
                                                        <span>{`Owner:  `}</span>      <Badge color='light-primary'>{item?.owner?.name ?? 'N/A'}</Badge>
                                                    </p>
                                                </BsTooltip>
                                            </div>
                                            <div className='w-100  m-1'>
                                                <BsTooltip title={FM("owner")} placement='top' arrow>
                                                    <p className='mb-0 fw-bold text-secondary text-truncate text-primary'>
                                                        <span>{`    Organizer:  `}</span>   <Badge color='light-warning'>{item?.meeting?.organiser?.name ?? 'N/A'}</Badge>
                                                    </p>

                                                </BsTooltip>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        </>


                    </>
                )
            }
            )
        }
        return re
    }




    return (
        <>
            <div className='p-2 borderStyleCard'>
                <Show IF={filterBoard === true}>
                    <div className='p-2' style={{ backgroundColor: "#fff" }}>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Row>




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
                <Row>
                    <Col md={6} lg="6" sm="12">
                        {/* <Card> */}
                        <Badge color='primary' className='mb-1'>
                            {FM('todos')} :- {statsData?.to_do_count}
                        </Badge>
                        {isValidArray(statsData?.to_do_list?.data) ? renderTodoList() : <Card className=''> <p className='text-center mt-1'>{FM('no-any-todos-found')}</p> </Card>}
                        {/* {renderTodoList()} */}
                        {/* </Card> */}
                    </Col>

                    <Col md={6} lg="6" sm="12">
                        {/* <Card> */}
                        <Badge color='danger' className='mb-1'>
                            {FM('overdue')} :- {statsData?.over_due_count}
                        </Badge>
                        {isValidArray(statsData?.over_due_list?.data) ? renderOverDueList() : <Card className=''> <p className='text-center mt-1'>{FM('no-any-overdue-found')}</p> </Card>}

                        {/* </Card> */}

                    </Col>
                </Row>
            </div>
        </>
    )
}
export default TaskBoard