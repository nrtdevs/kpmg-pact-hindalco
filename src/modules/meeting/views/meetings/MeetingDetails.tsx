import PictureAsPdf from '@mui/icons-material/PictureAsPdf'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import Header from '@src/modules/common/components/header'
import BsTooltip from '@src/modules/common/components/tooltip'
import Emitter from '@src/utility/Emitter'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import { Meeting, MeetingNote } from '@src/utility/types/typeMeeting'
import { fastLoop, FM, formatDate, isValid, isValidArray, log } from '@src/utility/Utils'
import { useEffect, useReducer, useState } from 'react'
import { Bookmark, Download, Edit, ExternalLink, RefreshCcw, Send } from 'react-feather'
import { defaultStyles, FileIcon } from 'react-file-icon'
import { useLocation, useParams } from 'react-router-dom'
import {
  Badge,
  Button,
  ButtonGroup,
  ButtonProps,
  Card,
  CardBody,
  Col,
  Form,
  Row,
  TabContent,
  TabPane
} from 'reactstrap'
import { useViewMeetingByIdMutation } from '../../redux/RTKQuery/MeetingManagement'
import MeetingNotes from './MeetingNotes'

import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import httpConfig from '@src/utility/http/httpConfig'
import { stateReducer } from '@src/utility/stateReducer'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import {
  useExportMeetingLogMutation,
  useExportMeetingPdfMutation,
  useMeetingPdfLogMutation,
  useSendDraftMailMutation
} from '../../redux/RTKQuery/NotesManagement'
import CreateEditAction from './CreateEditActionItems'
import CreateEditMeeting from './CreateEditMeeting'
import CreateEditNote from './CreateEditNote'

type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedItem?: Meeting
  enableEdit?: boolean
}

const defaultValues: MeetingNote = {
  //   meeting_title: '',
  //   meeting_time: '',
  //   meeting_date: '',
  //   agenda_of_meeting: '',
  //   douments: null,
  //   attendees: null
}

const userFormSchema = {
  // user_id: yup.string().required(),
  // all_attendees: yup.number().required(),
}
// validate
const schema = yup.object(userFormSchema).required()

