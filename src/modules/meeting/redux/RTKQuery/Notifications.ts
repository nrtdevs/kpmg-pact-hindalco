/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'

import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: Notification & { sort?: any }
}
interface ResponseType extends HttpResponse<any> {
  someExtra: any
}
export const NotificationManagement = createApi({
  reducerPath: 'NotificationManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    loadNotification: builder.mutation<ResponseType, RequestType>({
      query: (a) => ({
        jsonData: a?.jsonData,
        params: { page: a?.page, per_page_record: a?.per_page_record },
        method: 'post',
        path: ApiEndpoints.notifications
      })
    }),
    // Export Invoice
    readAllNotification: builder.mutation<ResponseType, any>({
      query: (a) => ({
        method: 'get',
        path: ApiEndpoints.readAllNotifications
      })
    }),
    readNotification: builder.mutation<ResponseType, any>({
      query: (a) => ({
        method: 'get',
        path: ApiEndpoints.notification + a?.id + '/read'
      })
    })
  })
})
export const {
  useLoadNotificationMutation,
  useReadAllNotificationMutation,
  useReadNotificationMutation
} = NotificationManagement
