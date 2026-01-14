import { yupResolver } from '@hookform/resolvers/yup'
import PostAddIcon from '@mui/icons-material/PostAdd'
import { QueryStatus } from '@reduxjs/toolkit/dist/query'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import CustomDataTable, {
    TableDropDownOptions,
    TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import DropDownMenu from '@src/modules/common/components/dropdown'
import DropZone from '@src/modules/common/components/fileUploader'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { RepeatType } from '@src/utility/Const'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import Show from '@src/utility/Show'
import { stateReducer } from '@src/utility/stateReducer'
import { Meeting, MeetingNote, Notifications } from '@src/utility/types/typeMeeting'
import {
    createConstSelectOptions,
    emitAlertStatus,
    fastLoop,
    FM,
    formatDate,
    isObjEmpty,
    isValid,
    isValidArray,
    log,
    setInputErrors,
    setValues,
    SuccessToast,
    truncateText
} from '@src/utility/Utils'
import { duration } from 'moment'
import { Fragment, useContext, useEffect, useReducer, useState } from 'react'
import { TableColumn } from 'react-data-table-component'
import {
    Book,
    BookOpen,
    Check,
    FileText,
    List,
    PlusSquare,
    RefreshCcw,
    Trash2,
    User,
    UserCheck,
    UserX
} from 'react-feather'
import { useForm } from 'react-hook-form'
import {
    Alert,
    Badge,
    ButtonGroup,
    Col,
    Form,
    Label,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane
} from 'reactstrap'
import * as yup from 'yup'
import {
    useActionMeetingMutation,
    useCreateOrUpdateMeetingMutation,
    useLoadMeetingsMutation
} from '../../redux/RTKQuery/MeetingManagement'
import {
    useCreateOrUpdateNoteMutation,
    useDeleteNoteMutation,
    useLoadNotesMutation
} from '../../redux/RTKQuery/NotesManagement'
import { useLoadNotificationMutation } from '../../redux/RTKQuery/Notifications'

type States = {
    page?: any
    per_page_record?: any
    filterData?: any
    reload?: any
    isAddingNewData?: boolean
    search?: string
    lastRefresh?: any
    selectedItem?: MeetingNote
    enableEdit?: boolean
}

export default function MeetingNotes() {
    // form hook

    // load data mutation
    const [loadNotification, loadMeetingResponse] = useLoadNotificationMutation()

    // default states
    const initState: States = {
        page: 1,
        per_page_record: 15,
        filterData: undefined,
        search: '',
        enableEdit: false,
        lastRefresh: new Date().getTime()
    }
    // state reducer
    const reducers = stateReducer<States>
    // state
    const [state, setState] = useReducer(reducers, initState)

    // load meeting list
    const loadNotesList = () => {
        loadNotification({
            page: state.page,
            per_page_record: state.per_page_record,
            jsonData: {
                name: !isValid(state.filterData) ? state.search : undefined,
                mark_all_as_read: 1,
                ...state.filterData
            }
        })
    }

    // handle pagination and load list
    useEffect(() => {
        loadNotesList()
    }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

    // handle page change
    const handlePageChange = (e: TableFormData) => {
        setState({ ...e })
    }

    // reload Data
    const reloadData = () => {
        setState({
            page: 1,
            per_page_record: 20,
            lastRefresh: new Date().getTime()
        })
    }

    // table columns
    const columns: TableColumn<Notifications>[] = [
        {
            name: FM('title'),
            cell: (row) => (
                <Fragment>
                    <span
                        role={'button'}
                        onClick={() => {
                            setState({
                                selectedItem: row
                            })
                        }}
                        className='text-primary'
                    >
                        {row?.title}
                    </span>
                </Fragment>
            )
        },

        {
            name: FM('message'),
            cell: (row) => <Fragment>{row?.message}</Fragment>
        },

        {
            name: FM('read-at'),
            cell: (row) => (
                <Fragment>
                    {formatDate(row?.read_at, 'hh:mm:ss')}
                    {/* <span className={row?.status === 1 ? 'text-success' : 'text-danger'}>
              {row?.status === 1 ? FM('active') : FM('inactive')}
            </span> */}
                </Fragment>
            )
        },
        {
            name: FM('created-at'),
            cell: (row) => (
                <Fragment>
                    {formatDate(row?.created_at, 'hh:mm:ss')}
                    {/* <span className={row?.status === 1 ? 'text-success' : 'text-danger'}>
            {row?.status === 1 ? FM('active') : FM('inactive')}
          </span> */}
                </Fragment>
            )
        }
    ]

    return (
        <Fragment>
            <Header icon={<FileText size='25' />} title={FM('notifications')}>
                <ButtonGroup color='dark'>
                    <LoadingButton
                        tooltip={FM('reload')}
                        loading={loadMeetingResponse.isLoading}
                        size='sm'
                        color='info'
                        onClick={reloadData}
                    >
                        <RefreshCcw size='14' />
                    </LoadingButton>
                </ButtonGroup>
            </Header>
            <CustomDataTable<Notifications>
                initialPerPage={10}
                isLoading={loadMeetingResponse.isLoading}
                columns={columns}
                hideSearch
                searchPlaceholder='search-meeting-name'
                hideFooter
                paginatedData={loadMeetingResponse?.data as any}
                tableData={loadMeetingResponse?.data?.data as any}
                handlePaginationAndSearch={handlePageChange}
            />
        </Fragment>
    )
}
