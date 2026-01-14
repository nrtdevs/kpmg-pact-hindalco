// ** Icons Import
import themeConfig from '@src/configs/themeConfig'

const Footer = () => {
  return (
    <p className='clearfix mb-0'>
      <span
        className='float-md-start d-block d-md-inline-block mt-25'
        style={{
          fontSize: '0.8rem'
        }}
      >
        {/* <BsPopover
          content={themeConfig.app.copyrightFull}
          trigger='hover'
          placement='top'
          popperClassName='long-popup'
        > */}
        {themeConfig.app.copyright}
        {/* </BsPopover> */}
      </span>
      {/* <span className='float-md-end d-none d-md-block'>
        Hand-crafted & Made with
        <Heart size={14} />
      </span> */}
    </p>
  )
}

export default Footer
