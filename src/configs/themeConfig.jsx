// Logo Import
import logo from '@src/assets/images/logo/logo.svg'

// You can customize the template with the help of this file

//Template config options
const themeConfig = {
    app: {
        appName: 'MAI',
        appLogoImage: logo,
        copyright: (
            <span className=''>
                © {new Date().getFullYear()} KPMG Assurance and Consulting Services LLP, an Indian Limited
                Liability Partnership and a member firm of the KPMG global organization of independent
                member firms affiliated with KPMG International Limited, a private English company limited
                by guarantee. <span className='d-none d-sm-inline-block'>All rights Reserved</span>
            </span>
        )
    },
    layout: {
        isRTL: false,
        skin: 'light', // light, dark, bordered, semi-dark
        type: 'vertical', // vertical, horizontal
        contentWidth: 'full', // full, boxed
        menu: {
            isHidden: false,
            isCollapsed: false
        },
        navbar: {
            // ? For horizontal menu, navbar type will work for navMenu type
            type: 'sticky', // static , sticky , floating, hidden
            backgroundColor: 'white' // BS color options [primary, success, etc]
        },
        footer: {
            type: 'sticky' // static, sticky, hidden
        },
        customizer: false,
        scrollTop: false, // Enable scroll to top button
        toastPosition: 'top-right' // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
    }
}

export default themeConfig
