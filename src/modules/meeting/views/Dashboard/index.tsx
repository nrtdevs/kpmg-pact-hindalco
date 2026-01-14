// ** React Imports
import { Fragment, useContext, useEffect, useReducer } from 'react'

// ** Reactstrap Imports
import { Button, ButtonGroup, ButtonProps, Card, CardBody, CardHeader, Col, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap'

// ** Context
import { ThemeColors } from '@src/utility/context/ThemeColors'
// ** Styles
import StatsHorizontal from '@src/@core/components/widgets/stats/StatsHorizontal'
import Header from '@src/modules/common/components/header'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'
import useUser from '@src/utility/hooks/useUser'

import BsTooltip from '@src/modules/common/components/tooltip'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import { stateReducer } from '@src/utility/stateReducer'
import { abbreviateNumber, FM, isValid } from '@src/utility/Utils'
import '@styles/base/pages/dashboard-ecommerce.scss'
import '@styles/react/libs/charts/apex-charts.scss'
import {
    AlertCircle,
    CheckCircle,
    CheckSquare,
    Edit3,
    FilePlus,
    FileText,
    List,
    Pause,
    Send,
    Sliders,
    UserCheck,
    Users,
    X
} from 'react-feather'
import { useAppSettingAdminDetailsMutation, useDashboardReportMutation } from '../../redux/RTKQuery/AppSettingRTK'
import TaskBoard from '../TaskTracker/TaskBoard'
import TaskTimeline from '../TaskTracker/TaskTimeline'

interface States {
    active?: string
    lastStoreRefresh?: any
    filterBoard?: boolean
    lastRefresh?: any
    reportData?: any
    filterTimeline?: boolean
    filterTask?: boolean
    page?: any
    per_page_record?: any
    search?: any
    filterData?: any
}

const Dashboard = () => {
    // ** Context
    const { colors } = useContext(ThemeColors)
    const user = useUser()

    // ** vars
    const trackBgColor = '#e9ecef'
    const initState: States = {
        active: '1',
        page: 1,
        reportData: [],
        filterTimeline: false,
        filterBoard: false,
        filterTask: false,
        per_page_record: 30,
        lastStoreRefresh: new Date().getTime(),
        lastRefresh: new Date().getTime()
    }
    const reducers = stateReducer<States>
    const [state, setState] = useReducer(reducers, initState)
    const [loadDashboard, result] = useDashboardReportMutation()
    const [loadAdminSetting, adminSettingResult] = useAppSettingAdminDetailsMutation()
    const hindranceBrowse = Can(Permissions.hindranceBrowse)
    const invoiceBrowse = Can(Permissions.invoiceBrowse)
    const meetingBrowse = Can(Permissions.meetingBrowse)


    useEffect(() => {
        loadDashboard({
            //   jsonData: { name: state?.search },
        })
    }, [state?.lastRefresh])

    //get data only for admin user
    useEffect(() => {
        if (user?.user_type === 1 || user?.user_type === '1') {
            loadAdminSetting({})
        }
    }, [user, state?.lastRefresh])


    const toggleTimeline = () => {
        setState({ filterTimeline: !state.filterTimeline })
    }
    const toggleBoard = () => {
        setState({ filterBoard: !state.filterBoard })
    }
    const toggleTask = () => {
        setState({ filterTask: !state.filterTask })
    }

    useEffect(() => {
        if (result?.isSuccess) {
            setState({
                reportData: result?.data
            })
        }
    }, [result])

    const toggleTab = (tab: any) => {
        if (state?.active !== tab) {
            setState({ active: tab })
        }
    }

    const statsData = state?.reportData?.data


    return (
        <Fragment>
            {result?.isLoading ? (
                <div id='dashboard-dpr'>
                    <Row className='match-height'>
                        <Col md='4'>
                            <Shimmer height={250} />
                        </Col>
                        <Col md='4'>
                            <Shimmer height={250} />
                        </Col>
                        <Col md='4'>
                            <Shimmer height={250} />
                        </Col>
                        <Col md='4'>
                            <Shimmer height={250} />
                        </Col>
                        <Col md='4'>
                            <Shimmer height={250} />
                        </Col>
                        <Col md='4'>
                            <Shimmer height={250} />
                        </Col>
                    </Row>
                </div>
            ) : (
                <>
                    <Header title={state?.reportData?.message}></Header>
                    <div id='dashboard-dpr'>
                        <Row className='match-height'>
                            <Show IF={isValid(statsData?.userCount)}>
                                <Col md='4'>
                                    <StatsHorizontal
                                        tooltip={`${statsData?.userCount}`}
                                        icon={<Users />}
                                        color='primary'
                                        stats={abbreviateNumber(statsData?.userCount)}
                                        statTitle={FM('total-users')}
                                    />
                                </Col>
                            </Show>
                            <Show IF={isValid(statsData?.todayMeetingCount)}>
                                <Col md='4'>
                                    <StatsHorizontal
                                        tooltip={`${statsData?.todayMeetingCount}`}
                                        icon={<List />}
                                        color='success'
                                        stats={abbreviateNumber(statsData?.todayMeetingCount)}
                                        statTitle={FM('today-meeting')}
                                    />
                                </Col>
                            </Show>
                            <Show IF={isValid(statsData?.meetingCount)}>
                                <Col md='4'>
                                    <StatsHorizontal
                                        tooltip={`${statsData?.meetingCount}`}
                                        icon={<List />}
                                        color='info'
                                        stats={abbreviateNumber(statsData?.meetingCount)}
                                        statTitle={FM('total-meetings')}
                                    />
                                </Col>
                            </Show>
                            <hr />
                        </Row>

                        <Show IF={invoiceBrowse}>
                            <Row>
                                <h3 className='text-primary fw-bold'>Invoices</h3>
                                <Show IF={isValid(statsData?.invoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.invoiceCount}`}
                                            icon={<FileText />}
                                            color='primary'
                                            stats={abbreviateNumber(statsData?.invoiceCount)}
                                            statTitle={FM('total-invoices')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.approved_invoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.approved_invoiceCount}`}
                                            icon={<CheckCircle />}
                                            color='success'
                                            stats={abbreviateNumber(statsData?.approved_invoiceCount)}
                                            statTitle={FM('approved-invoices')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.pending_invoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            icon={<AlertCircle />}
                                            tooltip={`${statsData?.pending_invoiceCount}`}
                                            color='warning'
                                            stats={abbreviateNumber(statsData?.pending_invoiceCount)}
                                            statTitle={FM('pending-invoices')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.pending_with_owner_InvoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            icon={<AlertCircle />}
                                            tooltip={`${statsData?.pending_with_owner_InvoiceCount}`}
                                            color='warning'
                                            stats={abbreviateNumber(statsData?.pending_with_owner_InvoiceCount)}
                                            statTitle={FM('pending-with-owner-invoices')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.pending_with_epcm_InvoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            icon={<AlertCircle />}
                                            tooltip={`${statsData?.pending_with_epcm_InvoiceCount}`}
                                            color='warning'
                                            stats={abbreviateNumber(statsData?.pending_with_epcm_InvoiceCount)}
                                            statTitle={FM('pending-with-epcm-invoices')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.rejected_invoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            icon={<X />}
                                            tooltip={`${statsData?.rejected_invoiceCount}`}
                                            color='danger'
                                            stats={abbreviateNumber(statsData?.rejected_invoiceCount)}
                                            statTitle={FM('rejected-invoices')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.on_hold_invoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            icon={<Pause />}
                                            tooltip={`${statsData?.on_hold_invoiceCount}`}
                                            color='secondary'
                                            stats={abbreviateNumber(statsData?.on_hold_invoiceCount)}
                                            statTitle={FM('on-hold-invoices')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.paid_invoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.paid_invoiceCount}`}
                                            icon={<CheckSquare />}
                                            color='info'
                                            stats={abbreviateNumber(statsData?.paid_invoiceCount)}
                                            statTitle={FM('paid-invoices')}
                                        />
                                    </Col>
                                </Show>

                                <Show IF={isValid(statsData?.resend_invoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.resend_invoiceCount}`}
                                            icon={<Send />}
                                            color='info'
                                            stats={abbreviateNumber(statsData?.resend_invoiceCount)}
                                            statTitle={FM('resend-invoices')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.send_for_payment_invoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.send_for_payment_invoiceCount}`}
                                            icon={<Send />}
                                            color='primary'
                                            stats={abbreviateNumber(statsData?.send_for_payment_invoiceCount)}
                                            statTitle={FM('send-for-payment-invoices')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.under_review_by_owner_invoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.under_review_by_owner_invoiceCount}`}
                                            icon={<UserCheck />}
                                            color='dark'
                                            stats={abbreviateNumber(statsData?.under_review_by_owner_invoiceCount)}
                                            statTitle={FM('under-review-by-owner-invoices')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.under_review_by_owner_invoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.under_review_by_owner_invoiceCount}`}
                                            icon={<UserCheck />}
                                            color='secondary'
                                            stats={abbreviateNumber(statsData?.under_review_by_emcm_invoiceCount)}
                                            statTitle={FM('under-review-by-epcm-invoices')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.verified_invoiceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.verified_invoiceCount}`}
                                            icon={<FilePlus />}
                                            color='success'
                                            stats={abbreviateNumber(statsData?.verified_invoiceCount)}
                                            statTitle={FM('verified-invoices')}
                                        />
                                    </Col>
                                </Show>
                                <hr />
                            </Row>
                        </Show>
                        <Show IF={hindranceBrowse}>
                            <Row>
                                <h3 className='text-primary fw-bold'>Hindrance</h3>
                                <Show IF={isValid(statsData?.hindranceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.hindranceCount}`}
                                            icon={<FileText />}
                                            color='primary'
                                            stats={abbreviateNumber(statsData?.hindranceCount)}
                                            statTitle={FM('total-hindrance')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.approved_hindranceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.approved_hindranceCount}`}
                                            icon={<CheckSquare />}
                                            color='success'
                                            stats={abbreviateNumber(statsData?.approved_hindranceCount)}
                                            statTitle={FM('approved-hindrance')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.pending_hindranceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.pending_hindranceCount}`}
                                            icon={<AlertCircle />}
                                            color='warning'
                                            stats={abbreviateNumber(statsData?.pending_hindranceCount)}
                                            statTitle={FM('pending-hindrance')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.rejected_hindranceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.rejected_hindranceCount}`}
                                            icon={<X />}
                                            color='danger'
                                            stats={abbreviateNumber(statsData?.hindranceCount)}
                                            statTitle={FM('rejected-hindrance')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.on_hold_hindranceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.on_hold_hindranceCount}`}
                                            icon={<Pause />}
                                            color='secondary'
                                            stats={abbreviateNumber(statsData?.on_hold_hindranceCount)}
                                            statTitle={FM('on-hold-hindrance')}
                                        />
                                    </Col>
                                </Show>

                                <Show IF={isValid(statsData?.resend_hindranceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.resend_hindranceCount}`}
                                            icon={<Send />}
                                            color='info'
                                            stats={abbreviateNumber(statsData?.hindranceCount)}
                                            statTitle={FM('resend-hindrance')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.resolved_hindranceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.resolved_hindranceCount}`}
                                            icon={<Edit3 />}
                                            color='success'
                                            stats={abbreviateNumber(statsData?.resolved_hindranceCount)}
                                            statTitle={FM('resolved-hindrance')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.under_review_by_emcm_hindranceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.under_review_by_emcm_hindranceCount}`}
                                            icon={<UserCheck />}
                                            color='primary'
                                            stats={abbreviateNumber(statsData?.under_review_by_emcm_hindranceCount)}
                                            statTitle={FM('under-review-by-epcm-hindrance')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.under_review_by_owner_hindranceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.under_review_by_owner_hindranceCount}`}
                                            icon={<UserCheck />}
                                            color='dark'
                                            stats={abbreviateNumber(statsData?.under_review_by_owner_hindranceCount)}
                                            statTitle={FM('under-review-by-owner-hindrance')}
                                        />
                                    </Col>
                                </Show>
                                <Show IF={isValid(statsData?.verified_hindranceCount)}>
                                    <Col md='4'>
                                        <StatsHorizontal
                                            tooltip={`${statsData?.verified_hindranceCount}`}
                                            icon={<FilePlus />}
                                            color='success'
                                            stats={abbreviateNumber(statsData?.verified_hindranceCount)}
                                            statTitle={FM('verified-hindrance')}
                                        />
                                    </Col>
                                </Show>
                            </Row>
                        </Show>
                    </div>

                    <Show IF={user?.user_type == 1 || user?.user_type == '1'}>
                        {adminSettingResult?.isLoading ? (
                            <div id='dashboard-dpr'>
                                <Row className='match-height'>
                                    <Col md='4'>
                                        <Shimmer height={250} />
                                    </Col>
                                    <Col md='4'>
                                        <Shimmer height={250} />
                                    </Col>
                                    <Col md='4'>
                                        <Shimmer height={250} />
                                    </Col>
                                    <Col md='4'>
                                        <Shimmer height={250} />
                                    </Col>
                                    <Col md='4'>
                                        <Shimmer height={250} />
                                    </Col>
                                    <Col md='4'>
                                        <Shimmer height={250} />
                                    </Col>
                                </Row>
                            </div>
                        ) : (<>
                            <h3 className='text-primary fw-bold'>{FM('admin-user-details')}</h3>

                            < Card >
                                <CardBody>

                                    <Row>

                                        <Col md='4'>
                                            <Label className='text-uppercase text-dark fw-bold mb-25'>
                                                {FM('email')}
                                            </Label>
                                            <p className=''>
                                                {adminSettingResult?.data?.data?.email ?? 'N/A'}
                                            </p>
                                        </Col>
                                        <Col md='4'>
                                            <Label className='text-uppercase text-dark fw-bold mb-25'>{FM('mobile-number')}</Label>
                                            <p className='text-capitalize'>
                                                {adminSettingResult?.data?.data?.mobile_no ?? 'N/A'}
                                            </p>
                                        </Col>


                                        <Col md='4'>
                                            <Label className='text-uppercase text-dark fw-bolder mb-25'>{FM('access-key')}</Label>
                                            <p className=''>
                                                {adminSettingResult?.data?.data?.access_key ?? 'N/A'}
                                            </p>
                                        </Col>

                                        <Col md='4'>
                                            <Label className='text-uppercase text-dark fw-bolder mb-25'>
                                                {FM('hanger-email')}
                                            </Label>
                                            <p className=''>
                                                {adminSettingResult?.data?.data?.hanger_email ?? 'N/A'}
                                            </p>
                                        </Col>
                                        <Col md='4'>
                                            <Label className='text-uppercase text-dark fw-bolder mb-25'>
                                                {FM('log_expiry_days')}
                                            </Label>
                                            <p className=''>
                                                {adminSettingResult?.data?.data?.log_expiry_days ?? 'N/A'}
                                            </p>
                                        </Col>
                                        <Col md='4'>
                                            <Label className='text-uppercase text-dark fw-bold mb-25'>
                                                {FM('app-name')}
                                            </Label>
                                            <p className='text-capitalize'>{adminSettingResult?.data?.data?.app_name}</p>
                                        </Col>
                                        <Col md='4'>
                                            <Label className='text-uppercase text-dark fw-bolder mb-25'>
                                                {FM('description')}
                                            </Label>
                                            <p className=''>
                                                {adminSettingResult?.data?.data?.description ?? 'N/A'}
                                            </p>
                                        </Col>
                                        <Col md='4'>
                                            <Label className='text-uppercase text-dark fw-bolder mb-25'>
                                                {FM('address')}
                                            </Label>
                                            <p className=''>
                                                {adminSettingResult?.data?.data?.address ?? 'N/A'}
                                            </p>
                                        </Col>
                                    </Row>

                                </CardBody>

                            </Card></>)
                        }
                    </Show>

                    <Show IF={meetingBrowse}>
                        <Card>
                            <CardHeader className='p-1 border-bottom'>
                                <div className='flex-1'>
                                    <Row className='d-flex justify-content-between aligned-items-center'>
                                        <Col md='8' className=''>
                                            <Nav pills className={`mb-0 flex-column flex-sm-row`}>
                                                <NavItem>
                                                    <NavLink active={state.active === '1'} onClick={() => toggleTab('1')}>
                                                        {/* <CalendarMonthIcon className='font-medium-3  me-50' /> */}
                                                        <span className='fw-bold'>
                                                            <>{FM('board')}</>
                                                        </span>
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink active={state.active === '2'} onClick={() => toggleTab('2')}>
                                                        {/* <PaidOutlinedIcon className='font-medium-3  me-50' /> */}
                                                        <span className='fw-bold'>
                                                            <>{FM('timeline')}</>
                                                        </span>
                                                    </NavLink>
                                                </NavItem>
                                            </Nav>
                                        </Col>
                                        <Show IF={state?.active === '2' || state?.active === '1'}>

                                            <Col md='1' className='d-flex align-items-start justify-content-end'>






                                                <ButtonGroup color='dark'>
                                                    <Show IF={state?.active === '1'}>
                                                        <BsTooltip<ButtonProps>
                                                            Tag={Button}
                                                            color={state?.filterBoard ? 'danger' : 'primary'}
                                                            className='btn-icon btn-secondary'
                                                            title={FM('filter')}
                                                            onClick={toggleBoard}
                                                        >
                                                            {state?.filterBoard ? <X size={16} /> : <Sliders size={16} />}
                                                        </BsTooltip>
                                                    </Show>
                                                    <Show IF={state.active === "2"}>
                                                        <BsTooltip<ButtonProps>
                                                            Tag={Button}
                                                            color={state?.filterTimeline ? 'danger' : 'primary'}
                                                            className='btn-icon btn-secondary'
                                                            title={FM('filter')}
                                                            onClick={toggleTimeline}
                                                        >
                                                            {state?.filterTimeline ? <X size={16} /> : <Sliders size={16} />}
                                                        </BsTooltip>
                                                    </Show>
                                                </ButtonGroup>

                                            </Col>
                                        </Show>
                                    </Row>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* <CardBody className='p-0'> */}
                        <TabContent activeTab={state.active}>
                            <TabPane tabId='1'>

                                <TaskBoard
                                    tabIndex={state.active}
                                    filterBoard={state?.filterBoard ?? false}
                                    // filterMonthly={state?.filterTransaction}
                                    loading={state?.lastRefresh}
                                    closeForm={() => {
                                        toggleBoard()
                                    }}
                                />
                            </TabPane>
                            <TabPane tabId='2'>
                                <TaskTimeline
                                    tabIndex={state.active}
                                    filterTimeline={state?.filterTimeline}
                                    // filterTransaction={state?.filterTransaction}
                                    loading={state?.lastRefresh}
                                    closeForm={() => {
                                        toggleTimeline()
                                    }}
                                />
                            </TabPane>

                        </TabContent>
                    </Show>
                    {/* </CardBody> */}
                </>
            )
            }
        </Fragment >
    )
}

export default Dashboard
