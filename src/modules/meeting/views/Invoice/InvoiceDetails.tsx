import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { InvoiceResponse } from '@src/utility/types/typeAuthApi'
import {
  CF,
  FM,
  JsonParseValidate,
  SuccessToast,
  formatDate,
  getKeyByValue,
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
import { Download, FilePlus, FileText, User } from 'react-feather'
import httpConfig from '@src/utility/http/httpConfig'
import Show, { Can } from '@src/utility/Show'
import { Permissions } from '@src/utility/Permissions'
import {
  useExportInvoiceLogMutation,
  useLoadInvoiceLogMutation,
  useViewInvoiceByIDMutation
} from '../../redux/RTKQuery/InvoiceManagement'
import CheckAttachChecklistModal from './CheckAttachChecklistModal'
import { InvoiceStatus, InvoiceType, userType } from '@src/utility/Const'
import { TemplateTitle } from '@src/router/routes'

const InvoiceDetails = (props: any) => {
  // location
  const location = useLocation()
  // params
  const params: any = useParams()
  const [loadDetails, res] = useViewInvoiceByIDMutation()
  const canChecklistView = Can(Permissions.checklistBrowse)

  const [viewInvoiceLog, resInvoiceLog] = useLoadInvoiceLogMutation()
  const invoiceLogs = resInvoiceLog?.data?.data ?? []
  const [exportLogs, resLogs] = useExportInvoiceLogMutation()

  // meeting data
  const tempData = res?.data?.data ?? (location?.state as InvoiceResponse)

  const canViewLog = Can(Permissions.invoiceLogs)

  const loadData = () => {
    loadDetails({
      jsonData: {
        id: params?.id
      }
    })
  }
  useEffect(() => {
    if (canViewLog)
      viewInvoiceLog({
        jsonData: {
          id: params?.id
        }
      })
    // log('res', invoiceLogs)
  }, [params, canViewLog])

  const exportData = (id: any) => {
    exportLogs({
      id
    })
  }

  // load details on page
  useEffect(() => {
    if (isValid(params?.id)) {
      loadData()
    }
  }, [params?.id])

  useEffect(() => {
    if (resLogs?.isSuccess) {
      SuccessToast(resLogs?.data?.message)
      window.open(httpConfig?.baseUrl3 + resLogs?.data?.data?.url, '_blank')
    }
  }, [resLogs])
  return (
    <>
      <Row>
        <Col md='12'>
          <Header
            route={props?.route}
            goBack
            title={FM('invoice-details')}
            subHeading={
              <>
                <span
                  className={`badge  badge-pill badge-light-${
                    tempData?.status === InvoiceStatus.approved
                      ? 'success'
                      : tempData?.status === InvoiceStatus.rejected
                      ? 'danger'
                      : tempData?.status === InvoiceStatus.pending
                      ? 'warning'
                      : tempData?.status === InvoiceStatus['on-hold']
                      ? 'dark'
                      : 'info'
                  }`}
                >
                  {isValid(tempData?.last_action_performed_by?.name)
                    ? FM('status-by-name-to-contractor-for-reason', {
                        name: tempData?.last_action_performed_by?.name,
                        // reason: tempData?.description,
                        status: FM(getKeyByValue(InvoiceStatus, tempData?.status))
                      })
                    : FM(getKeyByValue(InvoiceStatus, tempData?.status))}
                </span>
              </>
            }
          >
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
              {/* <Row>
                <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bolder mb-25'>{FM('title')}</Label>
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
                  <Label className='text-uppercase text-dark fw-bolder mb-25'>{FM('status')}</Label>
                  <p className='text-capitalize'>{tempData?.status ?? 'N/A'}</p>
                </Col>
                <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bolder mb-25'>
                    {FM('contractor-name')}
                  </Label>
                  <p className='text-capitalize'>{tempData?.vendor_name ?? 'N/A'}</p>
                </Col>
                <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bolder mb-25'>
                    {FM('contractor-contact-number')}
                  </Label>
                  <p className='text-capitalize'>{tempData?.vendor_contact_number ?? 'N/A'}</p>
                </Col>
                <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bolder mb-25'>
                    {FM('reason-of-rejection')}
                  </Label>
                  <p className='text-capitalize'>{tempData?.reason_of_rejection ?? 'N/A'}</p>
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
              </Row> */}
              <Row>
                <Col md='6'>
                  <Row className='align-items-center mb-1'>
                    <Col md='1'>
                      <User className='text-success' size={25} />
                    </Col>
                    <Col md='8'>
                      <p className='text-success mb-0'>{FM('contractor-details')}</p>
                      {/* <p className='text-muted small mb-0'>{FM('edit-description')}</p> */}
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col md='12'>
                      <Label className='text-uppercase text-dark fw-bold mb-25'>
                        {FM('contractor-name')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.vendor_name}</p>
                    </Col>
                    <Col md='12'>
                      <Label className='text-uppercase text-dark fw-bold mb-25'>
                        {FM('contractor-email')}
                      </Label>
                      <p className='text-dark  text-capitalize'>
                        {tempData?.vendor_contact_email ?? 'N/A'}
                      </p>
                    </Col>
                    <Col md='12'>
                      <Label className='text-uppercase text-dark fw-bold mb-25'>
                        {FM('contractor-mobile-no')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.vendor_contact_number ?? 'N/A'}</p>
                    </Col>
                  </Row>
                </Col>
                {/* <Col md='4'>
                  <Row className='align-items-center mb-1'>
                    <Col md='1'>
                      <User className='text-primary' size={25} />
                    </Col>
                    <Col md='8'>
                      <p className='text-primary mb-0'>{FM('epcm-user-details')}</p>
                     
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col md='12'>
                      <Label className='text-uppercase text-dark fw-bold mb-25'>{FM('name')}</Label>
                      <p className='text-capitalize'>{tempData?.epcm?.name}</p>
                    </Col>
                    <Col md='12'>
                      <Label className='text-uppercase text-dark fw-bold mb-25'>
                        {FM('email')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.epcm?.email ?? 'N/A'}</p>
                    </Col>
                    <Col md='12'>
                      <Label className='text-uppercase text-dark fw-bold mb-25'>
                        {FM('mobile-number')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.epcm?.mobile_number ?? 'N/A'}</p>
                    </Col>
                  </Row>
                </Col> */}
                <Col md='6'>
                  <Row className='align-items-center mb-1'>
                    <Col md='1'>
                      <User className='text-dark' size={25} />
                    </Col>
                    <Col md='8'>
                      <p className='text-dark mb-0'>{FM('owner-details')}</p>
                      {/* <p className='text-muted small mb-0'>{FM('edit-description')}</p> */}
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col md='12'>
                      <Label className='text-uppercase text-dark fw-bold mb-25'>
                        {FM('owner-name')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.owner?.name}</p>
                    </Col>
                    <Col md='12'>
                      <Label className='text-uppercase text-dark fw-bold mb-25'>
                        {FM('owner-email')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.owner?.email ?? 'N/A'}</p>
                    </Col>
                    <Col md='12'>
                      <Label className='text-uppercase text-dark fw-bold mb-25'>
                        {FM('owner-mobile-number')}
                      </Label>
                      <p className='text-capitalize'>{tempData?.owner?.mobile_number ?? 'N/A'}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </CardBody>
          </Card>
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
                  <h2>{FM('contract-details')} </h2>
                </Col>
              </Row>
              <ScrollBar>
                <Table bordered striped className='mt-2'>
                  <thead>
                    <tr>
                      <th style={{ minWidth: 130 }}>{FM('contract-number')}</th>
                      <th style={{ minWidth: 250 }}>{FM('package-of-contract-no')}</th>
                      {/* <th style={{ minWidth: 150 }}>{FM('created-by')}</th> */}
                      <th style={{ minWidth: 150 }}>{FM('name-of-epcm')}</th>
                      <th style={{ minWidth: 150 }}>{FM('email-of-epcm')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempData?.epcms?.map((a) => (
                      <tr>
                        <td>{tempData.contract_number}</td>
                        <td>{tempData.package}</td>
                        <td>{a?.epcm?.name}</td>
                        <td>{a?.epcm?.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ScrollBar>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h2>{FM('other-details')}</h2>
              <Row>
                <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bold mb-25'>
                    {FM('invoice-no')}
                  </Label>
                  <p className=' text-capitalize'>{tempData?.invoice_no ?? 'N/A'}</p>
                </Col>
                <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bold mb-25'>
                    {FM('invoice-type')}
                  </Label>
                  <p className='text-capitalize'>
                    {getKeyByValue(InvoiceType, tempData?.invoice_type)}
                  </p>
                </Col>
                <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bold mb-25'>{FM('package')}</Label>
                  <p className=' text-capitalize'>{tempData?.package ?? 'N/A'}</p>
                </Col>
                <Show IF={isValid(tempData?.reason_of_rejection)}>
                  <Col md='4'>
                    <Label className='text-uppercase text-dark fw-bold mb-25'>
                      {FM('reason-of-rejection')}
                    </Label>
                    <p className=' text-capitalize'>{tempData?.reason_of_rejection ?? 'N/A'}</p>
                  </Col>
                </Show>

                <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bolder mb-25'>{FM('notes')}</Label>
                  <p className='text-capitalize'>{tempData?.notes ?? 'N/A'}</p>
                </Col>
                {/* <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bolder mb-25'>
                    {FM('priority')}
                  </Label>
                  <p className='text-capitalize'>{tempData?.notes ?? 'N/A'}</p>
                </Col> */}
                <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bolder mb-25'>
                    {FM('basic-amount')}
                  </Label>
                  <p className='text-capitalize'>{CF(tempData?.basic_amount) ?? 'N/A'}</p>
                </Col>
                <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bolder mb-25'>
                    {FM('gst-amount')}
                  </Label>
                  <p className='text-capitalize'>{CF(tempData?.gst_amount) ?? 'N/A'}</p>
                </Col>
                <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bolder mb-25'>
                    {FM('total-amount')}
                  </Label>
                  <p className='text-capitalize'>{CF(tempData?.total_amount) ?? 'N/A'}</p>
                </Col>
              </Row>
              <Row>
                <Col md='4'>
                  <Label className='text-uppercase text-dark fw-bolder mb-25'>{FM('status')}</Label>
                  <p className='text-capitalize'>
                    <span
                      className={`badge  badge-pill badge-light-${
                        tempData?.status === InvoiceStatus.approved
                          ? 'success'
                          : tempData?.status === InvoiceStatus.rejected
                          ? 'danger'
                          : tempData?.status === InvoiceStatus.pending
                          ? 'warning'
                          : tempData?.status === InvoiceStatus['on-hold']
                          ? 'dark'
                          : 'info'
                      }`}
                    >
                      {isValid(tempData?.last_action_performed_by?.name)
                        ? FM('status-by-name-to-contractor-for-reason', {
                            name: tempData?.last_action_performed_by?.name,
                            // reason: tempData?.description,
                            status: FM(getKeyByValue(InvoiceStatus, tempData?.status))
                          })
                        : FM(getKeyByValue(InvoiceStatus, tempData?.status))}
                    </span>
                  </p>
                </Col>
                <Col md='8'>
                  <Label className='text-uppercase text-dark fw-bolder mb-25'>
                    {FM('description')}
                  </Label>
                  <p className='text-capitalize'>{tempData?.description ?? 'N/A'}</p>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Show IF={isValidArray(tempData?.invoice_check_verifications) && canChecklistView}>
            <Card>
              <CardBody>
                <h2>{FM('verify-attach-checklist')}</h2>
                <Col md='12'>
                  <>
                    <hr />

                    <Row>
                      <CheckAttachChecklistModal edit={tempData} />
                    </Row>
                  </>
                </Col>
              </CardBody>
            </Card>
          </Show>
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
                                        String(e?.file_extension)?.includes('jpg')
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
          <Show IF={canViewLog && isValidArray(invoiceLogs)}>
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
                    <h2>{FM('invoice-logs')} </h2>
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
                        title={FM('export-invoice-logs')}
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
                        {/* <th style={{ minWidth: 150 }}>{FM('created-by')}</th> */}
                        <th style={{ minWidth: 150 }}>{FM('created-at')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceLogs?.map((a) => (
                        <tr>
                          <td>{a?.action}</td>
                          <td>{a?.description}</td>
                          {/* <td>
                            {a?.performed_by?.name}({a?.performed_by?.email})
                          </td> */}
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
  )
}

export default InvoiceDetails
