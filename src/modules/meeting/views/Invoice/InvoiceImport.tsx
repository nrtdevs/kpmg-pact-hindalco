import { useDebugValue, useEffect, useReducer, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Badge, CardBody, Col, Form, Input, InputGroupText, Label, Row, Spinner } from 'reactstrap'

import { useChecklistDetailsMutation } from '@src/modules/meeting/redux/RTKQuery/InvoiceChecksRTK'
import { stateReducer } from '@src/utility/stateReducer'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import {
  FM,
  JsonParseValidate,
  SuccessToast,
  createConstSelectOptions,
  getKeyByValue,
  isValid,
  isValidArray,
  log,
  setValues
} from '@src/utility/Utils'
import { InvoiceCheckStatus, InvoiceStatus, userType } from '@src/utility/Const'
import {
  useActionInvoiceMutation,
  useImportInvoiceMutation,
  useInvoiceSampleFileMutation
} from '../../redux/RTKQuery/InvoiceManagement'
import BsTooltip from '@src/modules/common/components/tooltip'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { watch } from 'fs'
import Show from '@src/utility/Show'
import { AlertTriangle, Circle, Star, User } from 'react-feather'
import httpConfig from '@src/utility/http/httpConfig'
import { useHindranceSampleFileMutation } from '../../redux/RTKQuery/HindranceRTK'

interface States {
  loading?: boolean
  text?: string
  list?: any
  file?: any
  search?: any
}
type FormData = {
  qr_code: string
  email_address: string
  contact_person_name: string
  contact_person_number: number
  street_address: string
  city: string
  state: string
  zip_code: number
  latitude: string | number
  longitude: string | number
  subscription_type: any
  payment_type: any | null
  amount_per_transaction: number | null
  amount: number | null
}
interface dataType {
  edit?: any
  noView?: boolean
  subCatStoreID?: any
  showModal?: boolean
  active?: boolean
  responseData?: (e: boolean) => void
  setShowModal?: (e: boolean) => void
  Component?: any
  loading?: boolean
  children?: any
  // rest?: any
}

export default function InvoiceImport<T>(props: T & dataType) {
  const {
    edit = null,
    noView = false,
    active = false,
    showModal = false,
    responseData = () => {},
    setShowModal = () => {},
    Component = 'span',
    children = null,
    ...rest
  } = props

  const initState: States = {
    loading: false,
    search: undefined,
    text: '',
    list: []
  }
  const reducers = stateReducer<States>
  const [state, setState] = useReducer(reducers, initState)
  const [open, setOpen] = useState(false)

  //   const [attachInvoice, res] = useAttachInvoiceMutation()
  const [invoiceImport, invoiceImportResult] = useImportInvoiceMutation()
  const [exportSample, exportSampleResult] = useInvoiceSampleFileMutation()
  //   const [checklistlist, detailsRes] = useLoadInvoiceCheckMutation()
  //   const data = detailsRes?.data?.data
  const form = useForm()

  const { handleSubmit, control, setValue, watch } = form

  const openModal = () => {
    setOpen(true)
    form.reset()

    setState({
      list: []
    })
  }
  const closeModal = (from = null) => {
    setOpen(false)
    setShowModal(false)
  }

  const handleSave = () => {
    //   log('data', data?.invoice_check_verifications)
    if (isValidArray(watch('epcms')) && isValid(watch('contractor_id')) && isValid(state.file[0])) {
      const epcms: any = {}

      if (isValidArray(watch('epcms'))) {
        watch('epcms')?.map((e: any, i: number) => (epcms[`epcms[${i}]`] = e?.value))
      }

      invoiceImport({
        file: state.file[0],
        contractor_id: watch('contractor_id')?.value,
        ...epcms
      })
    }
  }
  const handleExportSample = () => {
    exportSample({})
  }
  useEffect(() => {
    if (exportSampleResult?.isSuccess) {
      window.open(httpConfig?.baseUrl2 + exportSampleResult?.data?.data, '_blank')
    }
  }, [exportSampleResult])

  useEffect(() => {
    if (noView && showModal) {
      openModal()
    }
  }, [noView, showModal])

  useEffect(() => {
    if (invoiceImportResult?.isSuccess) {
      responseData(true)
      SuccessToast(invoiceImportResult?.data?.message)
      closeModal()
    }
  }, [invoiceImportResult])

  useEffect(() => {
    if (isValid(watch('invoice_check_id'))) {
      setState({
        list: JsonParseValidate(watch('invoice_check_id')?.extra?.check_params)
      })
    }
  }, [watch('invoice_check_id')])

  return (
    <>
      {!noView ? (
        <Component role='button' onClick={openModal} {...rest}>
          {children}
        </Component>
      ) : null}
      <CenteredModal
        scrollControl={false}
        modalClass='modal-sm'
        loading={invoiceImportResult?.isLoading}
        open={open}
        done={FM('import')}
        // disableSave={!isValid(files[0]) || invoiceActionResult?.isLoading}
        handleModal={closeModal}
        handleSave={handleSubmit(handleSave)}
        title={FM(`import-invoice`)}
      >
        <Form onSubmit={handleSubmit(handleSave)}>
          <CardBody className=''>
            <Row className='p-1 m-25'>
              <Col md='12'>
                <FormGroupCustom
                  key={`ewrw`}
                  control={form.control}
                  label={FM('epcm')}
                  isMulti
                  name='epcms'
                  type='select'
                  async
                  isClearable
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.users_list_dropdown}
                  selectLabel={(e) => e?.name}
                  selectValue={(e) => e.id}
                  jsonData={{
                    user_type: userType.epcm
                  }}
                  // searchResponse={state?.responseChecklist?.check_group}
                  defaultOptions
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='12'>
                <FormGroupCustom
                  key={`dsfeqw`}
                  control={form.control}
                  label={FM('contractors')}
                  name='contractor_id'
                  type='select'
                  async
                  isClearable
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.users_list_dropdown}
                  selectLabel={(e) => e?.name}
                  selectValue={(e) => e.id}
                  jsonData={{
                    user_type: userType.contractor
                  }}
                  // searchResponse={state?.responseChecklist?.check_group}
                  defaultOptions
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              {/* <Col md='12'>
                <FormGroupCustom
                  key={`package`}
                  control={form.control}
                  label={FM('package')}
                  name='package_id'
                  type='select'
                  async
                  isClearable
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.packages_list}
                  selectLabel={(e) => e?.name}
                  selectValue={(e) => e.id}
                  jsonData={{
                    user_type: userType.contractor
                  }}
                  // searchResponse={state?.responseChecklist?.check_group}
                  defaultOptions
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col> */}
              <Col md='12'>
                <Input
                  accept='.xlsx,.xls,.csv'
                  type={'file'}
                  noLabel
                  name='file'
                  onChange={(e) =>
                    setState({
                      file: e?.target?.files
                    })
                  }
                  // className='m-'
                  label={FM('import-invoice')}
                />
              </Col>
            </Row>
          </CardBody>
        </Form>
        <div className='text-center'>
          <Star size={20} className='text-warning' />
          <p className='mt-2'>
            {' '}
            Please Download This Excel File And Fill All The Details Accordingly After That You Can
            Upload The File To Import Your Items."
          </p>
        </div>
        <div className='text-center text-warning mb-1'>
          <u onClick={handleExportSample} style={{ cursor: 'pointer' }}>
            {' '}
            Download Sample File{' '}
          </u>
        </div>
      </CenteredModal>
    </>
  )
}
