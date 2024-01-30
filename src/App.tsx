import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import store from "./services/Store";
import DeckView from "./views/DeckMap";
import IndexView from "./views/Index";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexView />} />
          <Route path="/geopt" element={<DeckView />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
