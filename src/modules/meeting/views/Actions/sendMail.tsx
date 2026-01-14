/* eslint-disable eqeqeq */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Col, Form, Row } from 'reactstrap'
import { useLoadActionSendMutation } from '../../redux/RTKQuery/ActionMangement'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { FM } from '@src/utility/Utils'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { Patterns } from '@src/utility/Const'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

// validation schema
const userFormSchema = {
    subject: yup
        .string()
        .required()
        .matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces'))
}
// validate
const schema = yup.object(userFormSchema).required()

export type MailParamsType = {
    id?: any | null
    status_code?: any | null
    subject?: any | null
    body?: any | null
}

export type CategoryParamsType = {
    id?: string
    name: string
    status?: string
    patent_id?: string
}
interface dataType {
    edit?: MailParamsType
    response?: (e: boolean) => void
    noView?: boolean
    showModal?: boolean
    setShowModal?: (e: boolean) => void
    Component?: any
    loading?: boolean
    children?: any
}

// default values
const defaultValues: MailParamsType = {
    body: '',
    subject: ''
}
export default function PromotionSendModal<T>(props: T & dataType) {
    // form hook
    const form = useForm<MailParamsType>({
        resolver: yupResolver(schema),
        defaultValues
    })
    const { handleSubmit, control, reset, setValue, watch } = form
    const [sendMail, result] = useLoadActionSendMutation()
    const {
        edit = null,
        noView = false,
        showModal = false,
        setShowModal = () => { },
        Component = 'span',
        response = () => { },
        children = null,
        ...rest
    } = props

    const [open, setOpen] = useState(false)

    const openModal = () => {
        setOpen(true)
        reset()
    }
    const closeModal = (from = null) => {
        setOpen(false)
        setShowModal(false)
    }

    useEffect(() => {
        if (noView && showModal) {
            openModal()
        }
    }, [noView, showModal])

    useEffect(() => {
        if (result.isSuccess) {
            response(result.isSuccess)
            reset()
            closeModal()
        }
    }, [result.isSuccess])

    const onSubmit = (e: MailParamsType) => {
        sendMail({
            id: edit?.id,
            subject: e?.subject,
            body: e?.body
        })
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
                modalClass='modal-md'
                disableSave={result.isLoading}
                loading={result.isLoading}
                open={open}
                handleModal={closeModal}
                handleSave={handleSubmit(onSubmit)}
                title={
                    <>
                        <div style={{ overflowWrap: 'anywhere' }}>{FM('follow-up-mail')}</div>
                    </>
                }
            >
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row className='p-2'>
                        <Col md='12'>
                            <FormGroupCustom
                                name={'subject'}
                                label={FM('mail-subject')}
                                type={'text'}
                                onRegexValidation={{
                                    form: form,
                                    fieldName: `subject`
                                }}
                                className='mb-2'
                                control={control}
                                rules={{ required: true }}
                            />
                        </Col>
                        <Col md='12'>
                            <FormGroupCustom
                                name={'body'}
                                type={'textarea'}
                                label={FM('mail-body')}
                                onRegexValidation={{
                                    form: form,
                                    fieldName: `body`
                                }}
                                className='mb-2'
                                control={control}
                                rules={{ required: true }}
                            />
                        </Col>
                    </Row>
                </Form>
            </CenteredModal>
        </>
    )
}
