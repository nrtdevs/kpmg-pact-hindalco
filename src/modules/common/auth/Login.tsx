// ** React Imports
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

// ** Reactstrap Imports
import { Alert, CardText, Col, Container, Form, Row } from 'reactstrap'

// ** Styles
import '@styles/react/pages/page-authentication.scss'

// app logo
import { ReactComponent as AppLogo } from '@@assets/images/logo/logo.svg'
import LoadingButton from '@modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@modules/common/components/formGroupCustom/FormGroupCustom'
import { handleLogin } from '@src/redux/authentication'
import { useAppDispatch, useAppSelector } from '@src/redux/store'
import { Patterns } from '@src/utility/Const'
import Show from '@src/utility/Show'
import {
  ErrorToast,
  FM,
  SuccessToast,
  base64Encode,
  decrypt,
  encrypt,
  encrypt1,
  getHomeRouteForLoggedInUser,
  isDebug,
  isValid,
  log
} from '@src/utility/Utils'
import { AbilityContext } from '@src/utility/context/Can'
import { loginApi, otpApi } from '@src/utility/http/Apis/auth'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Shimmer from '../components/shimmers/Shimmer'
import loginBackground from '@src/assets/images/backgrounds/loginBg.png'
import backgroundImage from '@src/assets/images/backgrounds/Picture1.png'
import logoImage from '@@assets/images/logo/logo.svg'

const defaultValues = {
  //   password: '12345678',
  //   email: 'admin@gmail.com'
  otp: ''
}

const extraPermissions = [
  //   {
  //     action: 'dashboard-browse',
  //     subject: 'dashboard'
  //   }
]

