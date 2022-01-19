import './App.css';
import Map from './map'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (
    <div className="App">
            <Map />
    </div>
  );
}

function Test() {
  return <h2>Home</h2>;
}

export default App;
