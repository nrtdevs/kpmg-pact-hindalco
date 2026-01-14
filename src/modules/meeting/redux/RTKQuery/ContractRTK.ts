/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { ContractsResponse, Password, UserData } from '@src/utility/types/typeAuthApi'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: ContractsResponse & { sort?: any }
}
interface ResponseType extends HttpResponse<any> {
  someExtra: any
}

interface RequestTypeAction {
  eventId: string
  ids: number[]
  action: string
  jsonData?: any
}
export const ContractManagement = createApi({
  reducerPath: 'ContractManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateContracts: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addContract + (args?.jsonData?.id ? '/' + args?.jsonData?.id : ''),
        showSuccessToast: true
      })
    }),
    actionContracts: builder.mutation<ResponseType, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: `${args?.action}` === 'delete' ? 'delete' : 'post',
        path:
          `${args?.action}` === 'delete'
            ? ApiEndpoints.deleteContract + args?.ids[0]
            : ApiEndpoints.actionContract
      })
    }),

    contractDetails: builder.mutation<ResponseType, RequestType>({
      query: (id) => ({
        method: 'get',
        path: ApiEndpoints.viewContract + id
      })
    }),

    loadContracts: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.loadContracts
      })
    })
  })
})
export const {
  useCreateOrUpdateContractsMutation,
  useActionContractsMutation,
  useContractDetailsMutation,
  useLoadContractsMutation
} = ContractManagement
