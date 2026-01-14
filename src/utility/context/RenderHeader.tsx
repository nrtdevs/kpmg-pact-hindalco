import React, { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'

type RenderHeaderMenuType = {
  element: any
  setHeaderMenu: (e: any) => void
}
export const RenderHeaderMenu = React.createContext<RenderHeaderMenuType>({
  element: null,
  setHeaderMenu(e) {}
})

export function RenderHeaderMenuProvider({ children }) {
  const [element, setHeaderMenu] = useState<any>(null)

  return (
    <RenderHeaderMenu.Provider value={{ element, setHeaderMenu }}>
      {children}
    </RenderHeaderMenu.Provider>
  )
}
