import React from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import VideoTemplate from '../components/VideoTemplate'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/video" element={<VideoTemplate/>}/>
        </Routes>
   
      </BrowserRouter>
    </>
  )
}
