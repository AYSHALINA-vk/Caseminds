import { StrictMode } from 'react'

import './index.css'
import ReactDOM from "react-dom/client"


ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
)
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
