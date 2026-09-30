import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";


import ScrollToHash
  from "./components/common/ScrollToHash";

import PublicLayout
  from "./components/layout/PublicLayout";

import HomePage
  from "./pages/HomePage";

import SearchPage
  from "./pages/SearchPage";


export default function App() {

  return (

    <BrowserRouter>


      <ScrollToHash />


      <Routes>


        <Route
          element={
            <PublicLayout />
          }
        >


          <Route
            path="/"
            element={
              <HomePage />
            }
          />


          <Route
            path="/search"
            element={
              <SearchPage />
            }
          />


        </Route>


      </Routes>


    </BrowserRouter>

  );

}