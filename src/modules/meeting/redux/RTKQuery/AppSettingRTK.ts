/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { Settings, UserData } from '@src/utility/types/typeAuthApi'
import { Meeting } from '@src/utility/types/typeMeeting'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
    jsonData?: any & { refresh?: any; sort?: any; id?: any }
}
interface ResponseType extends HttpResponse<any> {
    someExtra: any
}

interface RequestTypeAction {
    eventId: string
    ids: number[]
    action: string
}
export const AppSettings = createApi({
    reducerPath: 'AppSettings',
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        loadAppSetting: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                // jsonData: args?.jsonData,
                // params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'get',
                path: ApiEndpoints.appSetting
            })
        }),
        updateAppSetting: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                // params: { page: args?.page, per_page_record: args.per_page_record },
                showSuccessToast: true,
                showErrorToast: true,
                method: 'post',
                path: ApiEndpoints.updateSetting
            })
        }),
        loadNotifications: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.notifications
            })
        }),
        readAllNotifications: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                method: 'get',
                params: args?.jsonData,
                path: ApiEndpoints.readAllNotifications
            })
        }),
        readNotifications: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                method: 'get',
                path: ApiEndpoints.notification + '/' + args?.jsonData?.id + '/read'
            })
        }),
        loadLogs: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.logs
            })
        }),
        loadAuditLogs: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.logsAudits
            })
        }),
        dashboardReport: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.dashboard
            })
        }),
        taskTracker: builder.mutation<any, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.task_tracker
            })
        }),

        // taskTimeline: builder.mutation<ResponseType, RequestType>({
        //     query: (args) => ({
        //         jsonData: args?.jsonData,
        //         params: { page: args?.page, per_page_record: args.per_page_record },
        //         method: 'post',
        //         path: ApiEndpoints.task_timeline
        //     })
        // })

        taskTimeline: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.task_timeline
            })
        }
        ),

        outlookLogin: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                method: 'get',
                path: ApiEndpoints.outlook_login
            })
        }),

        outlookCallback: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                method: 'post',
                path: ApiEndpoints.outlook_callback
            })
        }),
        appSettingAdminDetails: builder.mutation<ResponseType, RequestType>({
            query: (id) => ({
                method: 'get',
                path: ApiEndpoints.app_setting_admin
            })
        }),


    })
})
export const {
    useLoadAppSettingMutation,
    useUpdateAppSettingMutation,
    useLoadNotificationsMutation,
    useReadAllNotificationsMutation,
    useReadNotificationsMutation,
    useLoadLogsMutation,
    useDashboardReportMutation,
    useLoadAuditLogsMutation,
    useTaskTrackerMutation,
    useTaskTimelineMutation,
    useOutlookCallbackMutation,
    useOutlookLoginMutation,
    useAppSettingAdminDetailsMutation,
} = AppSettings
