import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { HindranceTypeResponse, PackageResponse } from '@src/utility/types/typeAuthApi'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: PackageResponse & { sort?: any }
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

export const PackageManagement = createApi({
  reducerPath: 'PackageManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdatePackage: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addPackage + (args?.jsonData?.id ? '/' + args?.jsonData?.id : ''),
        showSuccessToast: true
      })
    }),
    deletePackage: builder.mutation<any, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'delete',
        path: ApiEndpoints.deletePackage + args.ids[0]
      })
    }),
    viewPackageById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewPackage + '/' + args
      })
    }),
    // actionInvoice: builder.mutation<ResponseType, RequestTypeAction>({
    //   query: (args) => ({
    //     jsonData: args?.jsonData,
    //     method: 'post',
    //     path: ApiEndpoints.actionInvoice
    //   })
    // }),

    loadPackage: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.loadPackage
      })
    }),
    loadPackageGlobal: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.loadPackageGlobal
      })
    })
  })
})
export const {
  useCreateOrUpdatePackageMutation,
  useLoadPackageMutation,
  useDeletePackageMutation,
  useViewPackageByIdMutation
} = PackageManagement
