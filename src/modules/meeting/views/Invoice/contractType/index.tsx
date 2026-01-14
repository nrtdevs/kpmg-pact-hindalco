import Unknown from '@@assets/images/icons/doc.png'
import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser'
import CustomDataTable, {
  TableDropDownOptions,
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'

import DropDownMenu from '@src/modules/common/components/dropdown'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import {
  FM,
  JsonParseValidate,
  SuccessToast,
  createConstSelectOptions,
  emitAlertStatus,
  getKeyByValue,
  isValid,
  isValidArray,
  log,
  setInputErrors,
  setValues,
  userType
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
// import { InvoiceResponse } from '@src/utility/types/typeAuthApi'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import {
  CheckCircle,
  CheckSquare,
  Download,
  Edit,
  Eye,
  FilePlus,
  FileText,
  Filter,
  Pause,
  RefreshCcw,
  Send,
  Upload,
  User,
  X
} from 'react-feather'
import { useForm } from 'react-hook-form'
import {
  Button,
  ButtonGroup,
  ButtonProps,
  Col,
  Form,
  Label,
  ListGroup,
  ListGroupItem,
  NavItem,
  NavLink,
  Row
} from 'reactstrap'
import * as yup from 'yup'

import { InvoiceStatus, InvoiceType, hindranceStatus } from '@src/utility/Const'
import {
  useActionInvoiceMutation,
  useCreateOrUpdateInvoiceMutation,
  useExportInvoiceLogMutation,
  useLoadInvoiceMutation
} from '../../../redux/RTKQuery/InvoiceManagement'
import InvoiceFilter from '../InvoiceFilter'

import CheckAttachChecklistModal from '../CheckAttachChecklistModal'
import InvoiceExportModal from '../InvoiceExportModal'
import InvoiceImport from '../InvoiceImport'
import { getPath } from '@src/router/RouteHelper'
import { Link } from 'react-router-dom'
import Hide from '@src/utility/Hide'
import { ContractType } from '@src/utility/types/typeAuthApi'
import { useLoadContractTypeMutation } from '@src/modules/meeting/redux/RTKQuery/InvoiceChecksRTK'
import ContractTypeEdit from './ContractTypeModal'
import ViewContractType from './ViewContractType'

// validation schema
const userFormSchema = {
  invoice_number: yup
    .string()
    .notRequired()
    .when({
      is: (values: string) => values?.length > 0,
      then: (schema) =>
        schema
          .min(5, FM('mobile-number-must-be-at-least-5-characters'))
          .max(244, FM('invoice-number-must-be-at-most-244-characters'))
          .required(),
      otherwise: (schema) => schema.notRequired()
    })
}
// validate
const schema = yup.object(userFormSchema).required()

// states

type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: ContractType
  enableEdit?: boolean
}

