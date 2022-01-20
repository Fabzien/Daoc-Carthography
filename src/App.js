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
      <footer class="footer flex-style">
        <a href=
          "https://github.com/Fabzien/Daoc-Carthography"
          target="_blank"> <img src="assets/GitHub-Mark-Light-32px.png" />
        </a>
      </footer>
    </div>
  );
}

export default App;
