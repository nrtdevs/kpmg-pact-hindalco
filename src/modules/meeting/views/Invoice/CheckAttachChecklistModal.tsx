import { useDebugValue, useEffect, useReducer, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Badge, CardBody, Col, Form, Input, InputGroupText, Label, Row, Spinner } from 'reactstrap'

import {} from '@src/modules/meeting/redux/RTKQuery/InvoiceChecksRTK'
import { stateReducer } from '@src/utility/stateReducer'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import {
  ErrorToast,
  FM,
  JsonParseValidate,
  SuccessToast,
  createConstSelectOptions,
  getKeyByValue,
  isValid,
  isValidArray,
  log,
  setInputErrors,
  setValues
} from '@src/utility/Utils'
import { InvoiceCheckStatus, InvoiceStatus, userType } from '@src/utility/Const'
import {
  useActionInvoiceMutation,
  useInvoiceCheckVerficationMutation,
  useViewInvoiceByIDMutation
} from '../../redux/RTKQuery/InvoiceManagement'
import BsTooltip from '@src/modules/common/components/tooltip'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { watch } from 'fs'
import Show from '@src/utility/Show'
import { AlertTriangle, Circle, User } from 'react-feather'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import Hide from '@src/utility/Hide'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'
import { use } from 'i18next'
import useUser from '@hooks/useUser'

interface States {
  loading?: boolean
  text?: string
  list?: any
  invoiceData?: any
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

export default function CheckAttachChecklistModal<T>(props: T & dataType) {
  const {
    edit = null,
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
    list: [],
    invoiceData: null
  }
  const reducers = stateReducer<States>
  const [state, setState] = useReducer(reducers, initState)
  const user = useUser()
  const [verifyChecklist, res] = useInvoiceCheckVerficationMutation()
  const [viewInvoice, viewInvoiceResponse] = useViewInvoiceByIDMutation()
  //   const [checklistlist, detailsRes] = useLoadInvoiceCheckMutation()
  //   const data = detailsRes?.data?.data
  const form = useForm()

  const { handleSubmit, control, setValue, watch } = form

  const { fields } = useFieldArray({
    control,
    name: 'invoice_check_verifications'
  })

  useEffect(() => {
    if (isValid(edit?.id)) {
      viewInvoice({ jsonData: { id: edit?.id } })
    }
  }, [edit, res])

  useEffect(() => {
    if (viewInvoiceResponse?.isSuccess) {
      setState({
        invoiceData: viewInvoiceResponse?.data?.data
      })
    }
  }, [viewInvoiceResponse])

  log('viewDaqta', state?.invoiceData)

  const handleSave = (data: any) => {
    if (isValid(state?.invoiceData?.id)) {
      log('data', data?.invoice_check_verifications)
      verifyChecklist({
        id: state?.invoiceData?.id,
        jsonData: {
          id: edit?.id,
          invoice_check_verifications: data?.invoice_check_verifications?.map((item, index) => {
            return {
              id: item?.id,
              status: item?.status === 1 ? 'approved' : 'not approved'
            }
          })
        }
      })
    }
  }

  useEffect(() => {
    if (res.isSuccess) {
      SuccessToast(FM('verify-successfully'))
    } else if (res.isError) {
      // handle error
      const errors: any = res.error
      ErrorToast(errors?.message)
    }
  }, [res])

  useEffect(() => {
    if (isValid(state.invoiceData)) {
      setValues<any>(
        {
          invoice_check_verifications: state.invoiceData?.invoice_check_verifications?.map(
            (item, index) => {
              return {
                name: JsonParseValidate(item?.check)?.param,
                id: item?.id,
                required: JsonParseValidate(item?.check)?.status,
                status: item?.status === 'approved' ? 1 : 0
              }
            }
          )
        },
        setValue
      )
    }
  }, [state.invoiceData])

  const isVerifiedShow = () => {
    if (edit?.creator_user_type === user?.user_type) {
      return false
    } else {
      if (
        `${user?.user_type}` == `${userType.epcm}` &&
        `${edit?.creator_user_type}` == `${userType.contractor}`
      ) {
        return true
      } else if (
        `${user?.user_type}` == `${userType.owner}` &&
        `${edit?.creator_user_type}` === `${userType.epcm}`
      ) {
        return true
      }
      return false
    }

    return false
  }

  log('imvoicee data', edit)
  return (
    <>
      {viewInvoiceResponse?.isLoading ? (
        <CardBody>
          <Row className='p-1 m-25'>
            <Col md='12'>
              <Row className='g'>
                <Col md='8'>
                  <Shimmer height={50} />
                </Col>
                <Col md='4'>
                  <Shimmer height={50} />
                </Col>
              </Row>
              <Row>
                <Col md='8'>
                  <Shimmer height={50} />
                </Col>
                <Col md='4'>
                  <Shimmer height={50} />
                </Col>
              </Row>
            </Col>
          </Row>
        </CardBody>
      ) : (
        <Form onSubmit={handleSubmit(handleSave)}>
          <CardBody className=''>
            <Row className='p-1 m-25'>
              {fields?.map((field: any, index) => (
                <>
                  <Col key={field?.id} md='12'>
                    <Row className='g'>
                      <Col md='4' key={index} className='mt-1'>
                        <Label>{field?.name}</Label>
                      </Col>

                      <Col md='3' key={index} className='mt-1'>
                        {field?.required === 'required' ? (
                          <Badge color='light-danger' className=''>
                            <span>{field?.required}</span>
                          </Badge>
                        ) : (
                          <Badge color='light-success' className=''>
                            <span>{field?.required}</span>
                          </Badge>
                        )}
                      </Col>
                      <Col md='3' className='mt-1'>
                        {field?.status === 1 ? (
                          <Badge color='light-success' className=''>
                            {FM('already-approved')}
                          </Badge>
                        ) : (
                          <Badge color='light-danger' className=''>
                            {FM('not-approved')}
                          </Badge>
                        )}
                      </Col>

                      <Col md='1' key={index}>
                        <FormGroupCustom
                          control={control}
                          noGroup
                          noLabel
                          name={`invoice_check_verifications.${index}.id`}
                          type='hidden'
                          isDisabled={true}
                          className='mb-0 p-0 m-0'
                          rules={{ required: false }}
                        />
                        <FormGroupCustom
                          control={control}
                          placeholder={FM('param-status')}
                          isDisabled={field?.status === 1 || !isVerifiedShow()}
                          name={`invoice_check_verifications.${index}.status`}
                          tooltip={FM(
                            'is-param-status-is-checked-it-means-that-this-param-is-required'
                          )}
                          noLabel
                          type='checkbox'
                          className={`mb-2 p-0 m-0`}
                          rules={{ required: true }}
                          prepend={<InputGroupText>#{index + 1}</InputGroupText>}
                        />
                      </Col>

                      <hr />
                    </Row>
                  </Col>
                </>
              ))}
              <Show IF={isVerifiedShow()}>
                <Col md='12'>
                  <LoadingButton
                    disabled={fields.every((item: any) => item.status === 1)}
                    className=''
                    color='primary'
                    type='submit'
                    loading={res?.isLoading}
                  >
                    {FM('verify')}
                  </LoadingButton>
                </Col>
              </Show>
            </Row>
          </CardBody>
        </Form>
      )}
    </>
  )
}
