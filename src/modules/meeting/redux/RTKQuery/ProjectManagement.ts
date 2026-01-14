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

export const ProjectManagement = createApi({
  reducerPath: 'ProjectManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateProject: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addProject + (args?.jsonData?.id ? '/' + args?.jsonData?.id : ''),
        showSuccessToast: true
      })
    }),
    deleteProject: builder.mutation<any, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'delete',
        path: ApiEndpoints.deleteProject + args.ids[0]
      })
    }),
    viewProjectById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewProject + '/' + args
      })
    }),
    // actionInvoice: builder.mutation<ResponseType, RequestTypeAction>({
    //   query: (args) => ({
    //     jsonData: args?.jsonData,
    //     method: 'post',
    //     path: ApiEndpoints.actionInvoice
    //   })
    // }),

    loadProject: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.loadProject
      })
    }),
    loadProjectGlobal: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.loadProjectGlobal
      })
    })
  })
})
export const {
  useCreateOrUpdateProjectMutation,
  useLoadProjectMutation,
  useDeleteProjectMutation,
  useViewProjectByIdMutation,
  useLoadProjectGlobalMutation
} = ProjectManagement
