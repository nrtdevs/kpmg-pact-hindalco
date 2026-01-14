import { LoginApiArgs } from '@src/utility/types/typeAuthApi'
import ApiEndpoints from '../ApiEndpoints'
import http from '../useHttp'

export const loginApi = (args: LoginApiArgs) => {
  http.request({
    ...args,
    method: 'post',
    authenticate: false,
    path: ApiEndpoints.login,
    showErrorToast: false
  })
}

export const otpApi = (args: LoginApiArgs) => {
  http.request({
    ...args,
    method: 'post',
    path: ApiEndpoints.otp,
    showErrorToast: true,
    authenticate: false
  })
}

export const sendResetLinkApi = (args: LoginApiArgs) => {
  http.request({
    ...args,
    method: 'post',
    path: ApiEndpoints.forgotPassword,
    showErrorToast: true
  })
}

export const resetPasswordApi = (args: LoginApiArgs) => {
  http.request({
    method: 'post',
    path: ApiEndpoints.resetPassword,
    showErrorToast: true,
    ...args
  })
}
