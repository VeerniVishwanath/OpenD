import React, { useEffect, useState } from "react";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import logo from "../../assets/logo.png";
import Gallery from "./Gallery";
import Minter from "./Minter";
import homeImage from "../../assets/home-img.png";
import { opend_backend } from "../../../declarations/opend_backend/index";
import CURRENT_USER_ID from "../index";
import Principal from "@dfinity/principal";

function Header() {
  const [userOwnedGallery, setOwnedGallery] = useState();

  async function getNFTs() {
    const ownerId = await opend_backend.getPrincipalId();
    const userNFTs = await opend_backend.getOwnedNFTs(ownerId);
    console.log(userNFTs);

    setOwnedGallery(<Gallery title="My NFTs" ids={userNFTs} />);
  }

  useEffect(() => {
    getNFTs();
  }, []);

  return (
    <BrowserRouter>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <Link to="/" reloadDocument>
              <img className="header-logo-11" src={logo} />
            </Link>
            <div className="header-vertical-9"></div>
            <h5 className="Typography-root header-logo-text">OpenD</h5>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover" reloadDocument>
                Discover
              </Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter" reloadDocument>
                Minter
              </Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection" reloadDocument>
                {" "}
                My NFTs
              </Link>
            </button>
          </div>
        </header>
      </div>

      <Routes>
        <Route
          exact
          path="/"
          element={<img className="bottom-space" src={homeImage} />}
        ></Route>
        <Route exact path="/discover" element={<h1>Discover</h1>}></Route>
        <Route exact path="/minter" element={<Minter />}></Route>
        <Route exact path="/collection" element={userOwnedGallery}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Header;
