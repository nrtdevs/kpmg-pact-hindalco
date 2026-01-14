import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useViewProjectByIdMutation } from '../../redux/RTKQuery/ProjectManagement'
import { ProjectResponse } from '@src/utility/types/typeAuthApi'
import { FM, isValid } from '@src/utility/Utils'
import { ButtonGroup, Card, CardBody, Col, Label, Row, TabContent, TabPane } from 'reactstrap'
import Header from '@src/modules/common/components/header'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'

const ProjectDetail = (props: any) => {
  // location
  const location = useLocation()
  // params
  const params: any = useParams()
  const [loadDetails, res] = useViewProjectByIdMutation()
  const [active, setActive] = useState('1')
  // meeting data
  const tempData = res?.data?.data ?? (location?.state as ProjectResponse)

  // load details
  const loadData = () => {
    loadDetails(params?.id)
  }

  // load details on page
  useEffect(() => {
    if (isValid(params?.id)) {
      loadData()
    }
  }, [params?.id])

  return (
    <>
      <Row>
        <Col md='12'>
          <Header route={props?.route} goBack title={tempData?.name}>
            <ButtonGroup color='dark'>
              {/* <LoadingButton
                tooltip={FM('reload')}
                loading={res.isLoading}
                size='sm'
                color='info'
                onClick={reloadData}
              >
                <RefreshCcw size='14' />
              </LoadingButton> */}
            </ButtonGroup>
          </Header>
          <Card>
            <CardBody>
                <Row>
                <Col md='4'>
                  <Label className='text-uppercase mb-25'>{FM('project-name')}</Label>
                  <p className='text-dark fw-bold text-capitalize'>
                    {tempData?.name}
                  </p>
                </Col>
                <Col md='4'>
                  <Label className='text-uppercase mb-25'>{FM('project-id')}</Label>
                  <p className='text-dark fw-bold text-capitalize'>
                    {tempData?.projectId ?? 'N/A'}
                  </p>
                </Col>
                <Col md='4'>
                  <Label className='text-uppercase mb-25'>{FM('created-by')}</Label>
                  <p className='text-dark fw-bold text-capitalize'>
                    {tempData?.user?.name ?? 'N/A'}
                  </p>
                </Col>
                <Col md='12'>
                  <Label className='text-uppercase mb-25'>{FM('description')}</Label>
                  <p className='text-dark fw-bold text-capitalize'>
                    {tempData?.description ?? 'N/A'}
                  </p>
                </Col>
                </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ProjectDetail
