import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  useHindranceLogExportMutation,
  useViewHindranceByIdMutation
} from '../../redux/RTKQuery/HindranceRTK'
import { HindranceResponse } from '@src/utility/types/typeAuthApi'
import {
  FM,
  JsonParseValidate,
  SuccessToast,
  formatDate,
  isValid,
  isValidArray,
  log
} from '@src/utility/Utils'
import {
  Badge,
  Button,
  ButtonGroup,
  ButtonProps,
  Card,
  CardBody,
  Col,
  Label,
  ListGroup,
  ListGroupItem,
  Row,
  Table
} from 'reactstrap'
import Header from '@src/modules/common/components/header'
import ScrollBar from 'react-perfect-scrollbar'
import BsTooltip from '@src/modules/common/components/tooltip'
import { Download, File, FileText } from 'react-feather'
import httpConfig from '@src/utility/http/httpConfig'
import Show, { Can } from '@src/utility/Show'
import { Permissions } from '@src/utility/Permissions'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'

const HindranceDetail = (props: any) => {
  // location
  const location = useLocation()
  // params
  const params: any = useParams()
  const [loadDetails, res] = useViewHindranceByIdMutation()

  const [exportLogs, resLogs] = useHindranceLogExportMutation()
  const [active, setActive] = useState('1')
  // meeting data
  const tempData = res?.data?.data ?? (location?.state as HindranceResponse)

  const canViewLog = Can(Permissions.hindranceLogs)

  const loadData = () => {
    loadDetails(params?.id)
  }

  const exportData = (id: any) => {
    exportLogs({
      id: params?.id
    })
  }

  // load details on page
  useEffect(() => {
    if (isValid(params?.id)) {
      loadData()
    }
  }, [params?.id])

  const loadStatus = (tempData: any) => {
    if (tempData?.status === 'under_review_by_owner') {
      return <div>{FM('under-review-by-owner')}</div>
    } else if (tempData?.status === 'resolved') {
      return <div>{FM('resolved')}</div>
    } else if (tempData?.status === 'approved') {
      return <div>{FM('approved')}</div>
    } else if (tempData?.status === 'rejected_by_owner') {
      return (
        <div>
          {' '}
          <Badge pill color='danger'>
            {' '}
            {FM('rejected-by-owner')}{' '}
          </Badge>
        </div>
      )
    } else if (tempData?.status === 'rejected_by_epcm') {
      return <div> <Badge pill color='danger'>{FM('rejected-by-epcm')}</Badge></div>
    } else if (tempData?.status === 'rejected_admin') {
      return (
        <div>
          <Badge pill color='danger'>
            {FM('rejected-by-admin')}
          </Badge>
        </div>
      )
    } else if (tempData?.status === 'under_review_by_epcm') {
      return <div>{FM('under-review-by-epcm')}</div>
    } else if (tempData?.status === 'on_hold') {
      return <div>{FM('on-hold')}</div>
    } else {
      return <div>{FM('pending')}</div>
    }
  }

  const loadPriority = (tempData: any) => {
    if (tempData?.priority === '1') {
      return <div> <Badge pill color='danger'>{FM('high')}</Badge></div>
    } else if (tempData?.priority === '2') {
      return (
        <div>
          <Badge pill color='warning'>
            {FM('medium')}
          </Badge>
        </div>
      )
    } else {
      return <div> <Badge pill color='info'>{FM('low')}</Badge></div>
    }
  }

  useEffect(() => {
    if (resLogs?.isSuccess) {
      SuccessToast(resLogs?.data?.message)
      window.open(httpConfig?.baseUrl3 + resLogs?.data?.data?.url, '_blank')
    }
  }, [resLogs])

  log(JsonParseValidate(tempData?.uploaded_files))

  return (
    <>
      {res?.isLoading ? (
        <>
          <Shimmer style={{ width: '100%', height: 50, marginBottom: 5, marginTop: 5 }} />
          <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
          <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
          <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
          <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
          <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
          <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
          <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
          <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
        </>
      ) : (
        <>
          <Row>
            <Col md='12'>
              <Header route={props?.route} goBack title={tempData?.title}>
                <ButtonGroup color='dark'>
                  {/* <LoadingButton
                tooltip={FM('reload')}
                loading={res.isLoading}
                size='sm'
                color='info'
                onClick={reloadData}
              >
                <RefreshCcw size='14' />
              </LoadingButton> */}
                </ButtonGroup>
              </Header>
              <Card>
                <CardBody>
                  <Row>
                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('title')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.title}</p>
                    </Col>
                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('project-name')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.project?.name ?? 'N/A'}</p>
                    </Col>
                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('owner-details')}
                      </Label>
                      <p className='text-capitalize'>
                        {tempData?.owner?.name ?? 'N/A'} ( {tempData?.owner?.email ?? 'N/A'})
                      </p>
                    </Col>
                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('hindrance-code')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.hindrance_code ?? 'N/A'}</p>
                    </Col>
                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('hindrance-type')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.hindrance_type ?? 'N/A'}</p>
                    </Col>
                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('package')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.package ?? 'N/A'}</p>
                    </Col>
                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('status')}
                      </Label>
                      <p className='text-capitalize'>{loadStatus(tempData)}</p>
                    </Col>
                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('contractor-name')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.vendor_name ?? 'N/A'}</p>
                    </Col>
                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('pending-with')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.vendor_contact_number ?? 'N/A'}</p>
                    </Col>

                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('resolved-date')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.resolved_date ?? 'N/A'}</p>
                    </Col>
                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('approved-date')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.approved_date ?? 'N/A'}</p>
                    </Col>
                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('priority')}
                      </Label>
                      <p className='text-capitalize'>{loadPriority(tempData)}</p>
                    </Col>
                  </Row>
                  <Row>
                    {/* <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('description')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.description ?? 'N/A'}</p>
                    </Col> */}
                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('description-of-issue')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.notes ?? 'N/A'}</p>
                    </Col>

                    <Col md='4'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('remarks')}
                      </Label>
                      <p className='text-capitalize fw-bolder'>{tempData?.reason_of_rejection ?? 'N/A'}</p>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h2>{FM('other-details')}</h2>
                  <Row className='mt-2'>
                    <Col md='3'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('contractor-name')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.contractor?.name ?? 'N/A'}</p>
                    </Col>
                    <Col md='3'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('contractor-email')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.contractor?.email ?? 'N/A'}</p>
                    </Col>
                    <Col md='3'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('epcm-name')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.epcm?.name ?? 'N/A'}</p>
                    </Col>
                    <Col md='3'>
                      <Label className='text-uppercase text-dark fw-bolder mb-25'>
                        {FM('epcm-email')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.epcm?.email ?? 'N/A'}</p>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <h2>{FM('assignees')}</h2>
                  <Col md='12'>
                    <ScrollBar>
                      <Table bordered striped>
                        <thead>
                          <tr>
                            <th style={{ minWidth: 130 }}>{FM('name')}</th>
                            <th style={{ minWidth: 150 }}>{FM('email')}</th>
                            <th style={{ minWidth: 250 }}>{FM('mobile-number')}</th>
                            <th style={{ minWidth: 150 }}>{FM('assign-date')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tempData?.assignees?.map((a) => (
                            <tr>
                              <td>{a?.assigned_to?.name}</td>
                              <td>{a?.assigned_to?.email}</td>
                              <td>{a?.assigned_to?.mobile_number}</td>
                              <td>{formatDate(a?.created_at, 'DD MMM YYYY HH:mm A')} </td>
                              <td>{tempData?.reason_for_assigning}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </ScrollBar>
                  </Col>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h2>{FM('documents')}</h2>
                  <Col md='12'>
                    <Show IF={isValidArray(JsonParseValidate(tempData?.uploaded_files))}>
                      <hr />
                      <Row>
                        <Col md='12' className=''>
                          <ListGroup className='my-2'>
                            {JsonParseValidate(tempData?.uploaded_files)?.map((e: any) => {
                              return (
                                <>
                                  <ListGroupItem
                                    key={`${e?.file_name}`}
                                    className='d-flex align-items-center justify-content-between'
                                  >
                                    <div className='file-details d-flex align-items-center'>
                                      <div className='file-preview me-1'>
                                        {/* <img
                                          className='rounded'
                                          src={
                                            String(e?.file_extension)
                                              ? e?.file_name
                                              : 'a'
                                          }
                                          height='28'
                                          width='28'
                                        /> */}
                                        <FileText size={28} />
                                      </div>
                                      <div>
                                        <p className='file-name mb-0'>{e?.uploading_file_name}</p>
                                      </div>
                                    </div>
                                    <Button
                                      color='primary'
                                      outline
                                      size='sm'
                                      className='btn-icon'
                                      onClick={() => window.open(e?.file_name, '_blank')}
                                    >
                                      <Download size={14} />
                                    </Button>
                                  </ListGroupItem>
                                </>
                              )
                            })}
                          </ListGroup>
                        </Col>
                      </Row>
                    </Show>
                  </Col>
                </CardBody>
              </Card>
              {/* <Show IF={tempData?.hindrance_activity_logs?.length > 0}> */}
              <Show IF={canViewLog}>
                <Card>
                  <CardBody>
                    {/* <div className='d-flex justify-content-between'>
                    </div>
              <h2>{FM('hindrance-logs')}   </h2> */}
                    <Row className='justify-content-between mx-0 '>
                      <Col
                        className='d-flex align-items-center justify-content-start mt-1'
                        md='3'
                        sm='12'
                      >
                        <h2>{FM('hindrance-logs')} </h2>
                      </Col>
                      <Col
                        className='d-flex align-items-center justify-content-end mt-1'
                        md='3'
                        sm='12'
                      >
                        <ButtonGroup color='primary'>
                          <BsTooltip<ButtonProps>
                            className='btn-primary'
                            Tag={Button}
                            size='sm'
                            onClick={() => {
                              // navigate('/hindrance-type')
                              exportData(params?.id)
                            }}
                            title={FM('export-hindrance-logs')}
                          >
                            {/* <NoteAlt size='15px' /> */}
                            <Download size='15px' />
                          </BsTooltip>
                        </ButtonGroup>
                      </Col>
                    </Row>
                    <ScrollBar>
                      <Table bordered striped className='mt-2'>
                        <thead>
                          <tr>
                            <th style={{ minWidth: 130 }}>{FM('action')}</th>
                            <th style={{ minWidth: 250 }}>{FM('description')}</th>
                            <th style={{ minWidth: 150 }}>{FM('created-by')}</th>
                            <th style={{ minWidth: 150 }}>{FM('performed-by')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tempData?.hindrance_activity_logs?.map((a) => (
                            <tr>
                              <td>{a?.action}</td>
                              <td>{a?.description}</td>
                              <td>
                                {a?.performed_by?.name}({a?.performed_by?.email})
                              </td>
                              <td>{formatDate(a?.created_at, 'DD MMM YYYY HH:mm A')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </ScrollBar>
                  </CardBody>
                </Card>
              </Show>
              {/* </Show> */}
            </Col>
          </Row>
        </>
      )}
    </>
  )
}

export default HindranceDetail
