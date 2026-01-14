import { useEffect, useReducer, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {
    CardBody,
    Col,
    Form,
    Input,
    InputGroupText,
    InputGroupTextProps,
    Label,
    Row,
    Spinner
} from 'reactstrap'

import { useCreateOrUpdateInvoiceCheckMutation } from '@src/modules/meeting/redux/RTKQuery/InvoiceChecksRTK'
import { stateReducer } from '@src/utility/stateReducer'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import * as yup from 'yup'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import {
    FM,
    SuccessToast,
    createConstSelectOptions,
    getKeyByValue,
    isValid,
    log,
    setValues
} from '@src/utility/Utils'
import { InvoiceCheckStatus, InvoiceStatus, userType } from '@src/utility/Const'
import { yupResolver } from '@hookform/resolvers/yup'
import { InvoiceCheksResponse } from '@src/utility/types/typeAuthApi'
import BsTooltip from '@src/modules/common/components/tooltip'
import Show from '@src/utility/Show'
import { Plus, Trash2 } from 'react-feather'
import { useActionInvoiceMutation } from '../../redux/RTKQuery/InvoiceManagement'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { SHA1 } from 'crypto-js'

interface States {
    lastRefresh?: any
    subCategoryArr?: Array<any>
    categoryParent?: any
    subcatParent?: any
    categoryList?: Array<any>
    categoryListFlat?: Array<any>
    ip?: boolean
    patient?: boolean
    languageList?: any
    language_id?: any
    loading?: boolean
    text?: string
    list?: any

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
    responseData?: (e: any) => void
    setShowModal?: (e: boolean) => void
    Component?: any
    loading?: boolean
    children?: any
    // rest?: any
}

const userFormSchema = {}
// validate
const schema = yup.object(userFormSchema).required()

const defaultValues: any = {
    id: undefined,
    description: ''
}

export default function InvoiceActionModal<T>(props: T & dataType) {
    const {
        edit = null,
        noView = false,
        active = false,
        showModal = false,
        responseData = () => { },
        setShowModal = () => { },
        Component = 'span',
        children = null,
        ...rest
    } = props

    const initState: States = {
        lastRefresh: new Date().getTime(),
        languageList: [],
        categoryList: [],
        categoryListFlat: [],
        subCategoryArr: [],
        language_id: null,
        ip: false,
        patient: false,
        loading: false,
        search: undefined,
        text: '',
        list: []
    }
    const reducers = stateReducer<States>
    const [state, setState] = useReducer(reducers, initState)
    const [open, setOpen] = useState(false)

    const [invoiceAction, invoiceActionResult] = useActionInvoiceMutation()

    const form = useForm<any>({
        resolver: yupResolver(schema),
        defaultValues
    })

    const { fields, append, remove } = useFieldArray({
        control: form?.control,
        name: 'check_params'
    })

    const openModal = () => {
        setOpen(true)
        setState({})
    }
    const closeModal = (from = null) => {
        setOpen(false)
        setShowModal(false)
    }

    const handleSave = (data: any) => {
        if (isValid(edit?.id)) {
            invoiceAction({
                ids: [edit?.id],
                action: edit?.action,
                eventId: edit?.id,
                jsonData: {
                    ids: [edit?.id],
                    action: edit?.action,
                    description: data?.description
                }
            })
        }
    }
    ///////////////

    useEffect(() => {
        if (noView && showModal) {
            openModal()
        }
    }, [noView, showModal])

    //////
    useEffect(() => {
        if (invoiceActionResult?.isSuccess) {
            SuccessToast(invoiceActionResult?.data?.message)
            responseData(invoiceActionResult)
            closeModal()
        }
    }, [invoiceActionResult])

    //append
    useEffect(() => {
        if (fields?.length === 0) {
            append({})
        }
    }, [fields])

    const saveButtonText = () => {
        if (edit?.action === 'approved') {
            return FM('approve')
        } else if (edit?.action === 'paid') {
            return FM('paid')
        } else if (edit?.action === 'rejected') {
            return FM('reject')
        } else if (edit?.action === 'on_hold') {
            return FM('on-hold')
        } else if (edit?.action === 'under_review_by_owner') {
            return FM('under-review-by-owner')
        } else if (edit?.action === 'sent_for_payment') {
            return FM('sent-for-payment')
        } else if (edit?.action === 'under_review_by_epcm') {
            return FM('under-review-by-epcm')
        }
    }
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
                loading={invoiceActionResult?.isLoading}
                open={open}
                // disableSave={!isValid(files[0]) || invoiceActionResult?.isLoading}
                handleModal={closeModal}
                done={saveButtonText()}
                handleSave={form.handleSubmit(handleSave)}
                title={FM(`invoice-action`, { action: edit?.statusTitle })}
            >
                <div className='p-2'>
                    <Form onSubmit={form.handleSubmit(handleSave)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            {/* <Show IF={edit?.action === 're-assign'}>
                <Col md='12'>
                  <FormGroupCustom
                    control={form.control}
                    async
                    label={FM('user')}
                    name='assigned_to'
                    isClearable
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.users_list_dropdown}
                    //   selectLabel={(e) => `${e.epcm_id} `}
                    selectLabel={(e) => e?.name}
                    selectValue={(e) => e?.id}
                    defaultOptions
                    jsonData={{
                      user_type: userType.contractor
                    }}
                    type='select'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
              </Show> */}
                            <Col md='12'>
                                <FormGroupCustom
                                    label={FM('description')}
                                    name='description'
                                    type='text'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `description`
                                    }}
                                    className={'mb-1 border-bottom'}
                                    control={form.control}
                                    rules={{ required: false }}
                                />
                            </Col>
                        </Row>
                    </Form>
                </div>
            </CenteredModal>
        </>
    )
}
