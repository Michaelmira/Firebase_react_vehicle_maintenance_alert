import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from '../componet/scrollToTop.js';

import { Navbar } from '../componet/navbar.js';
import { Footer } from '../componet/footer.js';
import { Home } from '../pages/home.js';


const Layout = () => {
  const basename = process.env.REACT_APP_BASENAME || '';

  return (
    <div>
      <BrowserRouter basename={basename}>
        <ScrollToTop />
        <Navbar />
   
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/demo" element={<Demo />} />
          <Route path="/single/:theid" element={<Single />} /> */}
          <Route path="*" element={<h1>Not found!</h1>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
};


export default Layout;