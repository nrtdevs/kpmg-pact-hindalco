/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { InvoiceResponse, Password, UserData } from '@src/utility/types/typeAuthApi'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: InvoiceResponse & { sort?: any }
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
export const InvoiceManagement = createApi({
  reducerPath: 'InvoiceManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateInvoice: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addInvoice + (args?.jsonData?.id ? '/' + args?.jsonData?.id : ''),
        showSuccessToast: true
      })
    }),
    actionInvoice: builder.mutation<ResponseType, RequestTypeAction>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.actionInvoice
      })
    }),
    //VIew invoice by id

    viewInvoiceByID: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'get',
        path: ApiEndpoints.updateInvoice + args?.jsonData?.id
      })
    }),

    loadInvoiceLog: builder.mutation<any, any>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.viewInvoiceLog + args?.jsonData?.id
      })
    }),

    loadInvoice: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.loadInvoice
      })
    }),
    // invoice-checks-verification/1
    invoiceCheckVerfication: builder.mutation<any, any>({
      query: (a) => ({
        jsonData: a?.jsonData,
        method: 'post',
        path: ApiEndpoints.invoiceCheckVerfication + a?.id
      })
    }),

    exportInvoiceLog: builder.mutation<any, any>({
      query: (a) => ({
        jsonData: a?.jsonData,
        method: 'post',
        path: ApiEndpoints.invoiceActivityLogExport + a?.id
      })
    }),
    exportInvoice: builder.mutation<any, any>({
      query: (a) => ({
        jsonData: a?.jsonData,
        method: 'post',
        path: ApiEndpoints.invoiceExport
      })
    }),

    importInvoice: builder.mutation<any, any>({
      query: (formData) => ({
        formData,
        method: 'post',
        path: ApiEndpoints.importInvoice
      })
    }),
    invoiceSampleFile: builder.mutation<any, any>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.downloadInvoiceSample
      })
    })
    // Export Invoice
  })
})
export const {
  useCreateOrUpdateInvoiceMutation,
  useActionInvoiceMutation,
  useInvoiceCheckVerficationMutation,

  useLoadInvoiceMutation,
  useExportInvoiceLogMutation,
  useLoadInvoiceLogMutation,
  useViewInvoiceByIDMutation,
  useImportInvoiceMutation,
  useExportInvoiceMutation,

  useInvoiceSampleFileMutation
} = InvoiceManagement
