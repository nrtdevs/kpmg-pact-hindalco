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
    useExportInvoiceMutation
} from '../../redux/RTKQuery/InvoiceManagement'
import BsTooltip from '@src/modules/common/components/tooltip'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { watch } from 'fs'
import Show from '@src/utility/Show'
import { AlertTriangle, Circle, User } from 'react-feather'
import httpConfig from '@src/utility/http/httpConfig'
import useUser from '@hooks/useUser'
import Hide from '@src/utility/Hide'

interface States {
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
    responseData?: (e: boolean) => void
    setShowModal?: (e: boolean) => void
    Component?: any
    loading?: boolean
    children?: any
    // rest?: any
}

export default function InvoiceExportModal<T>(props: T & dataType) {
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
        loading: false,
        search: undefined,
        text: '',
        list: []
    }
    const reducers = stateReducer<States>
    const [state, setState] = useReducer(reducers, initState)
    const [open, setOpen] = useState(false)
    const user = useUser()

    const [invoiceExport, invoiceExportResult] = useExportInvoiceMutation()

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

    const handleSave = (data: any) => {
        //   log('data', data?.invoice_check_verifications)
        invoiceExport({
            jsonData: {
                status: data?.status?.value,
                contractor_id: data?.contractor_id?.value,
                from_date: data?.from_date,
                to_date: data?.to_date
            }
        })
    }

    useEffect(() => {
        if (noView && showModal) {
            openModal()
        }
    }, [noView, showModal])

    useEffect(() => {
        if (invoiceExportResult?.isSuccess) {
            responseData(true)

            closeModal()
        }
    }, [invoiceExportResult])

    useEffect(() => {
        if (isValid(watch('invoice_check_id'))) {
            setState({
                list: JsonParseValidate(watch('invoice_check_id')?.extra?.check_params)
            })
        }
    }, [watch('invoice_check_id')])

    ///dfre
    useEffect(() => {
        if (invoiceExportResult?.isSuccess) {
            window.open(`${httpConfig.baseUrl3}${invoiceExportResult?.data?.data?.url}`, '_blank')
        }
    }, [invoiceExportResult])

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
                loading={invoiceExportResult?.isLoading}
                open={open}
                done={FM('export')}
                // disableSave={!isValid(files[0]) || invoiceActionResult?.isLoading}
                handleModal={closeModal}
                handleSave={handleSubmit(handleSave)}
                title={FM(`export-invoice`)}
            >
                <Form onSubmit={handleSubmit(handleSave)}>
                    <CardBody className=''>
                        <Row className='p-1 m-25'>
                            <Hide IF={user?.user_type !== userType.admin}>
                                <Col md='12'>
                                    <FormGroupCustom
                                        control={form.control}
                                        label={FM('contractors')}
                                        name='contractor_id'
                                        type='select'
                                        async
                                        isClearable
                                        loadOptions={loadDropdown}
                                        path={ApiEndpoints.global_user}
                                        selectLabel={(e) => e?.name}
                                        selectValue={(e) => e.id}
                                        jsonData={{
                                            user_type: userType.contractor
                                        }}
                                        // searchResponse={state?.responseChecklist?.check_group}
                                        defaultOptions
                                        className='mb-1'
                                        rules={{ required: false }}
                                    />
                                </Col>
                            </Hide>
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('from-date')}
                                    name='from_date'
                                    type='date'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('to-date')}
                                    name='to_date'
                                    type='date'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('status')}
                                    isClearable
                                    name='status'
                                    selectOptions={createConstSelectOptions(InvoiceStatus, FM)}
                                    type='select'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col>
                        </Row>
                    </CardBody>
                </Form>
            </CenteredModal>
        </>
    )
}
