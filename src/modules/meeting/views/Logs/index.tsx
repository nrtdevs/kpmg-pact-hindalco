import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import CustomDataTable, {
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import Header from '@src/modules/common/components/header'
import { stateReducer } from '@src/utility/stateReducer'
import { Log } from '@src/utility/types/typeAuthApi'
import { FM, formatDate, isValid } from '@src/utility/Utils'
import React, { Fragment, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Monitor, RefreshCcw, Users } from 'react-feather'
import { Badge, ButtonGroup } from 'reactstrap'
import { useLoadLogsMutation } from '../../redux/RTKQuery/AppSettingRTK'

// states
type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  search?: string
  lastRefresh?: any
}
const Logs = (props) => {
  // load logs mutation
  const [loadLogs, loadLogResponse] = useLoadLogsMutation()
  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    lastRefresh: new Date().getTime()
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
  const columns: TableColumn<Log>[] = [
    {
      name: FM('user'),
      cell: (row) => <span>{row?.created_by?.name}</span>
    },
    {
      name: FM('event'),
      cell: (row) => <span>{row?.event ?? 'N/A'}</span>
    },
    {
      name: FM('type'),
      cell: (row) => <span>{row?.type}</span>
    },
    {
      name: FM('ip-address'),
      cell: (row) => <span>{row?.ip_address ?? 'N/A'}</span>
    },
    {
      name: FM('status'),
      cell: (row) => (
        <Badge color={row?.status === 'success' ? 'success' : 'danger'}>
          {FM(row?.status as any) ?? 'N/A'}
        </Badge>
      )
    },
    {
      name: FM('failure-reason'),
      cell: (row) => <span>{row?.failure_reason ?? 'N/A'}</span>
    },
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
  return (
    <Fragment>
      <Header route={props?.route} icon={<Monitor size='25' />} title={FM('system-logs')}>
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
      <CustomDataTable<Log>
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

export default Logs
