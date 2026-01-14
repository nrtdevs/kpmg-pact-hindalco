// ** React Imports
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'

// ** Icons Imports
import { Circle, Disc, X } from 'react-feather'

// ** Config

// ** Utils
import { getUserData } from '@utils'

// logo
import { ReactComponent as AppLogo } from '@@assets/images/logo/logo.svg'
import { useSkin } from '@hooks/useSkin'
import { useAppSelector } from '@src/redux/store'
import { getPath } from '@src/router/RouteHelper'
import { log } from '@src/utility/Utils'
import { initialAppSettings } from '@src/redux/layout'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'

const VerticalMenuHeader = (props) => {
  // ** Props
  const { menuCollapsed, setMenuCollapsed, setMenuVisibility, setGroupOpen, menuHover } = props
  const appSettings = useAppSelector((state) => state.layout.appSettings)

  // use skin
  const { skin } = useSkin()

  // ** Vars
  const user = getUserData()

  useEffect(() => {
    log('AppSettings', appSettings)
  }, [appSettings])

  // ** Reset open group
  useEffect(() => {
    if (!menuHover && menuCollapsed) setGroupOpen([])
  }, [menuHover, menuCollapsed])

  // ** Menu toggler component
  const Toggler = () => {
    if (!menuCollapsed) {
      return (
        <Disc
          size={20}
          data-tour='toggle-icon'
          className={`${
            skin === 'dark' ? 'text-light' : 'text-brand'
          } toggle-icon d-none d-xl-block`}
          onClick={() => setMenuCollapsed(true)}
        />
      )
    } else {
      return (
        <Circle
          size={20}
          data-tour='toggle-icon'
          className={`${
            skin === 'dark' ? 'text-light' : 'text-brand'
          }  toggle-icon d-none d-xl-block`}
          onClick={() => setMenuCollapsed(false)}
        />
      )
    }
  }

  return (
    <div className='navbar-header'>
      <ul className='nav navbar-nav flex-row'>
        <li className='nav-item me-auto'>
          <NavLink to={getPath('dashboard')} className='navbar-brand'>
            <span className={`brand-logo ${skin === 'dark' ? 'text-light' : 'text-brand'}`}>
              {/* <AppLogo /> */}
              {appSettings?.app_logo ? (
                <img src={appSettings?.app_logo} alt='logo' style={{ height: '15px' }} />
              ) : (
                <Shimmer width={15} height={15} />
              )}
            </span>
            <h2 className={`brand-text mb-0 ${skin === 'dark' ? 'text-light' : 'text-brand'} `}>
              {/* <AppLogo /> */}
              {/* <AppLogo style={{ height: 30 }} /> */}
              {appSettings?.app_logo ? (
                <img src={appSettings?.app_logo} alt='logo' style={{ height: '30px' }} />
              ) : (
                <Shimmer width={100} height={30} />
              )}
            </h2>
          </NavLink>
        </li>
        <li className='nav-item nav-toggle'>
          <div className='nav-link modern-nav-toggle cursor-pointer'>
            <Toggler />
            <X
              onClick={() => setMenuVisibility(false)}
              className='toggle-icon icon-x d-block d-xl-none'
              size={20}
            />
          </div>
        </li>
      </ul>
    </div>
  )
}

export default VerticalMenuHeader
