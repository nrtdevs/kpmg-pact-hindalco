import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { HindranceTypeResponse } from '@src/utility/types/typeAuthApi'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: HindranceTypeResponse & { sort?: any }
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

export const HindranceTypeRTK = createApi({
  reducerPath: 'HindranceTypeRTK',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateHindranceType: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addHindranceType + (args?.jsonData?.id ? '/' + args?.jsonData?.id : ''),
        showSuccessToast: true
      })
    }),
    deleteHindranceType: builder.mutation<any, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'delete',
        path: ApiEndpoints.deleteHindranceType + args.ids[0]
      })
    }),
    viewHindranceTypeById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewHindranceType + '/' + args
      })
    }),
    // actionInvoice: builder.mutation<ResponseType, RequestTypeAction>({
    //   query: (args) => ({
    //     jsonData: args?.jsonData,
    //     method: 'post',
    //     path: ApiEndpoints.actionInvoice
    //   })
    // }),

    loadHindranceType: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.loadHindranceType
      })
    }),
    loadHindranceTypeGlobal: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.loadHindranceTypeGlobal
      })
    })
  })
})
export const {
  useCreateOrUpdateHindranceTypeMutation,
  useLoadHindranceTypeMutation,
  useDeleteHindranceTypeMutation,
  useViewHindranceTypeByIdMutation
} = HindranceTypeRTK
