/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import {
  ContractType,
  InvoiceCheksResponse,
  InvoiceResponse,
  Password,
  UserData
} from '@src/utility/types/typeAuthApi'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: InvoiceCheksResponse & { sort?: any }
}

interface RequestContractType extends PagePerPageRequest {
  jsonData?: ContractType & { sort?: any }
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
export const InvoiceCheckManagement = createApi({
  reducerPath: 'InvoiceCheckManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateInvoiceCheck: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addInvoiceCheck + (args?.jsonData?.id ? '/' + args?.jsonData?.id : ''),
        showSuccessToast: true
      })
    }),
    //create update contract Type
    createContractType: builder.mutation<ResponseType, RequestContractType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addContractType + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    //contractTypeDetails
    contractTypeDetails: builder.mutation<ResponseType, RequestContractType>({
      query: (id) => ({
        method: 'get',
        path: ApiEndpoints.viewInvoiceCheck + id
      })
    }),
    //load Contract Type List
    loadContractType: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.loadContractType
      })
    }),

    checklistDetails: builder.mutation<ResponseType, RequestType>({
      query: (id) => ({
        method: 'get',
        path: ApiEndpoints.viewInvoiceCheck + id
      })
    }),

    loadInvoiceCheck: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.loadInvoiceChecks
      })
    })
  })
})
export const {
  useCreateOrUpdateInvoiceCheckMutation,
  useChecklistDetailsMutation,
  useLoadInvoiceCheckMutation,
  useLoadContractTypeMutation,
  useContractTypeDetailsMutation,
  useCreateContractTypeMutation
} = InvoiceCheckManagement
