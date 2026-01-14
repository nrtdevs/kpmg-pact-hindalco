import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser'
import PhonelinkSetup from '@mui/icons-material/PhonelinkSetup'
import SimpleImageUpload from '@src/modules/common/components/SimpleImageUpload'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import { FM, log } from '@src/utility/Utils'
import { Settings } from '@src/utility/types/typeAuthApi'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardBody, Col, Form, Label, Row } from 'reactstrap'
import * as yup from 'yup'
import {
    useLoadAppSettingMutation,
    useUpdateAppSettingMutation
} from '../../redux/RTKQuery/AppSettingRTK'
import { useAppDispatch } from '@src/redux/store'
import { handleAppSetting } from '@src/redux/layout'
// validation schema
const appSettingSchema = {
    app_name: yup.string().required(),
    address: yup.string().optional(),
    email: yup.string().email().required(),
    mobile_no: yup
        .string()
        .required()
        .when({
            is: (values: string) => values?.length > 0,
            then: (schema) =>
                schema
                    .min(10, FM('mobile-number-must-be-at-least-10-characters'))
                    .max(12, FM('mobile-number-must-be-at-most-12-characters'))
                    .required(),
            otherwise: (schema) => schema.notRequired()
        }),
    log_expiry_days: yup.number().required(),
    description: yup.string().optional()
}

//validate
const schema = yup.object().shape(appSettingSchema)

// states
type States = {
    page?: any
    doNotClose?: boolean
    per_page_record?: any
    filterData?: any
    reload?: any
    isAddingNewData?: boolean
    search?: string
    lastRefresh?: any
    enableEdit?: boolean
    jsonData?: any
}

const AppSetting = () => {
    const form = useForm<Settings>({
        resolver: yupResolver(schema)
    })

    // user
    const user = useUser()
    //check Browse permission
    const canBrowse = Can(Permissions.appSettingsBrowse)
    const dispatch = useAppDispatch()

    //load app setting

    const [loadSetting, res] = useLoadAppSettingMutation()
    const [updateSetting, resUpdate] = useUpdateAppSettingMutation()

    // load details
    // useEffect(() => {
    //     loadSetting()

    // }, [])

    useEffect(() => {
        loadSetting({})
    }, [])

    useEffect(() => {
        form.setValue('app_name', res?.data?.data?.app_name)
        form.setValue('address', res?.data?.data?.address)
        form.setValue('email', res?.data?.data?.email)
        form.setValue('mobile_no', res?.data?.data?.mobile_no)
        form.setValue('log_expiry_days', res?.data?.data?.log_expiry_days)
        form.setValue('description', res?.data?.data?.description)
        form.setValue('support_email', res?.data?.data?.support_email)
        form.setValue('support_phone', res?.data?.data?.support_phone)
        form.setValue('app_logo', res?.data?.data?.app_logo)
    }, [res?.data?.data])

    // handle form submit
    const handleSave = (data: Settings) => {
        updateSetting({
            jsonData: {
                ...data
            }
        })
    }

    useEffect(() => {
        if (resUpdate.isSuccess) {
            dispatch(handleAppSetting(resUpdate.data?.data))
        }
    }, [resUpdate])
    return (
        <>
            <Header title={FM('app-setting')} icon={<PhonelinkSetup />} />
            <Card>
                <CardBody>
                    <Form onSubmit={form.handleSubmit(handleSave)}>
                        {/* <Row className='list-unstyled'>
              <Col md='2'>
                <div>
                  <Label>{FM('app-logo')}</Label>
                </div>
                <SimpleImageUpload
                  style={{ width: 150, height: 200 }}
                  value={watch('app_logo')}
                  name={`app_logo`}
                  className='mb-2'
                  setValue={setValue}
                />
           </Col>
           </Row> */}
                        <Row>
                            <Col md='2'>
                                <div>
                                    <Label>{FM('app-logo')}</Label>
                                </div>
                                <SimpleImageUpload
                                    style={{ width: 150, height: 200 }}
                                    setValue={form.setValue}
                                    value={form.watch('app_logo')}
                                    name={`app_logo`}
                                    className='mb-2'
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md='4'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('app-name')}
                                    defaultValue={res?.data?.data?.app_name}
                                    name='app_name'
                                    type='text'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'app_name'
                                    }}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='4'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('email')}
                                    defaultValue={res?.data?.data?.email}
                                    name='email'
                                    type='email'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='4'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('mobile-number')}
                                    name='mobile_no'
                                    defaultValue={res?.data?.data?.mobile_no}
                                    type='number'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='4'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('address')}
                                    name='address'
                                    defaultValue={res?.data?.data?.address}
                                    type='textarea'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'address'
                                    }}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='4'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('description')}
                                    name='description'
                                    defaultValue={res?.data?.data?.description}
                                    type='textarea'
                                    onRegexValidation={{
                                        form: form,
                                        fieldName: 'description'
                                    }}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>

                            <Col md='4'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('log-expiry-days')}
                                    name='log_expiry_days'
                                    defaultValue={res?.data?.data?.log_expiry_days}
                                    type='number'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md='3'>
                                <LoadingButton
                                    className='btn btn-primary'
                                    loading={resUpdate.isLoading}
                                    type='submit'
                                >
                                    {FM('save')}
                                </LoadingButton>
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </>
    )
}

export default AppSetting
