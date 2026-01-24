import React, { useState } from 'react'
import Topics from './components/Topics/Topics'
import { Toaster } from 'react-hot-toast'
import Mcq from './components/Mcq/Mcq'
import Interview from './components/Interview/Interview'
import Navbar from './components/Navbar/Navbar'

const App = () => {
  const [activeTab, setActiveTab] = useState("TOPICS");
  return (
    <div >
      <Toaster position="top-right" />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        {activeTab === "TOPICS" && <Topics />}
        {activeTab === "MCQS" && <Mcq />}
        {activeTab === "INTERVIEW" && <Interview />}
      </div>
    </div>
  )
}

export default App