const defaultValues: ContractType = {
  id: undefined,
  contract_type: undefined,
  check_lists: []
}
export default function ContractTypeList<T>(props: any) {
  // header menu context
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // user
  const user = useUser()
  // can add invoice
  const canAddContractType = Can(Permissions.contractTypeAdd)
  //can import invoice

  // can edit invoice
  const canEditContractType = Can(Permissions.contractTypeEdit)
  // can delete invoice
  //can view
  const canViewContractType = Can(Permissions.contractTyprRead)
  const canDeleteContractType = Can(Permissions.contractTypeDelete)

  // form hook
  const form = useForm<ContractType>({
    resolver: yupResolver(schema),
    defaultValues
  })

  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  const [viewModal, toggleViewModal] = useModal()

  // create or update user mutation
  const [createContractType, createContractTypeRes] = useCreateOrUpdateInvoiceMutation()
  // load users
  const [loadContractType, loadContractTypeRes] = useLoadContractTypeMutation()
  // delete mutation

  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    enableEdit: false,

    lastRefresh: new Date().getTime()
  }
  // state reducer
  const reducers = stateReducer<States>
  // state
  const [state, setState] = useReducer(reducers, initState)

  // close add
  const closeAddModal = () => {
    setState({
      selectedUser: undefined,
      enableEdit: false
    })
    form.reset()
    toggleModalAdd()
  }

  // load user list
  const loadUserList = () => {
    loadContractType({
      page: state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        contract_type: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle pagination and load list
  useEffect(() => {
    loadUserList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // reload Data
  const reloadData = () => {
    setState({
      page: 1,
      search: '',
      filterData: undefined,
      per_page_record: 20,
      lastRefresh: new Date().getTime()
    })
  }

  //set user name email and mobile no in  form vendor name vendor_contact_email vendor_contact_number

  // create a menu on header
//   useEffect(() => {
//     if (!canAddContractType) return
//     setHeaderMenu(
//       <>
//         <NavItem className=''>
//           <BsTooltip title={FM('create-contract-type')}>
//             <NavLink
//               className=''
//               onClick={() => {
//                 setState({
//                   enableEdit: false,
//                   selectedUser: undefined
//                 })
//                 form.reset()
//                 toggleModalAdd()
//               }}
//             >
//               <FilePlus className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
//             </NavLink>
//           </BsTooltip>
//         </NavItem>
//       </>
//     )
//     return () => {
//       setHeaderMenu(null)
//     }
//   }, [modalAdd, canAddContractType])

  // handle action result
  //   useEffect(() => {
  //     if (invoiceActionResult?.isLoading === false) {
  //       if (invoiceActionResult?.isSuccess) {
  //         emitAlertStatus('success', null, invoiceActionResult?.originalArgs?.eventId)
  //       } else if (invoiceActionResult?.error) {
  //         emitAlertStatus('failed', null, invoiceActionResult?.originalArgs?.eventId)
  //       }
  //     }
  //   }, [invoiceActionResult])

  //   useEffect(() => {
  //     if (exportRes?.isLoading === false) {
  //       if (exportRes?.isSuccess) {
  //         emitAlertStatus('success', null, exportRes?.originalArgs?.eventId)

  //         window.open(`${httpConfig.baseUrl3}${exportRes?.data?.data?.url}`, '_blank')
  //       } else if (exportRes?.error) {
  //         emitAlertStatus('failed', null, exportRes?.originalArgs?.eventId)
  //       }
  //     }
  //   }, [exportRes])

  // table columns
  const columns: TableColumn<ContractType>[] = [
    {
      name: FM('contract-type'),
      id: 'contract-type',
      cell: (row) => (
        <Fragment>
          <BsTooltip
            state={{ ...row }}
            role={'button'}
            title={FM('edit-contract-type')}
            onClick={() => {
              setState({
                enableEdit: true,
                selectedUser: row
              })
              toggleModalAdd()
            }}
            className={canViewContractType ? 'text-primary' : 'pe-none'}
          >
            <>{row?.contract_type}</>
          </BsTooltip>
        </Fragment>
      )
    },
    {
      maxWidth: '13%',
      name: FM('no-of-checklist'),
      id: 'no-of-checklist',
      cell: (row) => (
        <Fragment>{isValidArray(row?.check_lists) ? row?.check_lists?.length : 0}</Fragment>
      )
    }
  ]
  const onSuccessEvent = () => {
    reloadData()
  }

  // handle sort
  const handleSort = (column: any, dir: string) => {
    setState({
      filterData: {
        ...state.filterData,
        sort: {
          column: column?.id,
          dir:
            loadContractTypeRes?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadContractTypeRes?.originalArgs?.jsonData?.sort?.dir === 'asc'
                ? 'desc'
                : 'asc'
              : dir
        }
      }
    })
  }
  return (
    <Fragment>
      <ContractTypeEdit
        reloadCallback={reloadData}
        data={state.selectedUser}
        modal={modalAdd}
        toggleModal={toggleModalAdd}
      />
      <Header route={props?.route} icon={<FileText size='25' />} title={FM('contract-type')}>
        <ButtonGroup color='dark'>
          <Show IF={canAddContractType}>
            <BsTooltip<ButtonProps>
              Tag={Button}
              className='btn-primary'
              color='primary'
              size='sm'
              onClick={() => {
                setState({
                  enableEdit: false
                })
                form.reset()
                toggleModalAdd()
              }}
              title={FM('create-contract-type')}
            >
              <FilePlus size='14' className={'ficon ' + (modalAdd ? 'text-white' : '')} />
              {/* <GetApp size='5px' /> */}
            </BsTooltip>
          </Show>
          <BsTooltip<ButtonProps>
            Tag={Button}
            size='sm'
            title={FM('reload')}
            onClick={reloadData}
            color='info'
            className='btn btn-info'
          >
            <RefreshCcw size='14' />
          </BsTooltip>
        </ButtonGroup>
      </Header>
      <CustomDataTable<ContractType>
        initialPerPage={20}
        isLoading={loadContractTypeRes.isLoading}
        columns={columns}
        // selectableRows={canAddAction && user?.user_type !== userType.contractor}
        searchPlaceholder='search'
        onSort={handleSort}
        // selectableRowDisabled={(row: any) => row?.id === user?.id}
        defaultSortField={loadContractTypeRes?.originalArgs?.jsonData?.sort}
        paginatedData={loadContractTypeRes?.data}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}
