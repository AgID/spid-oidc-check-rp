import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import 'font-awesome/css/font-awesome.min.css';

import '../scss/style.scss'
import '../scss/core/_dropdown-menu-right.scss'

// Containers
import Base from './containers/Base'
import Empty from './containers/Empty'
import Main from './containers/Main'

import Login from './views/Login/';
import Redirect from './views/Redirect/';
import Worksave from './views/Worksave/';
import MetadataDownload from './views/MetadataDownload/';
import MetadataCheck from './views/MetadataCheck/';
import OIDCCheck from './views/OIDCCheck/';
import OIDCReport from './views/OIDCReport/';
import OIDCLog from './views/OIDCLog/';
import config from "./config.json";

const root = createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter basename={config.basepath}> 
    <Routes>
      <Route path="/" element={<Base/>}>
        <Route path="/" element={<Login/>}/>
      </Route>
      <Route path="/worksave" element={<Empty/>}>
        <Route path="/worksave" element={<Worksave/>}/>
      </Route>
      <Route path="/metadata" element={<Main/>}>
        <Route path="/metadata/download" element={<MetadataDownload/>}/>
        <Route path="/metadata/check" element={<MetadataCheck testcase="test-case-metadata-0"/>}/>
      </Route>
      <Route path="/oidc" element={<Main/>}>
        <Route path="/oidc/check" element={<OIDCCheck />}/>
        <Route path="/oidc/report" element={<OIDCReport />}/>
        <Route path="/oidc/log" element={<OIDCLog />}/> 
      </Route>
      <Route path='/logout' element={<Redirect redirect={config.basepath + '/logout'}/>} />
    </Routes>
  </BrowserRouter>
); 
