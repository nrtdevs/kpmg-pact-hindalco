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
const ViewContractType = ({
  modal,
  reloadCallback = () => {},
  toggleModal,
  data,
  toggleNextModal = (e: any) => {}
}: {
  reloadCallback?: (e?: any) => void
  toggleModal: () => void
  modal: boolean
  data?: ContractType
  toggleNextModal?: (e: any) => void
}) => {
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

    toggleModal()
  }

  // create modal
  log('viewData', data)
  return (
    <CenteredModal
      open={modal}
      //   done={state.enableEdit ? 'save' : 'save'}
      title={data?.contract_type}
      scrollControl={false}
      modalClass={'modal-sm'}
      handleModal={closeModal}
      hideSave
      //   handleSave={form.handleSubmit(handleSave)}
    >
      <div className='p-1' style={{ minHeight: '60vh' }}>
        {data?.check_lists?.map((item: any, index: number) => {
          return (
            <div
              className='d-flex justify-content-between alig
                n-items-center'
            >
              <div className='d-flex align-items-center'>
                <span className='mr-1'>{index + 1}</span>
                <span className='mr-1'>{item?.check_list}</span>
              </div>
              <div className='d-flex align-items-center'>
                <span className='mr-1'>{item?.status === 1 ? 'Approved' : 'Not Approved'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </CenteredModal>
  )
}

export default ViewContractType
