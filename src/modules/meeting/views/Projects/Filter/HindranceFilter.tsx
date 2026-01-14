import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import SideModal from '@src/modules/common/components/sideModal/sideModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { hindranceAction1, priorityTypes } from '@src/utility/Const'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import { FM, createConstSelectOptions } from '@src/utility/Utils'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { HindranceResponse } from '@src/utility/types/typeAuthApi'
import React, { FC, Fragment } from 'react'
import { Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonProps, Col, Label, Row } from 'reactstrap'

type FilterProps = {
    handleFilterData: (e: any) => void
}

const defaultValues: HindranceResponse = {
    //   role_id: 2,
    epcm_id: '',
    contractor_id: '',
    owner_id: '',
    created_at: '',
    title: '',
    hindrance_code: '',
    status: '',
    priority: '',
    approved_date: ''
}

const HindranceFilter: FC<FilterProps> = (props) => {

    const canViewUser = Can(Permissions.userBrowse)
    // toggle modal
    const [modal, toggleModal] = useModal()

    // form hook
    const form = useForm<HindranceResponse>({
        defaultValues
    })

    // reset form on modal close
    React.useEffect(() => {
        if (!modal) {
            form.reset(defaultValues)
        }
    }, [modal])

    return (
        <Fragment>
            <BsTooltip<ButtonProps>
                onClick={toggleModal}
                Tag={Button}
                title={FM('filter')}
                size='sm'
                className='badge-light-dark'
            >
                <Sliders size='14' />
            </BsTooltip>
            <SideModal
                handleSave={form.handleSubmit(props.handleFilterData)}
                open={modal}
                handleModal={() => {
                    toggleModal()
                }}
                title={FM('filter')}
                done='filter'
            >
                <Row>
                    <Col md='12'>
                        {/* <p className='text-dark mb-0'>{FM('filter-invoice')}</p> */}
                        {/* <p className='text-muted small'>{FM('filter-users-description')}</p> */}
                    </Col>
                    {/* <Col md='12'>
              <FormGroupCustom
                control={form.control}
                label={FM('contractor-name')}
                name='contractor_id'
                type='text'
                className='mb-1'
                rules={{ required: false }}
              />
            </Col> */}
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={FM('title')}
                            name='title'
                            type='text'
                            onRegexValidation={{
                                form: form,
                                fieldName: 'title'
                            }}
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={FM('hindrance-code')}
                            name='hindrance_code'
                            type='text'
                            onRegexValidation={{
                                form: form,
                                fieldName: 'hindrance_code'
                            }}
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    <Show IF={canViewUser}>
                        <Col md='12'>
                            <FormGroupCustom
                                control={form.control}
                                async
                                label={FM('contractor-name')}
                                name='contractor_id'
                                isClearable
                                loadOptions={loadDropdown}
                                path={ApiEndpoints.global_user}
                                //   selectLabel={(e) => `${e.epcm_id} `}
                                selectLabel={(e) => `${e.name} | ${e.email} `}
                                selectValue={(e) => e.id}
                                defaultOptions
                                jsonData={{
                                    user_type: 4
                                }}
                                type='select'
                                className='mb-1'
                                rules={{ required: false }}
                            />
                        </Col>
                        <Col md='12'>
                            <FormGroupCustom
                                control={form.control}
                                async
                                label={FM('epcm-name')}
                                name='epcm_id'
                                isClearable
                                loadOptions={loadDropdown}
                                path={ApiEndpoints.global_user}
                                //   selectLabel={(e) => `${e.epcm_id} `}
                                selectLabel={(e) => `${e.name} | ${e.email} `}
                                selectValue={(e) => e.id}
                                defaultOptions
                                jsonData={{
                                    user_type: 3
                                }}
                                type='select'
                                className='mb-1'
                                rules={{ required: false }}
                            />
                        </Col>
                        <Col md='12'>
                            <FormGroupCustom
                                control={form.control}
                                async
                                label={FM('owner-name')}
                                name='owner_id'
                                isClearable
                                loadOptions={loadDropdown}
                                path={ApiEndpoints.global_user}
                                //   selectLabel={(e) => `${e.epcm_id} `}
                                selectLabel={(e) => `${e.name} | ${e.email} `}
                                selectValue={(e) => e.id}
                                defaultOptions
                                jsonData={{
                                    user_type: 2
                                }}
                                type='select'
                                className='mb-1'
                                rules={{ required: false }}
                            />
                        </Col>
                    </Show>
                    {/* <Col md='12'>
              <FormGroupCustom
                control={form.control}
                label={FM('notes')}
                name='notes'
                type='text'
                className='mb-1'
                rules={{ required: false }}
              />
            </Col> */}
                    {/* <Col md='12'>
              <FormGroupCustom
                control={form.control}
                label={FM('contractor-mobile-no')}
                name='contractor_contact_number'
                type='number'
                className='mb-1'
                rules={{ required: false }}
              />
            </Col> */}
                    <Col md='12'>
                        <FormGroupCustom
                            label={FM('status')}
                            type={'select'}
                            isClearable
                            defaultOptions
                            control={form.control}
                            selectOptions={createConstSelectOptions(hindranceAction1, FM)}
                            name={'status'}
                            className='mb-2'
                        />
                    </Col>
                    <Col md='12'>
                        <FormGroupCustom
                            label={FM('priority')}
                            type={'select'}
                            isClearable
                            defaultOptions
                            control={form.control}
                            selectOptions={createConstSelectOptions(priorityTypes, FM)}
                            name={'priority'}
                            className='mb-2'
                        />
                    </Col>
                    <Col md='12'>
                        <FormGroupCustom
                            label={FM('approved-date')}
                            type={'date'}
                            control={form.control}
                            // selectOptions={createConstSelectOptions(hindranceAction1, FM)}
                            name={'approved_date'}
                            className='mb-2'
                        />
                    </Col>
                    {/* <Col md='12'>
            <Label>{FM('status')}</Label>
            <div className='d-flex'>
              <FormGroupCustom
                control={form.control}
                label={FM('active')}
                name='status'
                type='radio'
                defaultValue={'active'}
                className='mb-1'
                rules={{ required: false }}
              />
              <FormGroupCustom
                control={form.control}
                label={FM('inactive')}
                name='status'
                type='radio'
                defaultValue={'inactive'}
                className='ms-2 mb-1'
                rules={{ required: false }}
              />
            </div>
          </Col> */}
                </Row>
            </SideModal>
        </Fragment>
    )
}

export default HindranceFilter
