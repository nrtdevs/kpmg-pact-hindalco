/* eslint-disable eqeqeq */
import { useEffect, useReducer, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLoadActionSendLogMutation } from '../../redux/RTKQuery/ActionMangement'
// import { sendType } from '@src/utility/Const'

import { FM, formatDate, isValid } from '@src/utility/Utils'

import CustomDataTable, {
    TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { stateReducer } from '@src/utility/stateReducer'
import { TableColumn } from 'react-data-table-component'

export type MailParamsType = {
    id?: any | null
    status_code?: any | null
    subject?: any | null
    body?: any | null
    created_at?: any | null
    created_by?: any | null
}

interface States {
    page?: any
    per_page_record?: any
    showModals?: boolean
    rowDataLog?: any
    search?: any
    reload?: any
    isAddingNewData?: boolean
    lastRefresh?: any
}

export type CategoryParamsType = {
    id?: string
    name: string
    status?: string
    patent_id?: string
}
interface dataType {
    edit?: MailParamsType
    response?: (e: boolean) => void
    noView?: boolean
    showModals?: boolean
    setShowModals?: (e: boolean) => void
    Component?: any
    loading?: boolean
    children?: any
}

export default function PromotionSendLogModal<T>(props: T & dataType) {
    const initState: States = {
        page: 1,
        per_page_record: 15,
        search: '',
        lastRefresh: new Date().getTime()
    }
    const form = useForm<MailParamsType>()
    const reducers = stateReducer<States>
    const [state, setState] = useReducer(reducers, initState)
    const { handleSubmit, control, reset, setValue, watch } = form
    const [getContent, { data, isLoading, isSuccess }] = useLoadActionSendLogMutation()
    const {
        edit = null,
        noView = false,
        showModals = false,
        setShowModals = () => { },
        Component = 'span',
        response = () => { },
        children = null,
        ...rest
    } = props

    //   useEffect(() => {
    //     setState({
    //       page: 1
    //     })
    //   }, [state.per_page_record])

    const handlePageChange = (e: TableFormData) => {
        setState({ ...e })
    }

    const [open, setOpen] = useState(false)

    const openModal = () => {
        setOpen(true)
        reset()
    }
    const closeModal = (from = null) => {
        setOpen(false)
        setShowModals(false)
    }

    useEffect(() => {
        if (noView && showModals) {
            openModal()
        }
    }, [noView, showModals])

    useEffect(() => {
        if (isValid(edit?.id)) {
            getContent({
                jsonData: {
                    action_item_id: edit?.id
                },
                per_page_record: state?.per_page_record,
                page: state?.page
            })
        }
    }, [edit?.id, state.page, state.per_page_record, state.lastRefresh])

    //   const reloadData = () => {
    //     setState({
    //       lastRefresh: new Date().getTime()
    //     })
    //   }

    const columns: TableColumn<MailParamsType>[] = [
        {
            name: '#',
            maxWidth: '50px',
            cell: (row, index: any) => {
                return parseInt(state?.per_page_record) * (state?.page - 1) + (index + 1)
            }
        },
        {
            name: FM('mail-subject'),

            cell: (row) => (
                <div className='d-flex align-items-center'>
                    <div className='user-info'>
                        <span className='d-block fw-bold text-capitalize'>{row?.subject}</span>
                    </div>
                </div>
            )
        },
        {
            name: FM('mail-body'),

            cell: (row) => (
                <div className='d-flex align-items-center'>
                    <div className='user-info'>
                        <span className='d-block fw-bold text-capitalize'>{row?.body}</span>
                    </div>
                </div>
            )
        },
        {
            name: FM('created-at'),

            cell: (row) => (
                <div className='d-flex align-items-center'>
                    <div className='user-info text-truncate'>
                        <span className='d-block fw-bold text-truncate'>
                            {formatDate(row?.created_at, 'YYYY-MM-DD')}
                        </span>
                    </div>
                </div>
            )
        },
        {
            name: FM('created-by'),

            cell: (row) => (
                <div className='d-flex align-items-center'>
                    <div className='user-info text-truncate'>
                        <span className='d-block fw-bold text-truncate'>
                            {row?.created_by?.name}
                        </span>
                    </div>
                </div>
            )
        }
    ]

    return (
        <>
            {!noView ? (
                <Component role='button' onClick={openModal} {...rest}>
                    {children}
                </Component>
            ) : null}
            <CenteredModal
                scrollControl={false}
                modalClass='modal-xl'
                hideSave
                hideClose
                open={open}
                disableFooter
                handleModal={closeModal}
                title={
                    <>
                        <div style={{ overflowWrap: 'anywhere' }}>{FM('follow-up-mail')}</div>
                    </>
                }
            >
                <CustomDataTable<MailParamsType>
                    initialPerPage={15}
                    isLoading={isLoading}
                    hideHeader
                    columns={columns}
                    paginatedData={data}
                    handlePaginationAndSearch={handlePageChange}
                />
            </CenteredModal>
        </>
    )
}
