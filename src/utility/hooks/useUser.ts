import { useEffect, useState } from 'react'
import { useAppSelector } from '../../redux/store'
import { UserData } from '../types/typeAuthApi'
import { isValid } from '../Utils'

const useUser = () => {
  const user = useAppSelector((s) => s.auth?.userData)
  const [t, setT] = useState<UserData | null>(null)

  useEffect(() => {
    if (isValid(user)) {
      setT(user)
    }
  }, [user])

  return t
}

export default useUser
