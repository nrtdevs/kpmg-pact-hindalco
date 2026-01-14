// ** Vertical Menu Components
import VerticalNavMenuLink from './VerticalNavMenuLink'
import VerticalNavMenuGroup from './VerticalNavMenuGroup'
import VerticalNavMenuSectionHeader from './VerticalNavMenuSectionHeader'

// ** Utils
import {
  canViewMenuItem,
  canViewMenuGroup,
  resolveVerticalNavMenuItemComponent as resolveNavItemComponent
} from '@layouts/utils'

const VerticalMenuNavItems = (props) => {


  // ** Components Object
  const Components = {
    VerticalNavMenuLink,
    VerticalNavMenuGroup,
    VerticalNavMenuSectionHeader
  }

  //   const RenderNavItemsOnly = () => {
  //     const on = []
  //     props.items.map((item, index) => {
  //       const TagName = Components[resolveNavItemComponent(item)]
  //       if (item.children) {
  //         if (canViewMenuGroup(item, modules)) {
  //           on.push(item)
  //         }
  //       } else {
  //         if (canViewMenuItem(item, modules)) {
  //           on.push(item)
  //         }
  //       }
  //     })
  //     return on
  //   }
  //   ** Render Nav Menu Items
  const RenderNavItems = props.items.map((item, index) => {
    const TagName = Components[resolveNavItemComponent(item)]
    if (item.children) {
      return (
        canViewMenuGroup(item) && <TagName item={item} index={index} key={item.id} {...props} />
      )
    }
    return canViewMenuItem(item) && <TagName key={item.id || item.header} item={item} {...props} />
  })
  //   const RenderNavItems = RenderNavItemsOnly().map((item, index) => {
  //     if (item) {
  //       let next = true
  //       const TagName = Components[resolveNavItemComponent(item)]
  //       if (item.hasOwnProperty('header')) {
  //         if (RenderNavItemsOnly()[index + 1]) {
  //           if (RenderNavItemsOnly()[index + 1].hasOwnProperty('id')) {
  //             next = true
  //           } else next = false
  //         } else {
  //           next = false
  //         }
  //       } else {
  //         next = true
  //       }
  //       if (item.children) {
  //         return (
  //           canViewMenuGroup(item, modules) &&
  //           next && <TagName item={item} index={index} key={item.id} {...props} />
  //         )
  //       }
  //       return (
  //         canViewMenuItem(item, modules) &&
  //         next && <TagName key={item.id || item.header} item={item} {...props} />
  //       )
  //     }
  //   })

  return RenderNavItems
}

export default VerticalMenuNavItems
