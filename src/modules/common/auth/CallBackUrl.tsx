// ** React Imports
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

// ** Reactstrap Imports
import { Alert, CardText, Col, Container, Form, Row } from 'reactstrap'

// ** Styles
import '@styles/react/pages/page-authentication.scss'


import { useAppDispatch, useAppSelector } from '@src/redux/store'

import {

    FM,
    SuccessToast,
    isValid,

} from '@src/utility/Utils'

import { useContext, useEffect, useState } from 'react'

import loginBackground from '@src/assets/images/backgrounds/loginBg.png'

import logoImage from '@@assets/images/logo/logo.svg'


import { useOutlookCallbackMutation } from '@src/modules/meeting/redux/RTKQuery/AppSettingRTK'
import { handleAppSetting } from '@src/redux/layout'



const CallBackUrl = () => {

    const loacation = useLocation()
    const navigation = useNavigate()
    const appSettings = useAppSelector((state) => state.layout.appSettings)
    const dispatch = useAppDispatch()
    const [outlookCallBack, res] = useOutlookCallbackMutation()

    // const hadleCallBack = (e) => {
    //     e.preventDefault()
    //     if (isValid(params.code)) {

    //     }
    // }
    // console.log("params", loacation)

    useEffect(() => {

        if (loacation) {
            outlookCallBack({
                jsonData: {
                    code: loacation.search.split('=')[1],
                }
            })
        }
    }, [loacation])
    // console.log("res", res)
    useEffect(() => {
        if (res.isSuccess) {
            SuccessToast(FM('email-connected-successfully'))
            dispatch(handleAppSetting(res.data?.data))
            navigation('/dashboard')
        }
    }, [res])

    return (
        <>
            <div className='myLogin'>
                <div className='login-bg'>
                    <Container fluid>
                        <Row className='position-absolute'>
                            <Col md='8' className='offset-4'>
                                <img src={logoImage} className='logo-image' alt='Login V1' />
                            </Col>
                        </Row>
                        <Row className='d-flex align-items-center full-height'>
                            <Col
                                md='4'
                                className=' offset-2 content-center d-flex justify-content-end d-none d-md-block'
                            >
                                <img src={loginBackground} className='img-fluid' alt='Login V1' />
                            </Col>
                            <Col md='3' sm='6' className='offset-md-1 offset-sm-3'>
                                <div className=''>
                                    <h2 className='media-wale'></h2>
                                    <CardText tag='h1' className='mb-5 text-light text-center'>
                                        {appSettings?.app_name ?? 'PROJECT ACTIONS AND COLLABORATION TRACKER'}
                                    </CardText>


                                    <div className='bg-white text-center'>
                                        <Alert color='success' className='p-1'>
                                            <p className='mb-0'>{FM('redirecting')}</p>
                                        </Alert>
                                    </div>


                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        </>
    )

    //   return (
    //     <>
    //       <div className='auth-advanced'>
    //         <Container fluid>
    //           <Row>
    //             <Col md='12' className='d-none d-lg-block position-absolute'>
    //               {/* <div className='logo-bg-bottom'></div>
    //             <div className='logo-bg-bottom-2'></div> */}
    //               <div className='logo-bg'>
    //                 <div className='logo-content'>
    //                   <AppLogo />
    //                   {/* {appSettings?.app_logo ? (
    //                   <img src={appSettings?.app_logo} alt='logo' style={{ height: '30px' }} />
    //                 ) : (
    //                   <Shimmer width={100} height={30} />
    //                 )} */}
    //                 </div>
    //               </div>
    //               {/* <div className='bg-bottom'></div> */}
    //             </Col>
    //           </Row>
    //           <Row className='align-items-center h-100 col-100vh'>
    //             <Col
    //               md='6'
    //               className='d-flex  align-items-center justify-contents-center d-none d-lg-block'
    //             >
    //               <img src={loginBackground} alt='logo' style={{ width: '85%', height: 'auto' }} />
    //             </Col>
    //             <Col md='4' lg='3' className='offset-md-4 offset-lg-0'>
    //               <div className='card-groupx'>
    //                 {/* <div className='login-card'></div> */}
    //                 {/* <div className='login-card-1'> */}
    //               </div>
    //               {/* <div className='login-card-2'></div> */}
    //               {/* </div> */}
    //             </Col>
    //           </Row>
    //         </Container>
    //         <div className='bottom-text'>
    //           {/* <p className='border-bottom text-white'>India IT Services</p> */}
    //           <p className='text-white'>©{new Date().getFullYear()} KPMG International Cooperative</p>
    //         </div>
    //       </div>
    //     </>
    //   )
}

export default CallBackUrl
