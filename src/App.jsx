import React from 'react'
import { BrowserRouter,Routes,Route, Navigate } from 'react-router-dom'
import VideoTemplate from './components/VideoTemplate'
import SessionAuthForm from './components/SessionAuthForm'


export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/sessionauth" replace />} />
          <Route path="/video" element={<VideoTemplate/>}/>
          <Route path="/sessionauth" element={<SessionAuthForm/>}/>
        </Routes>

      </BrowserRouter>
    </>
  )
}
