import { useEffect, useState } from 'react'
import { useAppSelector } from '../../redux/store'
import { UserData } from '../types/typeAuthApi'
import { isValid, isValidArray } from '../Utils'
import { Modules } from '../Const'

const useModules = () => {
  const user = useAppSelector((s) => s.auth?.userData)
  const [mods, setMods] = useState<any | null>()

  useEffect(() => {
    if (isValidArray(user?.assigned_modules)) {
      setMods({
        invoice: !!user?.assigned_modules?.find((a) => a?.invoice === Modules.invoice),
        hindrance: user?.assigned_modules?.find((a) => a?.hindrance === Modules.hindrance),
        meet: user?.assigned_modules?.find((a) => a?.meet === Modules.meet)
      })
    }
  }, [user])

  return {
    invoice: mods?.invoice,
    hindrance: mods?.hindrance,
    meet: mods?.meet
  }
}

export default useModules
