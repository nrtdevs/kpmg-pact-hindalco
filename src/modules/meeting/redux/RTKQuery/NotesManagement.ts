/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { UserData } from '@src/utility/types/typeAuthApi'
import { MeetingNote } from '@src/utility/types/typeMeeting'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
    next?: boolean
    jsonData?: MeetingNote
}
interface ResponseType extends HttpResponse<MeetingNote[]> {
    someExtra: any
}
interface ResponseTypeMeting extends HttpResponse<MeetingNote> {
    someExtra: any
}
interface RequestTypeAction {
    eventId: string
    ids: number[]
    action: string
}
export const NoteManagement = createApi({
    reducerPath: 'NoteManagement',
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        createOrUpdateNote: builder.mutation<ResponseTypeMeting, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                method: args?.jsonData?.id ? 'put' : 'post',
                path: ApiEndpoints.addNote + (args?.jsonData?.id ? '/' + args?.jsonData?.id : ''),
                showSuccessToast: true
            })
        }),

        deleteNote: builder.mutation<any, RequestTypeAction>({
            query: (args) => ({
                jsonData: args,
                method: 'delete',
                path: ApiEndpoints.actionNote
            })
        }),
        viewNote: builder.mutation<ResponseTypeMeting, RequestTypeAction>({
            query: (args) => ({
                jsonData: args,
                method: 'get',
                path: ApiEndpoints.actionNote
            })
        }),
        loadNotes: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.notes
            })
        }),
        globalLoadNotes: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.notes_list_global
            })
        }),
        actionNote: builder.mutation<any, RequestTypeAction>({
            query: (args) => ({
                jsonData: args,
                method: 'post',
                path: ApiEndpoints.actionNote
            })
        }),
        exportMeetingLog: builder.mutation<any, RequestTypeAction>({
            query: (id) => ({
                // jsonData: a?.jsonData,
                method: 'post',
                path: ApiEndpoints.export_meeting_log + id
            })
        }),
        exportMeetingPdf: builder.mutation<any, RequestTypeAction>({
            query: (id) => ({
                // jsonData: a?.jsonData,
                method: 'post',
                path: ApiEndpoints.export_meeting_pdf + id
            })
        }),
        meetingPdfLog: builder.mutation<any, RequestTypeAction>({
            query: (id) => ({
                // jsonData: a?.jsonData,
                method: 'post',
                path: ApiEndpoints.meeting_pdf_log + id
            })
        }),
        sendDraftMail: builder.mutation<any, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                method: 'post',
                path: ApiEndpoints.send_draft_mail
            })
        }),
        assigneesRemark: builder.mutation<any, any>({
            query: (args) => ({
                jsonData: args?.jsonData,
                // method: 'post',
                method: 'post',
                path: ApiEndpoints.assignee_remark + (args?.jsonData?.id ?? '')
            })
        })
    })
})
export const {
    useLoadNotesMutation,
    useCreateOrUpdateNoteMutation,
    useViewNoteMutation,
    useGlobalLoadNotesMutation,
    useDeleteNoteMutation,
    useActionNoteMutation,
    useExportMeetingLogMutation,
    useExportMeetingPdfMutation,
    useMeetingPdfLogMutation,
    useSendDraftMailMutation,
    useAssigneesRemarkMutation,

} = NoteManagement
