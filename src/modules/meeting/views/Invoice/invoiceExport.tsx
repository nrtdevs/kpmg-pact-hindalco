import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import SideModal from '@src/modules/common/components/sideModal/sideModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { UserData } from '@src/utility/types/typeAuthApi'
import { FM } from '@src/utility/Utils'
import React, { FC, Fragment } from 'react'
import { DownloadCloud, Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonProps, Col, Label, Row } from 'reactstrap'

type FilterProps = {
  handleFilterData: (e: any) => void
}

const defaultValues: UserData = {
  //   role_id: 2,
  name: '',
  email: '',
  designation: '',
  mobile_number: '',
  status: 'active'
}

const InvoiceExport: FC<FilterProps> = (props) => {
  // toggle modal
  const [modal, toggleModal] = useModal()

  // form hook
  const form = useForm<UserData>({
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
        title={FM('export')}
        size='sm'
        color='primary'
      >
        <DownloadCloud size='14' />
      </BsTooltip>
      <SideModal
        handleSave={form.handleSubmit(props.handleFilterData)}
        open={modal}
        handleModal={() => {
          toggleModal()
        }}
        title={FM('export')}
        done='export'
      >
        <Row>
          <Col md='12'>
            <p className='text-dark mb-0'>{FM('filter-invoice')}</p>
            {/* <p className='text-muted small'>{FM('filter-users-description')}</p> */}
          </Col>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('contractors')}
              name='select_contractor'
              type='select'
              async
              loadOptions={loadDropdown}
              path={ApiEndpoints.contracts_list}
              selectLabel={(e) => e?.se_name}
              selectValue={(e) => e.id}
              defaultOptions
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
        </Row>
      </SideModal>
    </Fragment>
  )
}

export default InvoiceExport
