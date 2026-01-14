// ** Reducers Imports
import navbar from './navbar'
import layout from './layout'
import auth from './authentication'
import { meetingMiddleware, meetingReducers } from '@src/modules/meeting/redux'
import { DprMiddleware, DprReducers } from '@src/modules/dpr/redux'

const rootReducer = {
  // theme reducers,
  navbar,
  layout,
  // auth reducers
  auth,
  // Meeting Reducers integration
  ...meetingReducers,
  // Dpr Reducer integration
  ...DprReducers
}
export const middleware = [
  // Meeting Middleware integration
  ...meetingMiddleware,
  // Dpr Middleware integration
  ...DprMiddleware
]
export default rootReducer
