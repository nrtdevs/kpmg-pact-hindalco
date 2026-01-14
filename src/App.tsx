import { Suspense, useContext, useEffect, useState } from 'react'
import ChangePassword from './modules/meeting/views/users/ChnagePassword'
import UpdateViewProfile from './modules/meeting/views/users/UpdateViewPorfile'
import { useAppDispatch, useAppSelector } from './redux/store'
import { useIdleTimer } from 'react-idle-timer'

// ** Router Imports
import Router from './router/Router'
import { handleLogout } from './redux/authentication'
import { useLoadAppSettingMutation } from './modules/meeting/redux/RTKQuery/AppSettingRTK'
import { handleAppSetting } from './redux/layout'
import { FM, isValid, log } from './utility/Utils'
import { RenderHeaderMenu } from './utility/context/RenderHeader'
import { Button, Label, NavItem } from 'reactstrap'
import BsTooltip from './modules/common/components/tooltip'
import { useOutlookLoginMutation } from './modules/meeting/redux/RTKQuery/AppSettingRTK'
import { userType } from './utility/Const'
import AutoLogout from './modules/common/auth/AutoLogout'
//
const App = () => {
    const user = useAppSelector((stats) => stats.auth.userData)
    const appSettings = useAppSelector((state) => state.layout.appSettings)
    const [loadSetting, res] = useLoadAppSettingMutation()
    const dispatch = useAppDispatch()
    const [outlookLogin, resOutlookLogin] = useOutlookLoginMutation()
    const [hangerMail, setHangerMail] = useState('')

    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    //   const [modal, toggleModal] = useModal()
    log("outlookLogin", resOutlookLogin)

    useEffect(() => {
        if (resOutlookLogin.isSuccess) {
            window.open(resOutlookLogin.data?.data, '_blank')
        }
    }
        , [resOutlookLogin])


    useEffect(() => {
        if (user?.role_id === userType.admin) {
            setHangerMail(appSettings?.hanger_email)
        }
    }, [appSettings, user])

    // create a menu on header
    useEffect(() => {
        setHeaderMenu(
            <>
                <NavItem className=''>
                    <BsTooltip
                        target='reload'
                        Tag={Button}
                        className={'btn btn-sm btn-icon me-1 '}
                        title={FM('outlook-login')}
                        color='primary'
                        onClick={() => outlookLogin({})}
                        tooltip={FM('outlook-login')}
                    >
                        <span>{FM('outlook-login')}</span>
                    </BsTooltip>
                    {
                        isValid(hangerMail) ? <span className='text-success text-smallcase'>{FM("email-connected", {
                            email: hangerMail
                        })}</span> : null
                    }
                </NavItem>
            </>
        )
        return () => {
            setHeaderMenu(null)
        }
    }, [hangerMail])

    useEffect(() => {
        loadSetting({})
    }, [])

    useEffect(() => {
        if (res.isSuccess) {
            const data = res.data?.data
            if (data !== undefined) {
                dispatch(handleAppSetting(data))
            }
        }
    }, [res])
    log("app-setting", res.data?.data)
    return (
        <Suspense fallback={null}>
            <AutoLogout />
            <UpdateViewProfile data={{ ...user }} />
            <ChangePassword data={{ ...user }} />
            <Router />
        </Suspense>
    )
}

export default App
