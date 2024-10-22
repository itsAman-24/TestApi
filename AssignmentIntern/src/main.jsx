import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PeopleApi from './People_Api.jsx';
import GoogleApi from './Gmail_Api.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PeopleApi />
  </StrictMode>,
)