const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [accountLocked, setAccountLocked] = useState<any>(null)
  const [remainingTime, setRemainingTime] = useState<any>(600)
  const [otpSentClicked, setOtpSentClicked] = useState(false)
  const [resendOtpTime, setResendOtpTime] = useState(60)
  const ability = useContext(AbilityContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect_to')
  const [loggedIn, setLoggedIn] = useState(false)
  const appSettings = useAppSelector((state) => state.layout.appSettings)

  // log('appSettings', appSettings)

  // ** Function to handle form submit
  const form = useForm<any>({ defaultValues })
  const {
    control,
    setError,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = form

  // ** disable right click and inspect element
  useEffect(() => {
    if (!isDebug) {
      document.addEventListener('contextmenu', (event) => event.preventDefault())

      document.onkeydown = function (e) {
        // disable F12 key
        if (e.keyCode == 123) {
          return false
        }

        // disable I key
        if (e.ctrlKey && e.shiftKey && e.keyCode == 73) {
          return false
        }

        // disable J key
        if (e.ctrlKey && e.shiftKey && e.keyCode == 74) {
          return false
        }

        // disable U key
        if (e.ctrlKey && e.keyCode == 85) {
          return false
        }
      }
    }
    return () => {
      document.removeEventListener('contextmenu', () => {})
    }
  }, [])

  // validate otp
  const validateOtp = (data: any) => {
    if (isValid(data)) {
      otpApi({
        jsonData: { email: encrypt1(data?.email), otp: encrypt1(data?.otp) },
        loading: setLoading,
        error: (err) => {
          log(err)
          setValue('otp', '')
        },
        success: (res) => {
          setOtpSent(false)
          const permissions: any =
            res?.data?.permissions?.map((a: any) => {
              return { action: a?.action, subject: a?.subject }
            }) ?? []
          const data: any = {
            ...res?.data,
            accessToken: res?.data.access_token,
            refreshToken: res?.data.access_token,
            ability: permissions.concat(extraPermissions)
          }
          dispatch(handleLogin(data))
          ability.update(data?.ability)
          setLoggedIn(true)
          const redirectUrl = getHomeRouteForLoggedInUser(data)
          // log('redirectUrl', redirectUrl)
          navigate(getHomeRouteForLoggedInUser(data))
        }
      })
    }
  }

  // login api
  const onSubmit = (jsonData: any, invalid: any, forOtp: boolean = false) => {
    console.log('jsonData', jsonData)
    setLoggedIn(false)
    try {
      if (isValid(jsonData)) {
        log('decrypt', decrypt(encrypt(jsonData?.email)), decrypt(encrypt(jsonData?.password)))
        if (isValid(jsonData?.otp)) {
          validateOtp(jsonData)
        } else {
          loginApi({
            jsonData: {
              ...jsonData,
              email: encrypt1(jsonData?.email),
              password: encrypt1(jsonData?.password),
              logout_from_all_devices: jsonData?.logout_from_all_devices === 1 ? true : false
            },
            loading: setLoading,
            error: (err) => {
              log(err)
              if (err?.data?.data?.is_logged_in) {
                setIsLoggedIn(true)
              } else if (err?.data?.data?.account_locked) {
                if (accountLocked === null) {
                  setRemainingTime(err?.data?.data?.time)
                  setAccountLocked(true)
                }
              } else {
                ErrorToast(err?.data?.message)
              }
            },
            success: (res) => {
              setOtpSent(true)
              setResendOtpTime(60)
              setOtpSentClicked(false)
              setIsLoggedIn(false)
              setAccountLocked(null)

              SuccessToast(FM('otp-sent-successfully'))
            }
          })
        }
      }
    } catch (error) {
      console.log('error', error)
    }
  }
  // run timer to resend otp after 60 seconds and reset it to 60 seconds
  useEffect(() => {
    if (otpSent) {
      if (resendOtpTime > 0) {
        const timer = setTimeout(() => {
          setResendOtpTime(resendOtpTime - 1)
        }, 1000)
        return () => clearTimeout(timer)
      } else {
        setResendOtpTime(0)
      }
    }
  }, [otpSent, resendOtpTime])

  useEffect(() => {
    if (isValid(accountLocked)) {
      let timer: any = null
      if (remainingTime > 0) {
        timer = setTimeout(() => {
          setRemainingTime(remainingTime - 1)
        }, 1000)
      } else {
        setRemainingTime(600)
        setAccountLocked(null)
        return () => clearTimeout(timer)
      }
    }
  }, [accountLocked, remainingTime])

  // convert seconds to minutes and seconds
  const convertSecondsToMinutes = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const formattedTime = `${(minutes % 60).toString().padStart(2, '0')} min and ${(seconds % 60)
      .toString()
      .padStart(2, '0')} sec`

    return formattedTime
  }

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
                  <Show IF={isValid(accountLocked)}>
                    <div className='bg-white text-center'>
                      <Alert color='danger' className='p-1'>
                        <p className='mb-0'>
                          {FM('account-locked', { time: convertSecondsToMinutes(remainingTime) })}
                        </p>
                      </Alert>
                    </div>
                  </Show>
                  <Show IF={loggedIn}>
                    <div className='bg-white text-center'>
                      <Alert color='warning' className='p-1'>
                        <p className='mb-0'>{FM('redirecting')}</p>
                      </Alert>
                    </div>
                  </Show>
                  <Form className='auth-login-forms mt-2' onSubmit={handleSubmit(onSubmit)}>
                    <FormGroupCustom
                      control={control}
                      name='email'
                      type='email'
                      isDisabled={otpSent}
                      noLabel
                      className={'mb-1'}
                      inputGroupClassName={'input-group-md'}
                      rules={{ required: true, pattern: Patterns.EmailOnly }}
                      label={FM('email')}
                    />
                    <div className='d-flex justify-content-end'>
                      <Link to='/forgot-password'>
                        <p className='mb-0' style={{ color: 'white' }}>
                          {FM('forgot-password?')}
                        </p>
                      </Link>
                    </div>
                    {/* <input type={'password'} /> */}
                    <FormGroupCustom
                      control={control}
                      name='password'
                      type='password'
                      className={'mb-1'}
                      isDisabled={otpSent}
                      autocomplete='off'
                      inputClassName={''}
                      rules={{ required: true }}
                      inputGroupClassName={'input-group-md'}
                      noLabel
                    />

                    <Row>
                      <Show IF={isLoggedIn && !isValid(accountLocked)}>
                        <FormGroupCustom
                          control={control}
                          name='logout_from_all_devices'
                          type='checkbox'
                          placeholder={FM('logout-from-all-devices')}
                          label={FM('logout-from-all-devices')}
                          className={'mb-1 ms-2'}
                          rules={{ required: false }}
                          inputGroupClassName={'input-group-md'}
                        />
                      </Show>
                      <Show IF={otpSent}>
                        <Col>
                          <FormGroupCustom
                            control={control}
                            name='otp'
                            type='text'
                            placeholder={FM('enter-otp')}
                            className={'mb-1'}
                            onRegexValidation={{
                              form: form,
                              fieldName: 'otp'
                            }}
                            rules={{ required: false }}
                            inputGroupClassName={'input-group-md'}
                            noLabel
                          />

                          <LoadingButton
                            loading={otpSentClicked && loading}
                            disabled={resendOtpTime > 0}
                            color={'info'}
                            size={'sm'}
                            className={' mb-1 '}
                            // type='submit'
                            onClick={() => {
                              setValue('otp', '')
                              setOtpSentClicked(true)
                              handleSubmit((onValid) => onSubmit(onValid, null, true))()
                            }}
                          >
                            {FM('resend-otp')} {resendOtpTime > 0 ? `(${resendOtpTime})` : ''}
                          </LoadingButton>
                        </Col>
                      </Show>
                    </Row>
                    <LoadingButton
                      size='lg'
                      loading={otpSentClicked ? false : loading}
                      className='mb-1 mt-1'
                      color='info'
                      disabled={otpSent ? !isValid(watch('otp')) : false}
                      block
                    >
                      {otpSent ? FM('sign-in') : FM('send-otp')}
                    </LoadingButton>

                    <div className='text-center mb-5 text-light'>in-fmpivotsupport@kpmg.com</div>
                    <div className='copy small mt-5 text-light '>
                      ©{new Date().getFullYear()} KPMG International Cooperative
                    </div>
                  </Form>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  )
}

export default Login
