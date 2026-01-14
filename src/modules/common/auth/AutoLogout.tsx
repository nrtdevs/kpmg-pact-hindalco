import { handleLogout } from '@src/redux/authentication'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import httpConfig from '@src/utility/http/httpConfig'
import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const AutoLogout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  let timer

  const logout = () => {
    // Perform logout actions like clearing session, redirecting, etc.

    axios
      .post(httpConfig.baseUrl + ApiEndpoints.logout)
      .then((response) => {
        dispatch(handleLogout())
        navigate('/login')
        alert('You have been logged out due to inactivity.')
      })
      .catch((error) => {
        console.log(error)
      })

    // Redirect to login page
  }

  const resetTimer = () => {
    clearTimeout(timer)
    //set timer for 20 seconds
    //  timer = setTimeout(logout, 20 * 1000); // 20 seconds

    //set timer for 20 minutes`
    // timer = setTimeout(logout, 20 * 60 * 1000); // 20 minutes
    //setTimer for 15 minutes
    timer = setTimeout(logout, 15 * 60 * 1000) // 15 minutes
  }

  useEffect(() => {
    // Set up event listeners for mouse and keyboard activity
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)

    // Start the initial timer
    resetTimer()

    // Clean up event listeners on component unmount
    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
    }
  }, [])

  return null // No UI needed for this component
}

export default AutoLogout
