import React from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import VideoTemplate from './components/VideoTemplate'
import SessionAuthForm from './components/SessionAuthForm'


export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/video" element={<VideoTemplate/>}/>
          <Route path="/sessionauth" element={<SessionAuthForm/>}/>
        </Routes>
   
      </BrowserRouter>
    </>
  )
}
