/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import {
  HindranceResponse,
  InvoiceResponse,
  Password,
  UserData
} from '@src/utility/types/typeAuthApi'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: HindranceResponse & { sort?: any }
}
interface ResponseType extends HttpResponse<any> {
  someExtra: any
  url?: any
}

interface RequestTypeAction {
  eventId: string
  ids: number[]
  id?: number
  action: string
  jsonData?: any
}
export const HindranceManagement = createApi({
  reducerPath: 'HindranceManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateHindrance: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.add_hindrance + (args?.jsonData?.id ? '/' + args?.jsonData?.id : ''),
        showSuccessToast: true
      })
    }),
    exportHindrance: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.export_hindrance
      })
    }),
    hindranceAssign: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.hindrance_assign,
        showSuccessToast: true
      })
    }),
    hindrancePriority: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.hindrance_priority
      })
    }),
    actionHindrance: builder.mutation<ResponseType, RequestTypeAction>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.hindrance_action,
        showSuccessToast: true
      })
    }),
    // reAssignHindrance: builder.mutation<ResponseType, RequestTypeAction>({
    //   query: (args) => ({
    //     jsonData: args?.jsonData,
    //     method: 'post',
    //     path: ApiEndpoints.hindrance_action
    //   })
    // }),

    loadHindrance: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.loadHindrance
      })
    }),
    deleteHindrance: builder.mutation<any, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'delete',
        path: ApiEndpoints.delete_hindrance + args?.ids
      })
    }),
    viewHindranceById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.view_hindrance + '/' + args
      })
    }),
    hindranceLogExport: builder.mutation<any, any>({
      query: (a) => ({
        method: 'post',
        path: ApiEndpoints.log_export + '/' + a?.id
      })
    }),

    hindranceImport: builder.mutation<any, any>({
      query: (formData) => ({
        formData,
        method: 'post',
        path: ApiEndpoints.import_hindrance,
        showSuccessToast: true
      })
    }),
    hindranceSampleFile: builder.mutation<any, any>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.hindrance_sample_file,
        showSuccessToast: true
      })
    })
    // actionHindrance: builder.mutation<ResponseType, RequestTypeAction>({
    //   query: (args) => ({
    //     jsonData: args?.jsonData,
    //     method: 'post',
    //     path: ApiEndpoints.hindrance_action
    //   })
    // })
  })
})
export const {
  useCreateOrUpdateHindranceMutation,
  useActionHindranceMutation,
  useLoadHindranceMutation,
  useViewHindranceByIdMutation,
  useDeleteHindranceMutation,
  useExportHindranceMutation,
  useHindranceAssignMutation,
  useHindrancePriorityMutation,
  useHindranceLogExportMutation,
  useHindranceImportMutation,
  useHindranceSampleFileMutation
} = HindranceManagement
