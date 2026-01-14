// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** ThemeConfig Import
import themeConfig from '@configs/themeConfig'

const initialMenuCollapsed = () => {
  const item = window.localStorage.getItem('menuCollapsed')
  //** Parse stored json or if none return initialValue
  return item ? JSON.parse(item) : themeConfig.layout.menu.isCollapsed
}

const initialDirection = () => {
  const item = window.localStorage.getItem('direction')
  //** Parse stored json or if none return initialValue
  return item ? JSON.parse(item) : themeConfig.layout.isRTL
}

const initialSkin = () => {
  const item = window.localStorage.getItem('skin')
  //** Parse stored json or if none return initialValue
  return item ? JSON.parse(item) : themeConfig.layout.skin
}

export const initialAppSettings = () => {
  const item = window.localStorage.getItem('appSettings')
  //** Parse stored json or if none return initialValue
  return item ? JSON.parse(item) : undefined
}

export const layoutSlice = createSlice({
  name: 'layout',
  initialState: {
    appSettings: initialAppSettings(),
    skin: initialSkin(),
    isRTL: initialDirection(),
    layout: themeConfig.layout.type,
    lastLayout: themeConfig.layout.type,
    menuCollapsed: initialMenuCollapsed(),
    footerType: themeConfig.layout.footer.type,
    navbarType: themeConfig.layout.navbar.type,
    menuHidden: themeConfig.layout.menu.isHidden,
    contentWidth: themeConfig.layout.contentWidth,
    navbarColor: themeConfig.layout.navbar.backgroundColor
  },
  reducers: {
    handleAppSetting: (state, action) => {
      state.appSettings = action.payload
      document.title = action.payload?.app_name ?? 'Loading...'
      localStorage.setItem('appSettings', JSON.stringify(action.payload))
    },
    handleRTL: (state, action) => {
      state.isRTL = action.payload
      window.localStorage.setItem('direction', JSON.stringify(action.payload))
    },
    handleSkin: (state, action) => {
      state.skin = action.payload
      window.localStorage.setItem('skin', JSON.stringify(action.payload))
    },
    handleLayout: (state, action) => {
      state.layout = action.payload
    },
    handleFooterType: (state, action) => {
      state.footerType = action.payload
    },
    handleNavbarType: (state, action) => {
      state.navbarType = action.payload
    },
    handleMenuHidden: (state, action) => {
      state.menuHidden = action.payload
    },
    handleLastLayout: (state, action) => {
      state.lastLayout = action.payload
    },
    handleNavbarColor: (state, action) => {
      state.navbarColor = action.payload
    },
    handleContentWidth: (state, action) => {
      state.contentWidth = action.payload
    },
    handleMenuCollapsed: (state, action) => {
      state.menuCollapsed = action.payload
      window.localStorage.setItem('menuCollapsed', JSON.stringify(action.payload))
    }
  }
})

export const {
  handleRTL,
  handleSkin,
  handleLayout,
  handleLastLayout,
  handleMenuHidden,
  handleNavbarType,
  handleFooterType,
  handleNavbarColor,
  handleContentWidth,
  handleMenuCollapsed,
  handleAppSetting
} = layoutSlice.actions

export default layoutSlice.reducer
