import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Book site</h1>
        <input type="text" placeholder="Book type..."/>
        <input type="number" placeholder="Release date..."/>
        <button>Subbmit</button>
    </>
  )
}

export default App
