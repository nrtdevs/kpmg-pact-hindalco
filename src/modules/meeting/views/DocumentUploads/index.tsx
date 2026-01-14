// import { yupResolver } from '@hookform/resolvers/yup'
// import useUser from '@hooks/useUser'
// import { QueryStatus } from '@reduxjs/toolkit/dist/query'
// import { useModal } from '@src/modules/common/components/modal/HandleModal'
// import { Patterns } from '@src/utility/Const'
// import { Permissions } from '@src/utility/Permissions'
// import { Can } from '@src/utility/Show'
// import {
//   FM,
//   SuccessToast,
//   emitAlertStatus,
//   isValid,
//   isValidArray,
//   log,
//   setInputErrors,
//   truncateText
// } from '@src/utility/Utils'
// import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
// import { InvoiceResponse, ProjectResponse } from '@src/utility/types/typeAuthApi'
// import { Fragment, useContext, useEffect, useReducer } from 'react'
// import { TableColumn } from 'react-data-table-component'
// import { useForm } from 'react-hook-form'
// import * as yup from 'yup'
// import {
//   useCreateOrUpdateProjectMutation,
//   useDeleteProjectMutation,
//   useLoadProjectMutation
// } from '../../redux/RTKQuery/ProjectManagement'
// import { stateReducer } from '@src/utility/stateReducer'
// import CustomDataTable, {
//   TableFormData
// } from '@src/modules/common/components/CustomDataTable/CustomDataTable'
// import { ButtonGroup, Col, Form, Label, NavItem, NavLink, Row } from 'reactstrap'
// import BsTooltip from '@src/modules/common/components/tooltip'
// import { CheckCircle, Edit, FilePlus, FileText, RefreshCcw, Trash2 } from 'react-feather'
// import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
// import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
// import { t } from 'i18next'
// import DropDownMenu from '@src/modules/common/components/dropdown'
// import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
// import Header from '@src/modules/common/components/header'
// import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
// import { Link } from 'react-router-dom'
// import { getPath } from '@src/router/RouteHelper'

// const projectFormSchema = {
//   name: yup
//     .string()
//     .required()
//     // match alphabets and spaces only
//     .matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces')),
//   projectId: yup
//     .string()
//     .required()
//     // match alphabets and spaces only
//     .matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces')),
//   description: yup
//     .string()
//     .required()
//     .when({
//       is: (values: string) => values?.length > 0,
//       then: (schema) =>
//         schema.matches(Patterns.AlphaNumericOnly, FM('name-must-contain-only-letters-and-spaces'))
//       //   otherwise: (schema) => schema.notRequired()
//     })
// }

// // validate
// const schema = yup.object(projectFormSchema).required()

// type States = {
//   page?: any
//   per_page_record?: any
//   enalbleVerify?: boolean

//   enableReject?: boolean
//   filterData?: any
//   reload?: any
//   isAddingNewData?: boolean
//   search?: string
//   lastRefresh?: any
//   selectedUser?: ProjectResponse
//   verifyData?: ProjectResponse
//   selectedRowsCount?: any
//   enableEdit?: boolean
// }

// const defaultValues: ProjectResponse = {
//   id: undefined,
//   name: undefined,
//   description: undefined,
//   created_at: undefined,
//   updated_at: undefined,
//   status: undefined,
//   projectId: undefined,
//   user_id: undefined
// }

// const DocumentUpload = (props: any) => {
//   // header menu context
//   const { setHeaderMenu } = useContext(RenderHeaderMenu)
//   // user
//   const user = useUser()
//   // can add project
//   const canAddProject = Can(Permissions.projectAdd)
//   // can edit project
//   const canEditProject = Can(Permissions.projectEdit)
//   // can delete project
//   const canDeleteProject = Can(Permissions.projectDelete)
//   // can view project
//   const canView = Can(Permissions.projectRead)

//   // form hook
//   const form = useForm<ProjectResponse>({
//     resolver: yupResolver(schema),
//     defaultValues
//   })

