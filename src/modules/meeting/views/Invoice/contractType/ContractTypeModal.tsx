import { yupResolver } from '@hookform/resolvers/yup'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { InvoiceStatus, Patterns, priorityType } from '@src/utility/Const'
import Emitter from '@src/utility/Emitter'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { ContractType, Permission, Role } from '@src/utility/types/typeAuthApi'
import {
    createConstSelectOptions,
    ErrorToast,
    FM,
    formatDate,
    isObjEmpty,
    isValid,
    isValidArray,
    JsonParseValidate,
    log,
    setInputErrors,
    setValues,
    stripHtml,
    SuccessToast
} from '@src/utility/Utils'
import { Fragment, useEffect, useReducer, useState } from 'react'
import { Info } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {
    Button,
    Card,
    CardBody,
    Col,
    Form,
    Input,
    InputGroupText,
    InputGroupTextProps,
    Label,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane
} from 'reactstrap'
import * as yup from 'yup'
import { useCreateOrUpdateMeetingMutation } from '../../../redux/RTKQuery/MeetingManagement'
import { useCreateOrUpdateNoteMutation } from '../../../redux/RTKQuery/NotesManagement'
import {
    useCreateOrUpdateRoleMutation,
    useLoadPermissionsMutation
} from '../../../redux/RTKQuery/RoleManagement'
import {
    useContractTypeDetailsMutation,
    useCreateContractTypeMutation,
    useLoadInvoiceCheckMutation
} from '@src/modules/meeting/redux/RTKQuery/InvoiceChecksRTK'
import { AnyARecord } from 'dns'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'

// validation schema
const formSchema = {
    contract_type: yup
        .string()
        .required('Name is required')
        .matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces'))
}
// validate
const schema = yup.object(formSchema).required()

// states
type States = {
    selectedItem?: ContractType
    enableEdit?: boolean
    clickedButton?: string
    invoiceChecks?: any
    selectedPermissions?: any[]
}
// default values
const defaultValues: ContractType = {
    check_lists: [],
    contract_type: '',
    id: undefined
}

