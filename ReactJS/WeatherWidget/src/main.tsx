import { createRoot } from 'react-dom/client'
import WeatherWidget from './WeatherWidget'
import "./assets/style.css"

createRoot(document.getElementById('app')!).render(
    <WeatherWidget></WeatherWidget>
)