//   // toggle add modal
//   const [modalAdd, toggleModalAdd] = useModal()
//   const [rejectModal, toggleRejectModal] = useModal()
//   const [verifyModal, toggleVerifyModal] = useModal()
//   const [modelView, toggleModelView] = useModal()
//   // toggle view modal
//   const [modalView, toggleModalView] = useModal()
//   // create and update project mutation
//   const [createProject, createProjectResponse] = useCreateOrUpdateProjectMutation()
//   // delete project mutation
//   const [deleteProject, deleteProjectResponse] = useDeleteProjectMutation()
//   // load project mutation
//   const [loadProject, loadProjectResponse] = useLoadProjectMutation()
//   // default states
//   const initState: States = {
//     page: 1,
//     per_page_record: 20,
//     filterData: undefined,
//     search: '',
//     enableEdit: false,
//     selectedRowsCount: undefined,
//     enalbleVerify: false,
//     enableReject: false,
//     lastRefresh: new Date().getTime()
//   }

//   // state reducer
//   const reducers = stateReducer<States>
//   // state
//   const [state, setState] = useReducer(reducers, initState)

//   const closeVerifyModal = () => {
//     setState({
//       enalbleVerify: false
//     })
//     form.reset()
//     toggleVerifyModal()
//   }

//   // close add
//   const closeAddModal = () => {
//     setState({
//       selectedUser: undefined,
//       enableEdit: false
//     })
//     form.reset()
//     toggleModalAdd()
//   }

//   const closeRejectModal = () => {
//     setState({
//       enableReject: false
//     })
//     form.reset()
//     toggleRejectModal()
//   }

//   const closeViewModal = (reset = true) => {
//     if (reset) {
//       setState({
//         selectedUser: undefined
//       })
//       form.reset()
//     }
//     toggleModalView()
//   }

//   // handle save user
//   const handleSaveUser = (data: ProjectResponse) => {
//     createProject({
//       jsonData: {
//         ...state?.selectedUser,
//         ...data,
//         id: isValid(state?.selectedUser?.id) ? state?.selectedUser?.id : undefined
//         // owner_id: data?.owner_id?.value,
//         // invoice_check_id: data?.invoice_check_id?.value,
//         // epcm_id: data?.epcm_id?.value,
//         // status: isValid(data?.status) ? data?.status : 'pending'
//       }
//     })
//   }

//   // handle project list
//   const projectList = () => {
//     loadProject({
//       page: state.page,
//       per_page_record: state.per_page_record,
//       jsonData: {
//         name: !isValid(state.filterData) ? state.search : undefined,
//         ...state.filterData
//       }
//     })
//   }

//   // handle project create response
//   useEffect(() => {
//     if (!createProjectResponse.isUninitialized) {
//       if (createProjectResponse.isSuccess) {
//         closeAddModal()
//         projectList()
//         SuccessToast(FM('project-created-successfully'))
//       } else if (createProjectResponse.isError) {
//         // handle error
//         const errors: any = createProjectResponse.error
//         //   log(errors)
//         setInputErrors(errors?.data?.data, form.setError)
//       }
//     }
//   }, [createProjectResponse])

//   // handle pagination and load list
//   useEffect(() => {
//     projectList()
//   }, [
//     state.page,
//     state.search,
//     state.per_page_record,
//     state.filterData,
//     state.lastRefresh
//     // invoiceActionResult?.isSuccess
//   ])

//   const handlePageChange = (e: TableFormData) => {
//     setState({ ...e })
//   }

//   // handle filter data
//   const handleFilterData = (e: any) => {
//     setState({
//       filterData: { ...e },
//       page: 1,
//       search: '',
//       per_page_record: 20
//     })
//   }

//   // reload Data
//   const reloadData = () => {
//     setState({
//       page: 1,
//       search: '',
//       filterData: undefined,
//       per_page_record: 20,
//       lastRefresh: new Date().getTime()
//     })
//   }

//   // handle actions
//   const handleActions = (ids?: any, action?: any, eventId?: any) => {
//     if (isValidArray(ids)) {
//       deleteProject({
//         ids,
//         eventId,
//         action
//       })
//     }
//   }

//   useEffect(() => {
//     if (!canAddProject) return
//     setHeaderMenu(
//       <>
//         <NavItem className=''>
//           <BsTooltip title={FM('create-project')}>
//             <NavLink
//               className=''
//               onClick={() => {
//                 setState({
//                   enableEdit: false
//                 })
//                 form.reset()
//                 toggleModalAdd()
//               }}
//             >
//               <FilePlus className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
//             </NavLink>
//           </BsTooltip>
//         </NavItem>
//       </>
//     )
//     return () => {
//       setHeaderMenu(null)
//     }
//   }, [modalAdd, canAddProject])

