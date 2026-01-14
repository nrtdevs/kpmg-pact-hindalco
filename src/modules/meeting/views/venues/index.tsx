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
import { Meeting, MeetingNote } from '@src/utility/types/typeMeeting'
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
    Edit,
    List,
    PlusSquare,
    RefreshCcw,
    Trash2,
    Twitch,
    User,
    UserCheck,
    UserX
} from 'react-feather'
import { useForm } from 'react-hook-form'
import {
    Alert,
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
import { useCreateOrUpdateVenueMutation, useDeleteVenueMutation, useLoadVenueMutation } from '../../redux/RTKQuery/VenueRTK'
import { watch } from 'fs'

// validation schema
const userFormSchema = {
    //   meeting_id: yup.string().required(),
    notes: yup.string().required(),
    decision: yup.string().required(),
    duration: yup.string().required()
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
    selectedItem?: any
    enableEdit?: boolean
}

const defaultValues: any = {
    venue: '',

}
const VenueList = () => {
    // header menu context
    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    // form hook
    const form = useForm<any>({
        resolver: yupResolver(schema),
        defaultValues
    })
    // toggle add modal
    const [modalAdd, toggleModalAdd] = useModal()
    // toggle view modal
    const [modalView, toggleModalView] = useModal()
    // create or update mutation
    const [createVenue, createVenueRes] = useCreateOrUpdateVenueMutation()
    // load data mutation
    const [loadVenue, venuesRes] = useLoadVenueMutation()
    // delete mutation
    const [deleteVenue, venueDeleteRes] = useDeleteVenueMutation()

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
    // ** State
    const [active, setActive] = useState('1')

    const toggle = (tab) => {
        if (active !== tab) {
            setActive(tab)
        }
    }

    // close add
    const closeAddModal = () => {
        setState({
            selectedItem: undefined,
            enableEdit: false
        })
        form.reset()
        toggleModalAdd()
    }

    // close view modal
    const closeViewModal = (reset = true) => {
        if (reset) {
            setState({
                selectedItem: undefined
            })
            form.reset()
        }
        toggleModalView()
    }

    // handle save user
    const handleSaveNotes = (data: any) => {
        if (state.selectedItem?.id) {

            createVenue({
                jsonData: {
                    id: state.selectedItem?.id,
                    venue: form.watch("venue"),
                }
            })
        } else {
            createVenue({
                jsonData: {
                    venues: form.watch("venue")?.split(','),
                }
            })
        }

    }

    // load meeting list
    const loadNotesList = () => {
        loadVenue({
            page: state.page,
            per_page_record: state.per_page_record,
            jsonData: {
                id: state.selectedItem?.id,
                name: !isValid(state.filterData) ? state.search : undefined,
                ...state.filterData
            }
        })
    }

    // handle meeting create response
    useEffect(() => {
        if (!createVenueRes.isUninitialized) {
            if (createVenueRes.isSuccess) {
                closeAddModal()
                loadNotesList()
                // SuccessToast(FM('meeting-created-successfully'))
            } else if (createVenueRes.isError) {
                // handle error
                const errors: any = createVenueRes.error
                log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createVenueRes])

    // handle pagination and load list
    useEffect(() => {
        loadNotesList()
    }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

    // handle page change
    const handlePageChange = (e: TableFormData) => {
        setState({ ...e })
    }

    // handle filter data
    const handleFilterData = (e: any) => {
        setState({ filterData: e })
    }

    // reload Data
    const reloadData = () => {
        setState({
            page: 1,
            per_page_record: 20,
            lastRefresh: new Date().getTime()
        })
    }

    // create a menu on header
    // useEffect(() => {
    //     setHeaderMenu(
    //         <>
    //             <NavItem className=''>

    //             </NavItem>
    //         </>
    //     )
    //     return () => {
    //         setHeaderMenu(null)
    //     }
    // }, [modalAdd])

    // handle actions
    const handleActions = (ids?: any, action?: any, eventId?: any) => {
        if (isValidArray(ids)) {
            deleteVenue({
                ids,
                eventId,
                action
            })
        }
    }

    // handle action result
    useEffect(() => {
        if (
            (venueDeleteRes.status = QueryStatus?.fulfilled) &&
            venueDeleteRes?.isLoading === false
        ) {
            if (venueDeleteRes?.isSuccess) {
                emitAlertStatus('success', null, venueDeleteRes?.originalArgs?.eventId)
            } else if (venueDeleteRes?.error) {
                emitAlertStatus('failed', null, venueDeleteRes?.originalArgs?.eventId)
            }
        }
    }, [venueDeleteRes])

    // open view modal
    useEffect(() => {
        if (isValid(state.selectedItem)) {
            setValues<any>(
                {
                    venue: state.selectedItem?.venue,
                },
                form.setValue
            )
            toggleModalView()
        }
    }, [state.selectedItem])

    // create modal
    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modalAdd}
                done={state.enableEdit ? 'edit' : 'save'}
                title={state.enableEdit ? FM('edit') : FM('create-venue')}
                // hideClose
                scrollControl={false}
                modalClass={'modal-sm'}
                // extraButtons={
                //   <LoadingButton loading={false} color='primary'>
                //     {FM('start-now')}
                //   </LoadingButton>
                // }
                handleModal={closeAddModal}
                // loading={createVenueRes.isLoading}
                handleSave={handleSaveNotes}
            >
                <div className='p-1'>
                    <Form onSubmit={form.handleSubmit(handleSaveNotes)}>

                        <Row>
                            <Col md='12'>
                                <FormGroupCustom
                                    key={`${modalAdd}-${state.selectedItem?.id}-venue`}
                                    control={form.control}
                                    label={FM('venues')}
                                    name='venue'
                                    type='textarea'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'venue'
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

    // // view User modal
    // const renderViewModal = () => {
    //     return (
    //         <CenteredModal
    //             open={modalView}
    //             title={state.selectedItem?.notes}
    //             done='edit'
    //             hideClose
    //             handleSave={() => {
    //                 setState({
    //                     enableEdit: true
    //                 })
    //                 closeViewModal(false)
    //                 toggleModalAdd()
    //             }}
    //             handleModal={() => closeViewModal(true)}
    //         >
    //             <div className='p-2'>
    //                 {/* <Row className='align-items-center mb-1'>
    //         <Col md='1'>
    //           <BookOpen size={35} />
    //         </Col>
    //         <Col md='8'>
    //           <p className='text-dark mb-0'>{FM('personal-details')}</p>
    //           <p className='text-muted small mb-0'>{FM('edit-description')}</p>
    //         </Col>
    //       </Row> */}
    //                 <Row>
    //                     <Col md='6'>
    //                         <Label className='text-uppercase mb-25'>{FM('name')}</Label>
    //                         <p className='text-dark fw-bold text-capitalize'>
    //                             {state.selectedItem?.meeting?.meeting_title}
    //                             {/* <span className='text-dark fw-bold text-capitalize small ms-50'>
    //                 <span
    //                   className={state.selectedItem?.status === 1 ? 'text-success' : 'text-danger'}
    //                 >
    //                   ({state.selectedItem?.status === 1 ? FM('active') : FM('inactive')})
    //                 </span>
    //               </span> */}
    //                         </p>
    //                     </Col>
    //                     <Col md='6'>
    //                         <Label className='text-uppercase mb-25'>{FM('decision')}</Label>
    //                         <p className='text-dark fw-bold text-capitalize'>{state.selectedItem?.decision}</p>
    //                     </Col>
    //                     <Col md='6'>
    //                         <Label className='text-uppercase mb-25'>{FM('duration')}</Label>
    //                         <p className='text-dark fw-bold text-capitalize'>{state.selectedItem?.duration}</p>
    //                     </Col>
    //                     <Col md='6'>
    //                         <Label className='text-uppercase mb-25'>{FM('designation')}</Label>
    //                         <p className='text-dark fw-bold text-capitalize'>
    //                             {state.selectedItem?.meeting?.agenda_of_meeting}
    //                         </p>
    //                     </Col>
    //                 </Row>
    //             </div>
    //         </CenteredModal>
    //     )
    // }

    // handle form errors set active tab
    useEffect(() => {
        if (!isObjEmpty(form.formState.errors)) {
            const keys = Object.keys(form.formState.errors)
            if (
                keys.includes('attendees') &&
                (keys.includes('meeting_title') ||
                    keys.includes('meeting_time') ||
                    keys.includes('meeting_date'))
            ) {
                setActive('1')
            } else {
                setActive('2')
            }

            log('form.formState.errors', form.formState.errors)
        }
    }, [form.formState.errors])

    // table columns
    const columns: TableColumn<any>[] = [
        {
            // minWidth: '500px',
            name: FM('venues'),
            cell: (row) => (
                <Fragment>
                    <span
                        // role={'button'}
                        // onClick={() => {
                        //     setState({
                        //         selectedItem: row
                        //     })
                        // }}
                        className='text-primary'
                    >
                        {row?.venue}
                    </span>
                </Fragment>
            )
        },

        {
            maxWidth: '200px',
            name: FM('action'),
            cell: (row) => (
                <Fragment>
                    <DropDownMenu
                        options={[
                            {
                                //edit
                                icon: <Edit size={14} />,
                                name: FM("edit"),
                                onClick: () => {
                                    setState({
                                        selectedItem: row,
                                        enableEdit: true
                                    })
                                    toggleModalAdd()
                                }
                            },
                            {
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<Trash2 size={14} />}
                                        onDropdown
                                        eventId={`item-delete-${row?.id}`}
                                        text={FM('are-you-sure')}
                                        title={FM('delete-item', { name: row?.notes })}
                                        onClickYes={() => {
                                            handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('delete')}
                                    </ConfirmAlert>
                                )
                            }
                            //   {
                            //     IF: row?.status !== 1,
                            //     noWrap: true,
                            //     name: (
                            //       <ConfirmAlert
                            //         menuIcon={<UserCheck size={14} />}
                            //         onDropdown
                            //         eventId={`item-active`}
                            //         text={FM('are-you-sure')}
                            //         title={FM('active-item', { name: row?.name })}
                            //         onClickYes={() => {
                            //           handleActions(row?.id, 'activate', 'item-active')
                            //         }}
                            //         onSuccessEvent={onSuccessEvent}
                            //       >
                            //         {FM('activate')}
                            //       </ConfirmAlert>
                            //     )
                            //   },
                            //   {
                            //     IF: row?.status === 1,
                            //     noWrap: true,
                            //     name: (
                            //       <ConfirmAlert
                            //         menuIcon={<UserX size={14} />}
                            //         onDropdown
                            //         eventId={`item-inactive`}
                            //         text={FM('are-you-sure')}
                            //         title={FM('inactive-item', { name: row?.name })}
                            //         onClickYes={() => {
                            //           handleActions(row?.id, 'inactivate', 'item-inactive')
                            //         }}
                            //         onSuccessEvent={onSuccessEvent}
                            //       >
                            //         {FM('inactivate')}
                            //       </ConfirmAlert>
                            //     )
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
    const options: TableDropDownOptions = (selectedRows) => [
        {
            noWrap: true,
            name: (
                <ConfirmAlert
                    menuIcon={<Trash2 size={14} />}
                    onDropdown
                    eventId={`item-delete`}
                    text={FM('are-you-sure')}
                    title={FM('delete-selected-user', { count: selectedRows?.selectedCount })}
                    onClickYes={() => {
                        handleActions(selectedRows?.ids, 'delete', 'item-delete')
                    }}
                    onSuccessEvent={onSuccessEvent}
                >
                    {FM('delete')}
                </ConfirmAlert>
            )
        },

    ]

    return (
        <Fragment>
            {renderCreateModal()}
            {/* {renderViewModal()} */}

            <Header icon={<Twitch size='25' />} title={FM('venues')}>
                <ButtonGroup color='dark'>
                    {/* <BsTooltip title={FM('new-notes')}>
                        <NavLink className='' onClick={toggleModalAdd}>
                            <PlusSquare fontSize='large' className={' ' + (modalAdd ? 'text-primary' : '')} />
                        </NavLink>
                    </BsTooltip> */}
                    <LoadingButton tooltip={FM('create-venue')} loading={false} size='sm'
                        color='primary' onClick={toggleModalAdd} >
                        <PlusSquare size='14' />
                    </LoadingButton>
                    <LoadingButton
                        tooltip={FM('reload')}
                        loading={venuesRes.isLoading}
                        size='sm'
                        color='info'
                        onClick={reloadData}
                    >
                        <RefreshCcw size='14' />
                    </LoadingButton>
                </ButtonGroup>
            </Header>
            <CustomDataTable<Meeting>
                initialPerPage={10}
                isLoading={venuesRes.isLoading}
                columns={columns}

                options={options}
                // selectableRows
                searchPlaceholder='search'
                paginatedData={venuesRes?.data as any}
                handlePaginationAndSearch={handlePageChange}
            />
        </Fragment>
    )
}

export default VenueList
