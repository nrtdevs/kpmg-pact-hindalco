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
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import { useCreateOrUpdateInvoiceCheckMutation } from '@src/modules/meeting/redux/RTKQuery/InvoiceChecksRTK'
import { stateReducer } from '@src/utility/stateReducer'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import * as yup from 'yup'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import {
    FM,
    createConstSelectOptions,
    getKeyByValue,
    isValid,
    log,
    setValues
} from '@src/utility/Utils'
import { InvoiceCheckStatus, InvoiceStatus } from '@src/utility/Const'
import { yupResolver } from '@hookform/resolvers/yup'
import { InvoiceCheksResponse } from '@src/utility/types/typeAuthApi'
import BsTooltip from '@src/modules/common/components/tooltip'
import Show from '@src/utility/Show'
import { Plus, Trash2 } from 'react-feather'

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

const userFormSchema = {
    //   package: yup
    //     .object({
    //       label: yup.string().required(),
    //       value: yup.string().required()
    //     })
    //     .nullable()
    //     .required('required'),
    //   vendor_name: yup
    //     .string()
    //     .required()
    //     // match alphabets and spaces only
    //     .matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces')),
    //   vendor_contact_email: yup.string().email().required(FM('email-must-be-a-valid-email')),
    //   description: yup.string().when({
    //     is: (values: string) => values?.length > 0,
    //     then: (schema) =>
    //       schema.matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces')),
    //     otherwise: (schema) => schema.notRequired()
    //   }),
    //invoice_number
    //   invoice_number: yup
    //     .string()
    //     .notRequired()
    //     .when({
    //       is: (values: string) => values?.length > 0,
    //       then: (schema) =>
    //         schema
    //           .min(5, FM('mobile-number-must-be-at-least-5-characters'))
    //           .max(244, FM('invoice-number-must-be-at-most-244-characters'))
    //           .required(),
    //       otherwise: (schema) => schema.notRequired()
    //     }),
    //   vendor_contact_number: yup
    //     .string()
    //     .notRequired()
    //     .test((value) => {
    //       if (value?.includes('-')) {
    //         return false
    //       } else {
    //         return true
    //       }
    //     })
    //     .when({
    //       is: (values: string) => values?.length > 0,
    //       then: (schema) =>
    //         schema
    //           .min(10, FM('mobile-number-must-be-at-least-10-characters'))
    //           .max(12, FM('mobile-number-must-be-at-most-12-characters'))
    //           .required(),
    //       otherwise: (schema) => schema.notRequired()
    //     })
    //   password: yup.string().when('id', {
    //     is: (values: string) => !isValid(values),
    //     then: (schema) => schema.required(),
    //     otherwise: (schema) => schema.notRequired()
    //   }),
    //   'confirm-password': yup.string().when('id', {
    //     is: (values: string) => !isValid(values),
    //     then: (schema) =>
    //       schema.required().oneOf([yup.ref('password'), null], FM('passwords-must-match')),
    //     otherwise: (schema) => schema.notRequired().oneOf([])
    //   })
}
// validate
const schema = yup.object(userFormSchema).required()

const defaultValues: InvoiceCheksResponse = {
    id: undefined,
    checks: [
        {
            check: undefined,
            value: undefined
        }
    ]
}

