import { useDebugValue, useEffect, useReducer, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Badge, CardBody, Col, Form, Input, InputGroupText, Label, Row, Spinner } from 'reactstrap'

import {
  useChecklistDetailsMutation,
  useLoadInvoiceCheckMutation
} from '@src/modules/meeting/redux/RTKQuery/InvoiceChecksRTK'
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
import { InvoiceCheckStatus, InvoiceStatus } from '@src/utility/Const'
import {
  useActionInvoiceMutation,
  useExportInvoiceMutation,
  useImportInvoiceMutation
} from '../../redux/RTKQuery/InvoiceManagement'
import BsTooltip from '@src/modules/common/components/tooltip'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { watch } from 'fs'
import Show from '@src/utility/Show'
import { AlertTriangle, Circle, Star, User } from 'react-feather'
import httpConfig from '@src/utility/http/httpConfig'
import {
  useHindranceImportMutation,
  useHindranceSampleFileMutation
} from '../../redux/RTKQuery/HindranceRTK'

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

export default function HindranceImport<T>(props: T & dataType) {
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
  const [hindranceImport, hindranceImportResult] = useHindranceImportMutation()
  const [exportSample, exportSampleResult] = useHindranceSampleFileMutation()
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
    hindranceImport({
      file: state.file[0]
    })
  }

  const handleExportSample = () => {
    exportSample({})
  }

  useEffect(() => {
    if (exportSampleResult?.isSuccess) {
      window.open(httpConfig?.baseUrl2 + exportSampleResult?.data?.data, '_blank')
      //   SuccessToast(FM('sample-file-downloaded-successfully'))
    }
  }, [exportSampleResult])

  useEffect(() => {
    if (noView && showModal) {
      openModal()
    }
  }, [noView, showModal])

  useEffect(() => {
    if (hindranceImportResult?.isSuccess) {
      responseData(true)
      //   SuccessToast(FM('hindrance-imported-successfully'))
      closeModal()
    }
  }, [hindranceImportResult])

  useEffect(() => {
    if (isValid(watch('invoice_check_id'))) {
      setState({
        list: JsonParseValidate(watch('invoice_check_id')?.extra?.check_params)
      })
    }
  }, [watch('invoice_check_id')])

  const hindranceStatus = (status) => {}

  return (
    <>
      {!noView ? (
        <Component role='button' onClick={openModal} {...rest}>
          {children}
        </Component>
      ) : null}
      <CenteredModal
        scrollControl={false}
        modalClass='modal-md'
        loading={hindranceImportResult?.isLoading}
        open={open}
        done={FM('import')}
        // disableSave={!isValid(files[0]) || invoiceActionResult?.isLoading}
        handleModal={closeModal}
        handleSave={handleSubmit(handleSave)}
        title={FM(`import-hindrance`)}
      >
        <div className='text-center'>
          <Star size={20} />
          <p className='mt-2'>
            {' '}
            Please Download This Excel File And Fill All The Details Accordingly After That You Can
            Upload The File To Import Your Items."
          </p>
        </div>
        <div className='text-center mb-1'>
          <u onClick={handleExportSample} style={{ cursor: 'pointer' }}>
            {' '}
            Download Sample File{' '}
          </u>
        </div>
        <Form onSubmit={handleSubmit(handleSave)}>
          <CardBody className=''>
            <Row className='p-1 m-25'>
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
                  label={FM('import-hindrance')}
                />
              </Col>
            </Row>
          </CardBody>
        </Form>
      </CenteredModal>
    </>
  )
}
