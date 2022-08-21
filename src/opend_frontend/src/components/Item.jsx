import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend_backend } from "../../../declarations/opend_backend/index";

function Item(props) {
  // React UseState Hooks
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();

  // Canister Id
  // const id = Principal.fromText(props.id);
  const id = props.id;

  const localHost = "http://localhost:8080/";

  // Making a http request to access the canister
  const agent = new HttpAgent({ host: localHost });
  //Remove line when Deploying on live ICP Blockchain
  agent.fetchRootKey();

  let NFTActor;

  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    // Gets the name from canister
    const name = await NFTActor.getName();
    setName(name);

    // Gets the Owner from canister
    const owner = await NFTActor.getOwner();
    setOwner(owner.toText());

    // Gets ImageDate from canister
    const imageData = await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageData);

    const image = URL.createObjectURL(
      new Blob([imageContent.buffer], { type: "image/png" })
    );
    setImage(image);

    if (await opend_backend.isListed(id)) {
      setBlur({ filter: "blur(4px)" });
      setOwner("OpenD");
      setPriceInput();
      setButton();
    } else {
      setButton(<Button handleClick={handleSell} text="Sell" />);
    }
  }

  // React Effect Hook
  useEffect(() => {
    loadNFT();
  }, []);

  //Price variable
  let price;
  //Function to handle button click
  function handleSell() {
    console.log("Clicks working");
    setPriceInput(
      <input
        placeholder="Price in DVIS"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => (price = e.target.value)}
      />
    );
    setButton(<Button handleClick={sellItem} text="Confirm" />);
  }

  //Function to Sell Item
  async function sellItem() {
    setBlur({ filter: "blur(4px)" });
    setLoaderHidden(false);
    console.log("confirm sell");
    const listingResult = await opend_backend.listItem(id, Number(price));
    if (listingResult == "Success") {
      const openDId = await opend_backend.getOwnerId();
      const transferResult = await NFTActor.transferOwnership(openDId);
      console.log("transferResults: " + transferResult);
      if (transferResult == "Success") {
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwner("OpenD");
      }
    }
  }

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name} <span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