export default function ChecklistModal<T>(props: T & dataType) {
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

    const canAddChecklist = Can(Permissions.checklistAdd)
    const canEditChecklist = Can(Permissions.checklistEdit)
    const canViewChecklist = Can(Permissions.checklistRead)

    const [createInvoice, createInvoiceResponse] = useCreateOrUpdateInvoiceCheckMutation()

    const form = useForm<InvoiceCheksResponse>({
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

    const handleSave = (data: InvoiceCheksResponse) => {
        log('checkdata', data)
        createInvoice({
            jsonData: {
                ...data,
                checks: data?.checks?.map((item) => {
                    return {
                        param: item?.param,
                        status: item?.status === 1 ? 'required' : 'optional'
                    }
                })
            }
        })
    }
    ///////////////

    useEffect(() => {
        if (noView && showModal) {
            openModal()
        }
    }, [noView, showModal])

    //////
    useEffect(() => {
        if (createInvoiceResponse?.isSuccess) {
            responseData(createInvoiceResponse?.data)
            closeModal()
        }
    }, [createInvoiceResponse])
    ///////////
    useEffect(() => {
        if (isValid(edit)) {
            log('edit', edit)
            setValues<any>(
                {
                    invoice_check_verifications: edit?.invoice_check_verifications?.map((e) => ({
                        checklist_id: edit?.invoice_check_id,
                        status: {
                            label: getKeyByValue(InvoiceCheckStatus, `${e?.status}`),
                            value: e?.status
                        }
                    }))
                },
                form.setValue
            )
        }
    }, [edit])

    //append
    useEffect(() => {
        if (fields?.length === 0) {
            append({})
        }
    }, [fields])

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
                loading={createInvoiceResponse?.isLoading}
                open={open}
                // disableSave={!isValid(files[0]) || invoiceActionResult?.isLoading}
                handleModal={closeModal}
                handleSave={form.handleSubmit(handleSave)}
                title={FM(`verify-invoice`)}
            >
                <div className='p-2'>
                    <Form onSubmit={form.handleSubmit(handleSave)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            <Col md='12'>
                                <FormGroupCustom
                                    label={FM('contract-type')}
                                    name='contract_type'
                                    type='text'

                                    onRegexValidation={{
                                        form: form,
                                        fieldName: `contract_type`
                                    }}
                                    className={'mb-1 border-bottom'}
                                    control={form.control}
                                    rules={{ required: false }}
                                />
                            </Col>

                            <Label className='text-uppercase mb-1'>{FM('check-params')}</Label>
                            {fields.map((field, index) => (
                                <>
                                    <Col md='12'>
                                        <Row className='g'>
                                            {/* <hr className='' /> */}

                                            <Col md='12' key={index}>
                                                <FormGroupCustom
                                                    label={FM('check-params')}
                                                    name={`check_params.${index}.param`}
                                                    type={'text'}

                                                    onRegexValidation={{
                                                        form: form,
                                                        fieldName: `check_params.${index}.param`
                                                    }}
                                                    noLabel
                                                    className='mb-50'
                                                    prepend={
                                                        <>
                                                            <InputGroupText>#{index + 1}</InputGroupText>
                                                            <InputGroupText>
                                                                <BsTooltip
                                                                    title={FM(
                                                                        'is-param-status-is-checked-it-means-that-this-param-is-required'
                                                                    )}
                                                                >
                                                                    <FormGroupCustom
                                                                        control={form.control}
                                                                        placeholder={FM('param-status')}
                                                                        name={`check_params.${index}.status`}
                                                                        tooltip={FM(
                                                                            'is-param-status-is-checked-it-means-that-this-param-is-required'
                                                                        )}
                                                                        noGroup
                                                                        noLabel
                                                                        type='checkbox'
                                                                        rules={{ required: false }}
                                                                        prepend={<InputGroupText>#{index + 1}</InputGroupText>}
                                                                    />
                                                                </BsTooltip>
                                                            </InputGroupText>
                                                        </>
                                                    }
                                                    append={
                                                        <>
                                                            <BsTooltip<InputGroupTextProps>
                                                                Tag={InputGroupText}
                                                                role={'button'}
                                                                className='btn-icon'
                                                                title={FM('remove')}
                                                                onClick={() => {
                                                                    remove(index)
                                                                }}
                                                            >
                                                                <Trash2 size={16} className='text-danger' />
                                                            </BsTooltip>

                                                            <Show IF={index === fields?.length - 1}>
                                                                <BsTooltip<InputGroupTextProps>
                                                                    Tag={InputGroupText}
                                                                    title={FM('add-more')}
                                                                    role={'button'}
                                                                    className='btn-icon'
                                                                    onClick={() => {
                                                                        append({})
                                                                    }}
                                                                >
                                                                    <Plus size={16} className='text-primary' />
                                                                </BsTooltip>
                                                            </Show>
                                                        </>
                                                    }
                                                    control={form?.control}
                                                    rules={{ required: false }}
                                                />
                                            </Col>
                                            {/* </Hide> */}
                                        </Row>
                                    </Col>
                                </>
                            ))}
                        </Row>
                    </Form>
                </div>
            </CenteredModal>
        </>
    )
}
