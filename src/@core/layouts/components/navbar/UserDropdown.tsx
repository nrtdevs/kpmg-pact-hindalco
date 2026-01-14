// ** React Imports
import { Link } from 'react-router-dom'
import { Fragment, useEffect, useState } from 'react'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { handleLogout } from '@store/authentication'

// ** Third Party Components
import {
  User,
  Mail,
  CheckSquare,
  MessageSquare,
  Settings,
  CreditCard,
  HelpCircle,
  Power,
  Lock
} from 'react-feather'

// ** Reactstrap Imports
import { UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'

// ** Default Avatar Image
import defaultAvatar from '@src/assets/images/portrait/small/avatar-s-11.jpg'
import httpConfig from '@src/utility/http/httpConfig'
import { FM, JsonParseValidate } from '@src/utility/Utils'
import { isUserLoggedIn } from '@src/auth/utils'
import UpdateViewProfile from '@src/modules/meeting/views/users/UpdateViewPorfile'
import Emitter from '@src/utility/Emitter'
import Show from '@src/utility/Show'
import { useAppSelector } from '@src/redux/store'
import axios from 'axios'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { Permissions } from '@src/utility/Permissions'

const UserDropdown = () => {
  // ** Store Vars
  const dispatch = useDispatch()
  const user = useAppSelector((state) => state.auth.userData)

  // ** State
  const [userData, setUserData] = useState<any>(null)

  //** ComponentDidMount
  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(user)
    }
  }, [user])

  const handleModal = (e: any) => {
    // prevent default
    e.preventDefault()
    // open modal
    Emitter.emit('openUserModal', true)
  }

  const handlePassModal = (e: any) => {
    // prevent default
    e.preventDefault()
    // open modal
    Emitter.emit('openChangePasswordModal', true)
  }

  // logout user
  const handle = () => {
    axios
      .post(httpConfig.baseUrl + ApiEndpoints.logout)
      .then((response) => {
        dispatch(handleLogout())
      })
      .catch((error) => {
        console.log(error)
      })
  }

  //** Vars
  const userAvatar = userData?.avatar ? httpConfig.baseUrl2 + userData.avatar : defaultAvatar

  return (
    <Fragment>
      <UncontrolledDropdown tag='li' className='dropdown-user nav-item'>
        <DropdownToggle
          href='/'
          tag='a'
          className='nav-link dropdown-user-link'
          onClick={(e) => e.preventDefault()}
        >
          <div className='user-nav d-sm-flex d-none'>
            <span className='user-name fw-bold'>
              {(userData && userData['name']) || 'John Doe'}
            </span>
            <span className='user-status'>
              {((userData && userData.role) || userData?.email) ?? ''}
            </span>
          </div>
          {/* <Avatar img={userAvatar} imgHeight='40' imgWidth='40' status='online' /> */}
        </DropdownToggle>
        <DropdownMenu end>
          {/* <Show IF={userData?.role_id === 2}> */}
          <DropdownItem tag={Link} onClick={handleModal}>
            <User size={14} className='me-75' />
            <span className='align-middle'>{FM('profile')}</span>
          </DropdownItem>
          <DropdownItem tag={Link} onClick={handlePassModal}>
            <Lock size={14} className='me-75' />
            <span className='align-middle'>{FM('change-password')}</span>
          </DropdownItem>
          <Show IF={Permissions.appSettingsBrowse}>
            <DropdownItem tag={Link} to='/app-setting'>
              <Settings size={14} className='me-75' />
              <span className='align-middle'>{FM('app-setting')}</span>
            </DropdownItem>
          </Show>
          {/* </Show> */}
          {/* 
        <DropdownItem tag={Link} to='/apps/email'>
          <Mail size={14} className='me-75' />
          <span className='align-middle'>Inbox</span>
        </DropdownItem>
        <DropdownItem tag={Link} to='/apps/todo'>
          <CheckSquare size={14} className='me-75' />
          <span className='align-middle'>Tasks</span>
        </DropdownItem>
        <DropdownItem tag={Link} to='/apps/chat'>
          <MessageSquare size={14} className='me-75' />
          <span className='align-middle'>Chats</span>
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem tag={Link} to='/pages/account-settings'>
          <Settings size={14} className='me-75' />
          <span className='align-middle'>Settings</span>
        </DropdownItem>
        <DropdownItem tag={Link} to='/pages/pricing'>
          <CreditCard size={14} className='me-75' />
          <span className='align-middle'>Pricing</span>
        </DropdownItem>
        <DropdownItem tag={Link} to='/pages/faq'>
          <HelpCircle size={14} className='me-75' />
          <span className='align-middle'>FAQ</span>
        </DropdownItem> */}
          <DropdownItem tag={Link} to='/login' onClick={() => handle()}>
            <Power size={14} className='me-75' />
            <span className='align-middle'>Logout</span>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </Fragment>
  )
}

export default UserDropdown
