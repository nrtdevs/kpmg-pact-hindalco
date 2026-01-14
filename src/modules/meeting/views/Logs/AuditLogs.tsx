import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import CustomDataTable, {
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import Header from '@src/modules/common/components/header'
import { stateReducer } from '@src/utility/stateReducer'
import { AuditLog } from '@src/utility/types/typeAuthApi'
import { FM, decrypt, fastLoop, formatDate, isValid } from '@src/utility/Utils'
import React, { Fragment, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Monitor, RefreshCcw, Users } from 'react-feather'
import { Badge, Button, ButtonGroup, Col, Container, Row } from 'reactstrap'
import { useLoadAuditLogsMutation, useLoadLogsMutation } from '../../redux/RTKQuery/AppSettingRTK'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import Show from '@src/utility/Show'

// states
type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  search?: string
  lastRefresh?: any
  showAttributes?: boolean
  attributes?: any
}
const AuditLogs = (props) => {
  // load logs mutation
  const [loadLogs, loadLogResponse] = useLoadAuditLogsMutation()

  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    lastRefresh: new Date().getTime(),
    showAttributes: false,
    attributes: undefined
  }
  // state reducer
  const reducers = stateReducer<States>
  // state
  const [state, setState] = useReducer(reducers, initState)

  // load  list
  const loadList = () => {
    loadLogs({
      page: state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }
  // call logs
  React.useEffect(() => {
    loadList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

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
  // table columns
  const columns: TableColumn<AuditLog>[] = [
    {
      name: FM('user'),
      cell: (row) => <span>{row?.causer?.name}</span>
    },
    {
      name: FM('name'),
      cell: (row) => <span>{row?.log_name ?? 'N/A'}</span>
    },
    {
      name: FM('event'),
      cell: (row) => (
        <span>
          <Badge
            color={row?.event === 'updated' ? 'light-warning' : 'light-primary'}
            className='text-capitalize ms-1'
          >
            {row?.event ?? ''}
          </Badge>
        </span>
      )
    },
    {
      name: FM('description'),
      cell: (row) => <span>{row?.description}</span>
    },
    {
      name: FM('attributes'),
      cell: (row) => (
        <span>
          <Badge
            color='light-primary'
            role='button'
            onClick={() =>
              setState({ ...state, showAttributes: true, attributes: row?.properties })
            }
          >
            View
          </Badge>
        </span>
      )
    },
    // {
    //   name: FM('ip-address'),
    //   cell: (row) => <span>{row?.description ?? 'N/A'}</span>
    // },
    // {
    //   name: FM('status'),
    //   cell: (row) => (
    //     <Badge color={row?.status === 'success' ? 'success' : 'danger'}>
    //       {FM(row?.status as any) ?? 'N/A'}
    //     </Badge>
    //   )
    // },
    // {
    //   name: FM('failure-reason'),
    //   cell: (row) => <span>{row?.failure_reason ?? 'N/A'}</span>
    // },
    {
      name: FM('created-at'),
      minWidth: '200px',
      cell: (row) => <span>{formatDate(row?.created_at, 'DD MMM YYYY - hh:mm A')}</span>
    }
  ]

  // handle sort
  const handleSort = (column: any, dir: string) => {
    setState({
      filterData: {
        ...state.filterData,
        sort: {
          column: column?.id,
          dir:
            loadLogResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadLogResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
                ? 'desc'
                : 'asc'
              : dir
        }
      }
    })
  }
  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  const renderPermissions = (permissions:  any[]) => {
    const re:any[]= []
    fastLoop(permissions, (permission) => {
      re.push(
        <p className='mb-0'>{permission?.se_name}</p>
      )
    }
    )
    return re
  }

  // loop through object keys and return value
  const printObjectData = (obj: any, name = 'attributes') => {
    const re: any[] = []
    if (isValid(obj)) {
      Object.keys(obj).forEach((key) => {
        re.push(
          <tr key={key}>
            <td className='fw-bolder p-75 '>{String(key).replaceAll('_', '-')}</td>
            <td className='fw-bolder ' style={{
              wordBreak: 'break-all'
            }}>
              {key === 'created_at' || key === 'updated_at'
                ? formatDate(obj[key], 'DD MMM YYYY - hh:mm A')
                :  key === 'permissions' ?  renderPermissions(obj[key] ): typeof obj[key] === 'object' ? JSON.stringify(obj[key]) : obj[key]}
            </td>
          </tr>
        )
      })
      return (
        <table className='table table-bordered'>
          <thead>
            <tr>
              <th colSpan={2} className='p-75'>
                {name}
              </th>
            </tr>
          </thead>
          <tbody>{re}</tbody>
        </table>
      )
    }
  }
  return (
    <Fragment>
      <CenteredModal
        scrollControl={false}
        modalClass='modal-lg'
        open={state.showAttributes}
        disableFooter
        handleModal={() => setState({ ...state, showAttributes: false, attributes: undefined })}
        title={FM('attributes')}
      >
        <Container>
          <Row>
            <Show IF={isValid(state.attributes?.attributes)}>
              <Col xl={isValid(state.attributes?.old) ? '6' : '12'}>
                <p className='p-0 pt-75'>
                  {state.attributes &&
                    printObjectData(
                      state.attributes?.attributes,
                      isValid(state.attributes?.old) ? 'New Attributes' : 'Attributes'
                    )}
                </p>
              </Col>
            </Show>
            <Show IF={isValid(state.attributes?.old)}>
              <Col xl='6'>
                <p className='p-0 pt-75'>
                  {state.attributes && printObjectData(state.attributes?.old, 'Old Attributes')}
                </p>
              </Col>
            </Show>
          </Row>
        </Container>
      </CenteredModal>
      <Header icon={<Monitor size='25' />} title={FM('audit-logs')}>
        <ButtonGroup color='dark'>
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadLogResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>
      <CustomDataTable<AuditLog>
        initialPerPage={20}
        isLoading={loadLogResponse.isLoading}
        columns={columns}
        // options={options}
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-log-name'
        onSort={handleSort}
        hideHeader
        defaultSortField={loadLogResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadLogResponse?.data}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default AuditLogs
