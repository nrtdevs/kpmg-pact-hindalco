/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import {
    HindranceResponse,
    InvoiceResponse,
    Password,
    UserData, VenueTypeResponse
} from '@src/utility/types/typeAuthApi'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
    jsonData?: VenueTypeResponse & { sort?: any }
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
export const VenueManagement = createApi({
    reducerPath: 'VenueManagement',
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        createOrUpdateVenue: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                method: args?.jsonData?.id ? 'put' : 'post',
                path: ApiEndpoints.addVenue + (args?.jsonData?.id ? '/' + args?.jsonData?.id : ''),
                showSuccessToast: true
            })
        }),
        loadVenue: builder.mutation<ResponseType, RequestType>({
            query: (a) => ({
                jsonData: a?.jsonData,
                params: { page: a?.page, per_page_record: a?.per_page_record },
                method: 'post',
                path: ApiEndpoints.loadVenue
            })
        }),
        deleteVenue: builder.mutation<any, RequestTypeAction>({
            query: (args) => ({
                jsonData: args,
                method: 'delete',
                path: ApiEndpoints.deleteVenue + args?.ids
            })
        }),
        viewVenueById: builder.mutation<ResponseType, Number>({
            query: (args) => ({
                method: 'get',
                path: ApiEndpoints.viewVenue + '/' + args
            })
        }),

    })
})
export const {
    useCreateOrUpdateVenueMutation,
    useLoadVenueMutation,
    useDeleteVenueMutation,
    useViewVenueByIdMutation
} = VenueManagement
