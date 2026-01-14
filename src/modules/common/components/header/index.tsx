// import { Routes } from '../../../router'
import classNames from 'classnames'
import { ArrowLeft } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import { Col, Row } from 'reactstrap'
import { FM, isValid, log } from '@src/utility/Utils'
import Hide from '@src/utility/Hide'
import {
  useLoadNotificationsMutation,
  useReadAllNotificationsMutation,
  useReadNotificationsMutation
} from '@src/modules/meeting/redux/RTKQuery/AppSettingRTK'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@src/redux/store'
import { handleNotifications } from '@src/redux/navbar'
import Emitter from '@src/utility/Emitter'
import { Routes } from '@src/router/routes'
import { handleLogout } from '@src/redux/authentication'
import { useIdleTimer } from 'react-idle-timer'
import { UserData } from '@src/utility/types/typeAuthApi'
import { Roles } from '@src/utility/Const'

interface HeaderProps {
  title: string | any
  children?: JSX.Element | JSX.Element[] | null
  titleCol?: string
  childCol?: string
  subHeading?: string | null | JSX.Element
  icon?: any
  loading?: boolean
  description?: string | null | JSX.Element
  noHeader?: boolean
  goBack?: boolean
  goBackTo?: string | boolean
  onClickBack?: () => void
  rowClass?: string
  route?: any
}

let reloadCount = 0
let readAllCount = 0

const Header = ({
  title,
  goBack = false,
  loading = false,
  onClickBack = () => {},
  children = null,
  titleCol = '7',
  childCol = '5',
  subHeading = null,
  icon = null,
  rowClass = 'mb-2',
  description = null,
  noHeader = false,
  route = null
}: HeaderProps) => {
  const location = useLocation()
  const navigation = useNavigate()
  const dispatch = useAppDispatch()
  const [loadNotification, loadNotificationResponse] = useLoadNotificationsMutation()
  const [readAll, readAllResponse] = useReadAllNotificationsMutation()
  const [read, readResponse] = useReadNotificationsMutation()
  const user: UserData = useAppSelector((stats) => stats.auth.userData)
  const [state, setState] = useState<string>('Active')
  const [remaining, setRemaining] = useState<number>(0)
  const [count, setCount] = useState<number>(0)

  // handle idle
  const onIdle = () => {
    setState('Idle')
  }
  // handle active
  const onActive = () => {
    setState('Active')
  }
  // handle message
  const onMessage = () => {
    setCount(count + 1)
  }

  // logout user automatically after timeout
  // for admin 15 min and for other users 25 min
  const time = user?.roles?.name === Roles.Admin ? 15 : 25

  // handle idle timer
  const { getRemainingTime } = useIdleTimer({
    onIdle,
    onActive,
    onMessage,
    timeout: 60000 * time,
    crossTab: true,
    leaderElection: true,
    syncTimers: 200
  })

  // handle remaining time
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil(getRemainingTime() / 1000))
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // handle logout
  useEffect(() => {
    if (state === 'Idle') {
      log('logout for inactivity')
      dispatch(handleLogout())
    }
  }, [state])

  // load notification every 60 seconds
  useEffect(() => {
    loadNotification({
      page: 1,
      per_page_record: 5
    })
    const interval = setInterval(() => {
      loadNotification({
        page: 1,
        per_page_record: 5
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect

  // handle reload notification
  useEffect(() => {
    Emitter.on('reloadNotifications', (data: boolean) => {
      log('reloadNotifications', reloadCount)
      if (reloadCount === 0) {
        log('reload if 1')
        loadNotification({
          page: 1,
          per_page_record: 5,
          jsonData: { refresh: new Date() }
        })
        reloadCount++
      }
    })
    return () => {
      reloadCount = 0
      Emitter.off('reloadNotifications', (data: boolean) => {})
    }
  }, [reloadCount])

  // send loading event
  useEffect(() => {
    Emitter.emit('loadNotificationResponseLoading', loadNotificationResponse.isLoading)
  }, [loadNotificationResponse.isLoading])

  // send loading event
  useEffect(() => {
    Emitter.emit('loadNotificationResponseLoadingR', readAllResponse.isLoading)
  }, [readAllResponse.isLoading])

  // handle load notification response
  useEffect(() => {
    // reloadCount = 0
    // log('loadNotificationResponse', reloadCount, loadNotificationResponse)

    if (loadNotificationResponse.data) {
      //   reloadCount = 0

      //   log('loadNotificationResponse', loadNotificationResponse.data)
      dispatch(handleNotifications(loadNotificationResponse.data?.data))
    }
  }, [loadNotificationResponse?.data])

  // handle readAllNotifications event
  useEffect(() => {
    Emitter.on('readAllNotifications', (data: boolean) => {
      if (readAllCount === 0) {
        readAll({
          jsonData: { refresh: new Date() }
        })
        readAllCount++
      }
    })
    return () => {
      readAllCount = 0
      Emitter.off('readAllNotifications', (data: boolean) => {})
    }
  }, [])

  // handle read notification event
  useEffect(() => {
    setTimeout(() => {
      Emitter.on('readNotification', (data: number) => {
        read({ jsonData: { id: data } })
      })
    }, 2000)

    return () => {
      Emitter.off('readNotification', (data: number) => {})
    }
  }, [])

  // read all response
  useEffect(() => {
    if (readAllResponse.data) {
      //   readAllCount = 0
      loadNotification({
        page: 1,
        per_page_record: 5
      })
    }
  }, [readAllResponse.data])

  // read response
  useEffect(() => {
    if (readResponse.data) {
      loadNotification({
        page: 1,
        per_page_record: 5
      })
    }
  }, [readResponse.data])

  // handle route
  useEffect(() => {
    if (route) {
      document.title = FM(route?.name, { name: title }) + ' | MAI | KPMG'
    }
  }, [route, title])

  return (
    <>
      <Row className={`align-items-center ${rowClass}`}>
        <Hide IF={noHeader}>
          <Col md={titleCol} className='d-flex align-items-center'>
            <h2
              role={'button'}
              onClick={() => {
                goBack ? navigation(-1) : null
              }}
              className={classNames('content-header-title float-left mb-0 text-primary', {
                'border-end pe-1': !subHeading
              })}
            >
              {goBack ? <ArrowLeft size='25' /> : icon ? icon : null}{' '}
              <span className='align-middle text-capitalize'>{title}</span>
            </h2>
            <div className='text-dark ms-1 p-0 mb-0'>{subHeading}</div>
          </Col>
        </Hide>
        <Col
          md={noHeader ? '12' : childCol}
          className={`py-1 py-md-0 d-flex ${
            noHeader ? '' : 'justify-content-md-end'
          } justify-content-start`}
        >
          {children}
        </Col>
        {description ? (
          <Col md='12' className='mt-1'>
            {description}
          </Col>
        ) : null}
      </Row>
    </>
  )
}

// Header.propTypes = {
//   title: PropTypes.string
// }

export default Header