//   // handle action result
//   useEffect(() => {
//     // log(deleteProjectResponse)
//     if (deleteProjectResponse?.isLoading === false) {
//       if (deleteProjectResponse?.isSuccess) {
//         emitAlertStatus('success', null, deleteProjectResponse?.originalArgs?.eventId)
//       } else if (deleteProjectResponse?.error) {
//         emitAlertStatus('failed', null, deleteProjectResponse?.originalArgs?.eventId)
//       }
//     }
//   }, [deleteProjectResponse])

//   useEffect(() => {
//     if (state.enableEdit) {
//       form.setValue('name', state?.selectedUser?.name)
//       form.setValue('projectId', state?.selectedUser?.projectId)
//       form.setValue('description', state?.selectedUser?.description)
//     }
//   }, [state.enableEdit])

//   const renderViewModal = () => {
//     return (
//       <CenteredModal
//         open={modalView}
//         // done={FM('close')}
//         modalClass={'modal-md'}
//         title={FM('project')}
//         hideSave
//         handleModal={closeViewModal}
//         loading={loadProjectResponse.isLoading}
//         // handleSave={form.handleSubmit(handleSaveUser)}
//       >
//         <div className='p-2'>
//           <Row>
//             <Col md='6'>
//               <Label className='text-uppercase text-dark fw-bolder mb-25'>
//                 {FM('project-name')}
//               </Label>
//               <p className='text-capitalize'>{state.selectedUser?.name ?? 'N/A'}</p>
//             </Col>
//             <Col md='6'>
//               <Label className='text-uppercase text-dark fw-bolder mb-25'>
//                 {FM('contract-reference')}
//               </Label>
//               <p className='text-capitalize'>{state.selectedUser?.projectId ?? 'N/A'}</p>
//             </Col>
//             {/* <Col md='4'>
//               <Label className='text-uppercase text-dark fw-bold mb-25'>{FM('created-by')}</Label>
//               <p className='text-capitalize'>{state.selectedUser?.user?.name ?? 'N/A'}</p>
//             </Col> */}
//             <Col md='12'>
//               <Label className='text-uppercase text-dark fw-bolder mb-25'>
//                 {FM('description')}
//               </Label>
//               <p className='text-capitalize'>{state.selectedUser?.description ?? 'N/A'}</p>
//             </Col>
//           </Row>
//         </div>
//       </CenteredModal>
//     )
//   }

//   const renderCreateModal = () => {
//     return (
//       <CenteredModal
//         open={modalAdd}
//         done={state.enableEdit ? 'save' : 'save'}
//         modalClass={'modal-lg'}
//         title={state.enableEdit ? FM('edit-project') : FM('create-project')}
//         handleModal={closeAddModal}
//         loading={createProjectResponse.isLoading}
//         handleSave={form.handleSubmit(handleSaveUser)}
//       >
//         <div className='p-2'>
//           <Form onSubmit={form.handleSubmit(handleSaveUser)}>
//             {/* submit form on enter button!! */}
//             <button className='d-none'></button>
//             <Row>
//               <Col md='6'>
//                 <FormGroupCustom
//                   key={`${state?.selectedUser?.name}`}
//                   control={form.control}
//                   label={FM('name')}
//                   name='name'
//                   type='text'
//                   className='mb-1'
//                   rules={{ required: true }}
//                 />
//               </Col>
//               <Col md='6'>
//                 <FormGroupCustom
//                   key={`${state?.selectedUser?.projectId}`}
//                   control={form.control}
//                   label={FM('contract-reference')}
//                   name='projectId'
//                   isDisabled={isValid(state?.selectedUser?.projectId)}
//                   type='text'
//                   className='mb-1'
//                   rules={{ required: true }}
//                 />
//               </Col>
//               <Col md='12'>
//                 <FormGroupCustom
//                   key={`${state?.selectedUser?.description}`}
//                   control={form.control}
//                   label={FM('description')}
//                   name='description'
//                   type='textarea'
//                   isDisabled={false}
//                   className='mb-1'
//                   rules={{ required: true }}
//                 />
//               </Col>
//             </Row>
//           </Form>
//         </div>
//       </CenteredModal>
//     )
//   }

