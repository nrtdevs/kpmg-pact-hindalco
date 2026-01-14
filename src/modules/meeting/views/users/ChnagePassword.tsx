import { yupResolver } from '@hookform/resolvers/yup'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import { useChangePasswordMutation } from '@src/modules/meeting/redux/RTKQuery/UserManagement'
import { Patterns, Roles } from '@src/utility/Const'
import Emitter from '@src/utility/Emitter'
import Show from '@src/utility/Show'
import { stateReducer } from '@src/utility/stateReducer'
import { Password, UserData } from '@src/utility/types/typeAuthApi'
import {
  checkPassword,
  encrypt,
  FM,
  generatePassword,
  getUserData,
  isValid,
  log,
  setInputErrors,
  setValues,
  SuccessToast
} from '@src/utility/Utils'
import { Fragment, useCallback, useEffect, useReducer } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, Button, Col, Form, Row } from 'reactstrap'
import * as yup from 'yup'
const loggedInUser = getUserData()
// validation schema
const userFormSchema = {
  password: yup
    .string()
    .required()
    // .matches(Patterns.Password, FM('invalid-password')),
    .test((v) => checkPassword(v, loggedInUser)),
  old_password: yup.string().required(),
  'confirm-password': yup
    .string()
    .required()
    .oneOf([yup.ref('password')], FM('passwords-must-match'))
}
// validate
const schema = yup.object(userFormSchema).required()

// states
type States = {
  page?: any
  doNotClose?: boolean
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: UserData
  enableEdit?: boolean
}

const defaultValues: Password = {
  old_password: '',
  password: ''
}
const ChangePassword = ({ data }: { data: UserData }) => {
  // form hook
  const form = useForm<Password>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // create or update user mutation
  const [changePassword, changePasswordResponse] = useChangePasswordMutation()

  // default states
  const initState: States = {
    page: 1,
    per_page_record: 15,
    filterData: undefined,
    search: '',
    enableEdit: false,
    doNotClose: false,
    lastRefresh: new Date().getTime()
  }
  // state reducer
  const reducers = stateReducer<States>
  // state
  const [state, setState] = useReducer(reducers, initState)

  // close add
  const closeAddModal = () => {
    setState({
      selectedUser: undefined,
      enableEdit: false
    })
    form.reset()
    toggleModalAdd()
    localStorage.setItem('modal-closed', 'true')
  }

  // handle save user
  const handleSaveUser = (userData: Password) => {
    changePassword(userData)
  }

  // handle user create response
  useEffect(() => {
    if (!changePasswordResponse.isUninitialized) {
      if (changePasswordResponse.isSuccess) {
        closeAddModal()
        SuccessToast(FM('change-password-successfully'))
      } else if (changePasswordResponse.isError) {
        // handle error
        const errors: any = changePasswordResponse.error
        log(errors)
        setInputErrors(errors?.data?.data, form.setError)
      }
    }
  }, [changePasswordResponse])

  // check data and set it to selected user
  useEffect(() => {
    if (isValid(data?.id)) {
      if (!isValid(data?.password_last_updated)) {
        setTimeout(() => {
          if (localStorage.getItem('modal-closed') !== 'true') {
            setState({
              doNotClose: true,
              selectedUser: data
            })
          }
        }, 1000)
      }
    }
    Emitter.on('openChangePasswordModal', (e: any) => {
      if (isValid(data?.id)) {
        setState({
          doNotClose: e?.doNotClose ?? false,
          selectedUser: data
        })
      }
    })

    return () => {
      Emitter.off('openChangePasswordModal', () => {})
    }
  }, [data])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<UserData>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalAdd()
    }
  }, [state.selectedUser])

  // generate random password
  const generateRandomPassword = useCallback(() => {
    const randomPassword = generatePassword(loggedInUser?.roles?.name === 'Admin' ? 15 : 8)

    form.setValue('password', randomPassword)
    form.setValue('confirm-password', randomPassword)

    // copy password to clipboard
    navigator.clipboard
      .writeText(randomPassword)
      .then(() => {
        SuccessToast(FM('password-copied-to-clipboard'))
      })
      .catch(() => {
        SuccessToast(FM('password-can-not-be-copied-to-clipboard'))
      })
  }, [loggedInUser])

  // create user modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={FM('change-password')}
        handleModal={closeAddModal}
        loading={changePasswordResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
        hideClose={state.doNotClose}
        // disableHeader={state.doNotClose}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            {/* submit form on enter button!! */}
            <button className='d-none'></button>
            <Show IF={state.doNotClose ?? false}>
              <Alert color='danger'>
                <p className='mb-0 p-2'>{FM('please-change-your-password')}</p>
              </Alert>
            </Show>
            <Row>
              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('old-password')}
                  name='old_password'
                  type='password'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('password')}
                  name='password'
                  type='password'
                  tooltip={FM('password-must-contain-at-least-one-number')}
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('confirm-password')}
                  name='confirm-password'
                  type='password'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='12'>
                <Button color='primary' className='mb-1' size='sm' onClick={generateRandomPassword}>
                  {FM('generate-password')}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </CenteredModal>
    )
  }

  return <Fragment>{renderCreateModal()}</Fragment>
}

export default ChangePassword
