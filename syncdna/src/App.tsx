import "./App.css";
import "./index.css";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { PreJoinPage } from "./components/PrePage";
import { CallRoom } from "./components/CallRoom";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<PreJoinPage />} />
          <Route path="/room" element={<CallRoom />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
