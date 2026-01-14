// ** React Imports
import { Link } from 'react-router-dom'

// ** Reactstrap Imports
import { Button } from 'reactstrap'

// ** Custom Hooks
import { useSkin } from '@hooks/useSkin'

// ** Illustrations Imports
import illustrationsLight from '@src/assets/images/pages/error.svg'
import illustrationsDark from '@src/assets/images/pages/error-dark.svg'

// ** Styles
import '@styles/base/pages/page-misc.scss'
import { ReactComponent as AppLogo } from '@@assets/images/logo/logo.svg'
import { useAppSelector } from '@src/redux/store'
import Shimmer from '../components/shimmers/Shimmer'

const Error = () => {
  // ** Hooks
  const { skin } = useSkin()
  const appSettings = useAppSelector((state) => state.layout.appSettings)

  const source = skin === 'dark' ? illustrationsDark : illustrationsLight

  return (
    <div className='misc-wrapper'>
      <Link className='brand-logo' to='/'>
        {appSettings?.app_logo ? (
          <img src={appSettings?.app_logo} alt='logo' style={{ height: '30px' }} />
        ) : (
          <Shimmer width={100} height={30} />
        )}
      </Link>
      <div className='misc-inner p-2 p-sm-3'>
        <div className='w-100 text-center'>
          <h2 className='mb-1'>Page Not Found 🕵🏻‍♀️</h2>
          <p className='mb-2'>Oops! 😖 The requested URL was not found on this server.</p>
          <Button
            onClick={() => {
              history.back()
            }}
            color='primary'
            className='btn-sm-block mb-2'
          >
            Go Back
          </Button>
          <img className='img-fluid' src={source} alt='Not authorized page' />
        </div>
      </div>
    </div>
  )
}
export default Error