// create edit action items
const ContractTypeEdit = ({
    modal,
    reloadCallback = () => { },
    toggleModal,
    data,
    toggleNextModal = (e: any) => { }
}: {
    reloadCallback?: (e?: any) => void
    toggleModal: () => void
    modal: boolean
    data?: ContractType
    toggleNextModal?: (e: any) => void
}) => {
    // params
    const params: any = useParams()
    // form hook
    const form = useForm<ContractType>({
        resolver: yupResolver(schema),
        defaultValues
    })

    const { fields, append } = useFieldArray({
        control: form.control,
        name: 'check_lists'
    })
    // create or update mutation
    const [createContractType, createResponse] = useCreateContractTypeMutation()
    // load permissions
    const [loadInvoiceCheck, loadInvoiceCheckResponse] = useLoadInvoiceCheckMutation()

    // default states
    const initState: States = {
        selectedItem: undefined,
        enableEdit: false,
        clickedButton: '1',
        selectedPermissions: []
    }
    // state reducer
    const reducers = stateReducer<States>
    // state
    const [state, setState] = useReducer(reducers, initState)

    // close modal
    const closeModal = () => {
        setState({
            selectedItem: undefined,
            enableEdit: false,
            selectedPermissions: []
        })
        form.reset()
        toggleModal()
    }

    // handle save
    const handleSave = (formData: any) => {
        log('data', formData)
        if (isValid(data?.id)) {
            createContractType({
                jsonData: {
                    ...formData,
                    id: data?.id,
                    check_lists: formData?.check_lists
                        ?.filter((d: any) => d?.value === 1)
                        .map((item: any) => item?.id)
                }
            })
        } else {
            createContractType({
                jsonData: {
                    ...formData,
                    check_lists: formData?.check_lists
                        ?.filter((d: any) => d?.value === 1)
                        .map((item: any) => item?.id)
                }
            })
        }
    }

    // handle create response
    useEffect(() => {
        if (!createResponse.isUninitialized) {
            if (createResponse.isSuccess) {
                closeModal()
                reloadCallback()
                Emitter.emit('reloadRole', true)
                // SuccessToast(FM('contract-type-added-successfully'))
            } else if (createResponse.isError) {
                // handle error
                const errors: any = createResponse.error
                log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createResponse])

    useEffect(() => {
        if (modal) {
            loadInvoiceCheck({
                jsonData: undefined
            })
        }
    }, [modal, data])

    useEffect(() => {
        if (loadInvoiceCheckResponse.isSuccess) {
            setState({
                invoiceChecks: loadInvoiceCheckResponse.data?.data
            })
        } else if (loadInvoiceCheckResponse.isError) {
            // handle error
            const errors: any = loadInvoiceCheckResponse.error
            log(errors)
        }
    }, [loadInvoiceCheckResponse, data])

    const matchId = (id: any) => {
        return data?.check_lists?.find((item: any) => item?.check_list_id === id) ? 1 : 0
    }
    //setValues
    useEffect(() => {
        if (isValidArray(state.invoiceChecks)) {
            const formValues: any = {
                contract_type: isValid(data?.id) ? data?.contract_type : '',
                check_lists: state.invoiceChecks?.map((item: any) => {
                    return {
                        check: item?.check,
                        value: matchId(item?.id) ? 1 : 0,
                        id: item?.id
                    }
                })
            }
            setValues<ContractType>(formValues, form.setValue)
        }
    }, [state.invoiceChecks, data])

    log('editdata', data)
    // create modal

    return (
        <CenteredModal
            open={modal}
            done={state.enableEdit ? 'save' : 'save'}
            title={isValid(data?.id) ? FM('edit-contract-type') : FM('create-contract-type')}
            hideClose
            scrollControl={false}
            modalClass={'modal-sm'}
            handleModal={closeModal}
            loading={createResponse.isLoading}
            handleSave={form.handleSubmit(handleSave)}
        >
            <div className='p-1' style={{ minHeight: '60vh' }}>
                {loadInvoiceCheckResponse?.isLoading ? (
                    <>
                        <Row>
                            <Col md='12' className='p-1 mb-1'>
                                <Shimmer height={50} />
                            </Col>
                            <Col md='12' className='mb-1'>
                                <Row>
                                    <Col md='12'>
                                        <Shimmer height={50} />
                                    </Col>
                                    <Col md='12'>
                                        <Shimmer height={50} />
                                    </Col>
                                    <Col md='12'>
                                        <Shimmer height={50} />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <Form onSubmit={form.handleSubmit(handleSave)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            <Col md='12'>
                                <FormGroupCustom
                                    label={FM('contract-type')}
                                    name={`contract_type`}
                                    type={'text'}
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'contract_type'
                                    }}
                                    className='mb-50'
                                    control={form?.control}
                                    rules={{ required: true }}
                                />
                            </Col>
                            <hr />
                            <Label className='mb-0'>{FM('checklist')}</Label>
                            {fields.map((field, index) => (
                                <>
                                    <Col md='12'>
                                        <Row className='g'>
                                            {/* <hr className='' /> */}
                                            <FormGroupCustom
                                                name={`check_lists.${index}.id`}
                                                type={'hidden'}
                                                noLabel
                                                className='mb-50'
                                                control={form?.control}
                                                rules={{ required: false }}
                                            />
                                            <Col md='12' key={index}>
                                                <FormGroupCustom
                                                    label={FM('check-params')}
                                                    name={`check_lists.${index}.check`}
                                                    type={'text'}
                                                    onRegexValidation={{
                                                        form: form,
                                                        fieldName: `check_lists.${index}.check`
                                                    }}
                                                    isDisabled
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
                                                                        control={form?.control}
                                                                        placeholder={FM('check-value')}
                                                                        name={`check_lists.${index}.value`}
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
                )}
            </div>
        </CenteredModal>
    )
}

export default ContractTypeEdit