//   const columns: TableColumn<ProjectResponse>[] = [
//     {
//       name: FM('name'),
//       id: 'name',
//       cell: (row) => (
//         // <Fragment>
//         //   <Link
//         //     state={{ ...row }}
//         //     to={getPath('project.view', { id: row?.id })}
//         //     role={'button'}
//         //     className={canView ? 'text-primary' : 'pe-none'}
//         //   >
//         //     {truncateText(row?.name, 50)}
//         //   </Link>
//         // </Fragment>
//         <Fragment>
//           <span
//             role={'button'}
//             onClick={() => {
//               setState({
//                 selectedUser: row
//               })
//               toggleModalView()
//             }}
//             className='text-primary'
//           >
//             {truncateText(row?.name, 50)}
//           </span>
//         </Fragment>
//       )
//     },
//     {
//       name: FM('contract-reference'),

//       id: 'projectId',
//       cell: (row) => <Fragment>{row?.projectId}</Fragment>
//     },
//     {
//       name: FM('description'),

//       id: 'description',
//       cell: (row) => (
//         <Fragment>
//           <div className='text-wrap'>{truncateText(row?.description, 80)}</div>
//         </Fragment>
//       )
//     },

//     //  {
//     //    name: FM('status'),

//     //    id: 'status',
//     //    cell: (row) => (
//     //      <Fragment>
//     //        <span
//     //          className={`badge badge-pill badge-light-${
//     //            row?.status === InvoiceStatus.approved
//     //              ? 'success'
//     //              : row?.status === InvoiceStatus.rejected
//     //              ? 'danger'
//     //              : 'primary'
//     //          }`}
//     //        >
//     //          {getKeyByValue(InvoiceStatus, row?.status)}
//     //        </span>
//     //      </Fragment>
//     //    )
//     //  },

//     {
//       name: FM('action'),
//       cell: (row) => (
//         <Fragment>
//           <DropDownMenu
//             options={[
//               {
//                 IF: canEditProject,
//                 icon: <Edit size={14} />,
//                 onClick: () => {
//                   setState({
//                     enableEdit: true,
//                     selectedUser: row
//                   })
//                   toggleModalAdd()
//                 },
//                 name: FM('edit')
//               },
//               {
//                 IF: canDeleteProject,
//                 noWrap: true,
//                 name: (
//                   <ConfirmAlert
//                     menuIcon={<Trash2 size={14} />}
//                     onDropdown
//                     eventId={`item-delete-${row?.id}`}
//                     text={FM('are-you-sure')}
//                     title={FM('delete-item', { name: row?.name })}
//                     onClickYes={() => {
//                       handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
//                     }}
//                     onSuccessEvent={onSuccessEvent}
//                   >
//                     {FM('delete')}
//                   </ConfirmAlert>
//                 )
//               }
//             ]}
//           />
//         </Fragment>
//       )
//     }
//   ]
//   const onSuccessEvent = () => {
//     reloadData()
//   }

//   // handle sort
//   const handleSort = (column: any, dir: string) => {
//     setState({
//       filterData: {
//         ...state.filterData,
//         sort: {
//           column: column?.id,
//           dir:
//             loadProjectResponse?.originalArgs?.jsonData?.sort?.column === column?.id
//               ? loadProjectResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
//                 ? 'desc'
//                 : 'asc'
//               : dir
//         }
//       }
//     })
//   }
//   return (
//     <Fragment>
//       {renderCreateModal()}
//       {renderViewModal()}
//       <Header route={props?.route} icon={<FileText size='25' />} title={FM('document-upload')}>
//         <ButtonGroup color='dark'>
//           {/* <InvoiceFilter handleFilterData={handleFilterData} /> */}
//           <LoadingButton
//             tooltip={FM('reload')}
//             loading={loadProjectResponse.isLoading}
//             size='sm'
//             color='info'
//             onClick={reloadData}
//           >
//             <RefreshCcw size='14' />
//           </LoadingButton>
//         </ButtonGroup>
//       </Header>
//       <CustomDataTable<ProjectResponse>
//         initialPerPage={20}
//         isLoading={loadProjectResponse.isLoading}
//         columns={columns}
//         // options={options}
//         // selectableRows={canAddAction && user?.role_id !== 3}
//         searchPlaceholder='search-project'
//         onSort={handleSort}
//         // selectableRowDisabled={(row: any) => row?.id === user?.id}
//         defaultSortField={loadProjectResponse?.originalArgs?.jsonData?.sort}
//         paginatedData={loadProjectResponse?.data}
//         handlePaginationAndSearch={handlePageChange}
//       />
//     </Fragment>
//   )
// }

// export default DocumentUpload
import React from 'react'

function DocumentUpload() {
  return <div>Under Development</div>
}

export default DocumentUpload
