import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import Header from '@src/modules/common/components/header'
import { FM } from '@src/utility/Utils'
import { Home as HomeIcon, RefreshCcw } from 'react-feather'
import { ButtonGroup } from 'reactstrap'

const Home = () => {
  return (
    <div>
      <Header icon={<HomeIcon size='25' />} title={FM('home')}>
        <ButtonGroup color='dark'>
          <LoadingButton tooltip={FM('reload')} loading={false} size='sm' color='info'>
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>
    </div>
  )
}

export default Home