const MeetingDetails = (props: any) => {
  // location
  const location = useLocation()
  // params
  const params: any = useParams()
  // ** State
  const [active, setActive] = useState('1')
  // load details
  const [loadDetails, res] = useViewMeetingByIdMutation()
  const canEditMeeting = Can(Permissions.meetingEdit)
  // check delete permission
  const canDeleteMeeting = Can(Permissions.meetingDelete)
  // check notes add permission
  const canAddNotes = Can(Permissions.notesAdd)
  // check notes edit permission
  const canEditNotes = Can(Permissions.notesEdit)
  // check notes delete permission
  const canDeleteNotes = Can(Permissions.notesDelete)
  // check action add permission
  const canAddAction = Can(Permissions.actionItemsAdd)
  // check action edit permission
  const canEditAction = Can(Permissions.actionItemsEdit)

  const form = useForm<MeetingNote>({
    resolver: yupResolver(schema),
    defaultValues
  })

  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    enableEdit: false,
    lastRefresh: new Date().getTime()
  }

  const reducers = stateReducer<States>

  const [state, setState] = useReducer(reducers, initState)

  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // invite modal
  const [modalInvite, toggleModalInvite] = useModal()
  // toggle add modal
  const [modalEdit, toggleModalEdit] = useModal()

  //toggle PfViewModal
  const [modalPfView, toggleModalPfView] = useModal()
  // toggle add modal
  const [modalActionAdd, toggleModalActionAdd] = useModal()
  // user hook
  const user = useUser()
  const [exportLog, resExport] = useExportMeetingLogMutation()
  // send draft mail
  const [sendDraftMail, resSendDraftMail] = useSendDraftMailMutation()
  // export PDF
  const [exportPDF, resExportPDF] = useExportMeetingPdfMutation()
  const [pdfLog, resPfLog] = useMeetingPdfLogMutation()
  //external attendies
  const [extraAtt, setExtaAtt] = useState<any[]>([])
  // meeting data
  const tempData = res?.data?.data
  console.log('tempData', tempData)

  let venue: any
  //make tempData.venues as array
  if (tempData?.venues) {
    venue = tempData.venues.split(',')
  }
  // toggle tab
  const toggle = (tab: string) => {
    if (active !== tab) {
      setActive(tab)
    }
  }

  // load details
  const loadData = () => {
    loadDetails(params?.id)
  }

  // load details on page
  useEffect(() => {
    if (isValid(params?.id)) {
      loadData()
    }
  }, [params?.id])

  useEffect(() => {
    if (params?.id && modalPfView === true) {
      pdfLog(params?.id)
    }
  }, [modalPfView])

  // reload Data
  const reloadData = () => {
    Emitter.emit('reloadNotes', true)
    loadData()
  }

  // reload Data
  useEffect(() => {
    Emitter.on('reloadMeeting', (data: boolean) => {
      reloadData()
    })
    return () => {
      Emitter.off('reloadMeeting', (data: boolean) => {})
    }
  }, [])

  log('pfLog', resPfLog?.data?.data?.body)

  const exportData = () => {
    exportLog(params?.id)
  }

  const exportPdfData = () => {
    exportPDF(params?.id)
  }

  const closeDraftModal = () => {
    form.reset()
    toggleModalInvite()
  }

  const closePdfViewModal = () => {
    toggleModalPfView()
  }

  useEffect(() => {
    if (resExport.isSuccess && resExport?.data?.data?.url) {
      window.open(`${httpConfig.baseUrl2}${resExport?.data?.data?.url}`, '_blank')
    }
  }, [resExport])
  useEffect(() => {
    if (resExportPDF.isSuccess && resExportPDF?.data?.data) {
      window.open(`${resExportPDF?.data?.data}`, '_blank')
    }
  }, [resExportPDF])
  useEffect(() => {
    if (resSendDraftMail.isSuccess && resSendDraftMail?.data?.data) {
      toast.success(resSendDraftMail?.data?.message)
      closeDraftModal()
      form.reset()
    }
  }, [resSendDraftMail])

  const handleInviteActions = (data: any) => {
    sendDraftMail({
      jsonData: {
        meeting_id: tempData?.id,
        // attendees: data?.attendees,
        attendees: form.watch('attendees')?.map((e) => e?.value),
        meeting_logs: isValid(form.watch('meeting_logs')) ? 1 : 0,
        follow_up_logs: isValid(form.watch('follow_up_logs')) ? 1 : 0,
        mom: isValid(form.watch('mom')) ? 1 : 0
      }
    })
  }
  log('attendies', tempData?.attendees)

  const isValidAttendees = () => {
    //find user_id in tempData.attendees then return true
    if (tempData?.attendees?.find((e) => e?.user_id === user?.id)) {
      return true
    } else {
      if (tempData?.organised_by === user?.id) {
        return true
      } else if (user?.role_id === 1) {
        return true
      }
    }

    return false
  }

  log('isValidAttendees', isValidAttendees())

  const modifyAttendies = (creatable: string) => {
    if (creatable) {
      const newEmails = creatable.split(',')

      const oldEmails = form.watch('attendees')?.map((e) => e?.value)

      const finalEmails = oldEmails ? [...oldEmails, ...newEmails] : newEmails

      const uniqueEmails = finalEmails.filter((v, i, a) => a.indexOf(v) === i)

      const finalData = uniqueEmails.map((e) => ({ value: e, label: e }))
      form.setValue('attendees', finalData)
    }
  }

  useEffect(() => {
    // modifyAttendies()
  }, [])

  const stringToHtml = (str: string) => {
    const htmlString = str
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    // FIND IMG TAGS
    const imgTags = doc.getElementsByTagName('img')

    // LOOP THROUGH IMG TAGS
    for (let i = 0; i < imgTags.length; i++) {
      const img = imgTags[i]
      if (i === 0) {
        img.setAttribute('src', `${httpConfig.companyLogo}`) // Replace 'path/to/first/image.png' with the actual URL of the first image
      } else {
        img.setAttribute('src', `${httpConfig.clientLogo}`) // Replace 'path/to/second/image.png' with the actual URL of the second image
      }
    }

    // Convert the modified HTML back to a string
    const modifiedHtmlString = new XMLSerializer().serializeToString(doc)

    // Render the modified HTML
    return <div dangerouslySetInnerHTML={{ __html: modifiedHtmlString }} />
  }

  const renderPdfViewModal = () => {
    return (
      <CenteredModal
        open={modalPfView}
        handleModal={closePdfViewModal}
        title={FM('pdf-preview')}
        done={FM('export-meeting-pdf')}
        scrollControl={true}
        handleSave={exportPdfData}
        hideClose
        modalClass={'modal-lg'}
      >
        {resPfLog.isLoading ? (
          <div className='align-center'>
            <Shimmer height={'700px'} />
          </div>
        ) : (
          <div className='p-2'>{stringToHtml(resPfLog?.data?.data?.body)}</div>
        )}
      </CenteredModal>
    )
  }

  // render invite modal
  const renderInviteModal = () => {
    return (
      <CenteredModal
        open={modalInvite}
        handleModal={closeDraftModal}
        title={FM('draft')}
        done='Send'
        scrollControl={false}
        handleSave={handleInviteActions}
        // size='lg'
      >
        <div className='p-2'>
          <Form>
            <Row>
              <Col md='12'>
                <p className='text-dark mb-0'>
                  {FM('user')} <span className='text-danger fw-bold'>*</span>
                </p>
                <p className='text-muted small'>{FM('please-add-at-least-one-user')}</p>
              </Col>
              {/* <Col md='12'>
                              
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('select-all-attendees')}
                                    name='all_attendees'
                                    type='checkbox'
                                    className='mb-2'
                                    rules={{ required: false }}
                                />
                            </Col> */}
              {/* <Hide IF={form.watch("all_attendees") === 1}> */}
              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('search')}
                  name='attendees'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.global_user}
                  modifySelectData={(e) => {
                    const re: any[] = []
                    fastLoop(e, (data) => {
                      // if (data?.id !== user?.id) re.push(data)
                      re.push(data)
                    })
                    return re
                  }}
                  onCreateOption={modifyAttendies}
                  selectLabel={(e) => (e?.email !== e?.name ? `${e.email} ` : `${e.email} `)}
                  selectValue={(e) => e.email}
                  noLabel
                  defaultOptions
                  creatable
                  isMulti
                  errorMessage={FM('please-enter-a-valid-email')}
                  createLabel='add'
                  type='select'
                  className='mb-2'
                  rules={{ required: true }}
                />
              </Col>
              {/* </Hide> */}
              <Col md='4' sm='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('meeting-log')}
                  name='meeting_logs'
                  type='checkbox'
                  className='mb-2'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4' sm='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('follow-up-logs')}
                  name='follow_up_logs'
                  type='checkbox'
                  className='mb-2'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4' sm='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('mom')}
                  name='mom'
                  type='checkbox'
                  className='mb-2'
                  rules={{ required: false }}
                />
              </Col>
            </Row>
          </Form>
        </div>
      </CenteredModal>
    )
  }

  return (
    <div>
      {renderPdfViewModal()}
      {renderInviteModal()}
      <CreateEditMeeting data={{ ...tempData }} modal={modalEdit} toggleModal={toggleModalEdit} />
      <CreateEditNote
        meeting={tempData}
        data={{ ...state?.selectedItem, type: 'note' }}
        modal={modalAdd}
        toggleModal={toggleModalAdd}
        toggleNextModal={(e) => {
          if (e) {
            log('e', e)
            toggleModalActionAdd()
            setTimeout(() => {
              setState({ selectedItem: e })
            }, 1000)
          }
        }}
      />
      <CreateEditAction
        meeting={tempData}
        note={state?.selectedItem}
        modal={modalActionAdd}
        toggleModal={toggleModalActionAdd}
      />
      <Row>
        <Col md='12'>
          <Header route={props?.route} goBack title={tempData?.meeting_title}>
            <ButtonGroup color='dark'>
              <BsTooltip<ButtonProps>
                Tag={Button}
                className='btn-primary'
                color='primary'
                size='sm'
                onClick={() => {
                  setState({
                    selectedItem: undefined,
                    enableEdit: false
                  })
                  // form.reset()
                  toggleModalInvite()
                }}
                title={FM('send-draft')}
              >
                <Send size={'14'} />
              </BsTooltip>
              <BsTooltip<ButtonProps>
                Tag={Button}
                className='btn-secondary'
                color='secondary'
                size='sm'
                onClick={() => {
                  exportData()
                }}
                title={FM('export-meeting-log')}
              >
                <Download size={'14'} />
              </BsTooltip>
              <BsTooltip<ButtonProps>
                Tag={Button}
                className='btn-primary'
                color='primary'
                size='sm'
                onClick={() => {
                  // exportPdfData()
                  toggleModalPfView()
                }}
                title={FM('export-meeting-pdf')}
              >
                <PictureAsPdf fontSize='small' />
              </BsTooltip>
              <Show
                IF={
                  canAddNotes &&
                  (user?.id === tempData?.organiser?.id || user?.roles?.name === 'client')
                }
              >
                <BsTooltip<ButtonProps>
                  Tag={Button}
                  className='btn-secondary'
                  color='secondary'
                  size='sm'
                  onClick={() => {
                    setState({
                      selectedItem: undefined,
                      enableEdit: false
                    })
                    // form.reset()
                    toggleModalAdd()
                  }}
                  title={FM('add-note')}
                >
                  <Bookmark size='14' className={'ficon ' + (modalEdit ? 'text-white' : '')} />
                  {/* <GetApp size='5px' /> */}
                </BsTooltip>
              </Show>
              <Show
                IF={
                  canEditMeeting &&
                  (tempData?.organiser?.id === user?.id || user?.roles?.name === 'client')
                }
              >
                <BsTooltip<ButtonProps>
                  Tag={Button}
                  className='btn-primary'
                  color='primary'
                  size='sm'
                  onClick={() => {
                    setState({
                      selectedItem: undefined,
                      enableEdit: false
                    })
                    // form.reset()
                    toggleModalEdit()
                  }}
                  title={FM('edit-meeting')}
                >
                  <Edit size='14' className={'ficon ' + (modalEdit ? 'text-white' : '')} />
                  {/* <GetApp size='5px' /> */}
                </BsTooltip>
              </Show>
              <LoadingButton
                tooltip={FM('reload')}
                loading={res.isLoading}
                size='sm'
                color='info'
                onClick={reloadData}
              >
                <RefreshCcw size='14' />
              </LoadingButton>
            </ButtonGroup>
          </Header>

          {/* <Card className=''>
            <CardBody className='p-1 mb-0 pb-0'>
              <Nav pills className=''>
                <NavItem>
                  <NavLink
                    active={active === '1'}
                    onClick={() => {
                      toggle('1')
                    }}
                  >
                    {FM('details')}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    active={active === '2'}
                    onClick={() => {
                      toggle('2')
                    }}
                  >
                    {FM('add-note')}
                  </NavLink>
                </NavItem>
              </Nav>
            </CardBody>
          </Card> */}

          <TabContent className='py-0' activeTab={active}>
            <TabPane tabId='1'>
              <Card className=''>
                <CardBody className='mb-0'>
                  <Row>
                    <Col md='8'>
                      <div className='mb-1'>
                        <div className='mb-1'>
                          <h5 className='mb-50 fw-bolder text-dark'>{FM('organizer')}</h5>
                          <p className='mb-50'>{tempData?.organiser?.name ?? 'N/A'}</p>
                        </div>
                        <h5 className='mb-50 fw-bolder text-dark'>
                          {FM('meeting-time')}{' '}
                          <Show IF={isValid(tempData?.meeting_link)}>
                            <BsTooltip
                              title={
                                <>
                                  {tempData?.meeting_link}
                                  <hr />
                                  {FM('join-meeting')}
                                </>
                              }
                            >
                              <a href={tempData?.meeting_link} target='_blank'>
                                <ExternalLink style={{ marginTop: -5 }} size={16} />
                              </a>
                            </BsTooltip>
                          </Show>
                        </h5>
                        <p className='mb-50'>
                          {formatDate(tempData?.meeting_date)} |{' '}
                          {formatDate(`2022-12-12 ${tempData?.meeting_time_start}`, 'HH:mm A')} -
                          {formatDate(`2022-12-12 ${tempData?.meeting_time_end}`, 'HH:mm A')}
                        </p>
                      </div>
                      <div className='mb-1'>
                        <h5 className='mb-50 fw-bolder text-dark'>{FM('meeting-ref-no')}</h5>
                        <p className='mb-50'>{tempData?.meeting_ref_no ?? 'N/A'}</p>
                      </div>

                      <div className='mb-1'>
                        <h5 className='mb-50 fw-bolder text-dark'>{FM('agenda')}</h5>
                        <p className='mb-50'>
                          {/* <div
                                                        dangerouslySetInnerHTML={{
                                                            __html:
                                                                DOMPurify.sanitize(
                                                                    makeLinksClickable(tempData?.agenda_of_meeting) ?? ''
                                                                ) ?? ''
                                                        }}
                                                    /> */}
                          <div
                            dangerouslySetInnerHTML={{ __html: `${tempData?.agenda_of_meeting}` }}
                          />
                        </p>
                      </div>
                      <div className='mb-1'>
                        <h5 className='mb-50 fw-bolder text-dark'>{FM('venues')}</h5>
                        {venue?.map((a) => (
                          <Badge color='light-success' className='m-25'>
                            {a}
                          </Badge>
                        ))}
                        {/* <p className='mb-50'>{tempData?.venues ?? 'N/A'}</p> */}
                      </div>
                      <div className='mb-1'>
                        <h5 className='mb-1 fw-bolder text-dark'>{FM('documents')}</h5>
                        {/* <p className='text-muted'>{FM('add-or-download-attachment')}</p> */}
                        {tempData?.documents?.map((a) => (
                          <div className='file-list mb-50'>
                            <FileIcon
                              extension={a.file_extension}
                              {...defaultStyles[a.file_extension]}
                            />
                            <a href={a?.document} target={'_blank'}>
                              {a?.uploading_file_name}
                            </a>
                          </div>
                        ))}
                      </div>
                    </Col>
                    <Col md='4' className='border-start'>
                      <Show IF={isValidArray(tempData?.attendees)}>
                        <div className='mb-1 pb-1 border-bottom'>
                          <h5 className='mb-50 fw-bolder text-dark'>{FM('attendees')}</h5>
                          {tempData?.attendees?.map((a) => (
                            <Badge color='light-primary' className='m-25'>
                              {a?.user?.email}
                            </Badge>
                          ))}
                        </div>
                      </Show>
                    </Col>
                    {/* <Col md='12'>
                      <p
                        role={'button'}
                        className='text-primary mb-0 fw-bold small mt-2 text-uppercase'
                      >
                        {FM('update-meeting')}
                      </p>
                    </Col> */}
                  </Row>
                </CardBody>
              </Card>
              <Show IF={isValidAttendees()}>
                <MeetingNotes meeting={tempData as any} />
              </Show>
            </TabPane>
          </TabContent>
        </Col>
        <Col md='3'></Col>
      </Row>
    </div>
  )
}

export default MeetingDetails
