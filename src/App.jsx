import React from 'react'
import Input from './Base/Input'
import Label from './Base/Label'
import BackButton from './Base/Button/BackButton'
import { BrowserRouter } from 'react-router-dom'
import Button from './Base/Button/Button'
import { DatePicker } from '@mui/x-date-pickers'
import Date from './Base/Date'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Label required >Name</Label>
        <Input />
        <BackButton/>
        <Button label="Doctor Consultation"/>
        <Date/>
   
      </BrowserRouter>
    </>
  )
}
