/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { Password, UserData } from '@src/utility/types/typeAuthApi'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: UserData & { sort?: any }
}
interface ResponseType extends HttpResponse<any> {
  someExtra: any
}

interface RequestTypeAction {
  eventId: string
  ids: number[]
  action: string
}
export const MeetingUserManagement = createApi({
  reducerPath: 'MeetingUserManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateUser: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.user + (args?.jsonData?.id ? '/' + args?.jsonData?.id : ''),
        showSuccessToast: true
      })
    }),
    actionUser: builder.mutation<ResponseType, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'post',
        path: ApiEndpoints.user_action
      })
    }),
    changePassword: builder.mutation<ResponseType, Password>({
      query: (args) => ({
        jsonData: args,
        method: 'post',
        path: ApiEndpoints['change-password']
      })
    }),
    loadUsers: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.users
      })
    }),
    loadGlobalUser: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.global_user
      })
    })
  })
})
export const {
  useCreateOrUpdateUserMutation,
  useLoadUsersMutation,
  useActionUserMutation,
  useChangePasswordMutation,
  useLoadGlobalUserMutation
} = MeetingUserManagement
