import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token_backend";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend_backend } from "../../../declarations/opend_backend";
import PriceLable from "./PriceLable";

function Item(props) {
  // React UseState Hooks
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [priceLable, setPriceLable] = useState();
  const [shouldDisplay, setShouldDisplay] = useState(true);

  // Canister Id
  // const id = Principal.fromText(props.id);
  const id = props.id;

  const localHost = "http://localhost:8080/";

  // Making a http request to access the canister
  const agent = new HttpAgent({ host: localHost });
  /////////////////////////Remove line when Deploying on live ICP Blockchain
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

    if (props.role == "collections") {
      if (await opend_backend.isListed(id)) {
        setBlur({ filter: "blur(4px)" });
        setOwner("OpenD");
        setPriceInput();
        setButton();
        setSellStatus(" Listed");
      } else {
        setButton(<Button handleClick={handleSell} text="Sell" />);
      }
    } else if (props.role == "discover") {
      const ownerId = await opend_backend.getPrincipalId();
      const originalOwner = await opend_backend.getOriginalOwner(id);
      if (originalOwner.toText() != ownerId.toText()) {
        setButton(<Button handleClick={handleBuy} text="Buy" />);
      }
      const nftPrice = await opend_backend.getNFTPrice(id);
      setPriceLable(<PriceLable sellPrice={nftPrice.toString()} />);
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
        setSellStatus(" Listed");
      }
    }
  }

  //Function to Buy
  async function handleBuy() {
    setLoaderHidden(false);
    setButton();
    console.log("Buy button triggered");
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("renrk-eyaaa-aaaaa-aaada-cai"),
    });

    const sellerId = await opend_backend.getOriginalOwner(id);
    const itemPrice = await opend_backend.getNFTPrice(id);

    const result = await tokenActor.transfer(sellerId, itemPrice);

    if (result == "success") {
      const BuyerId = await opend_backend.getPrincipalId();
      console.log(BuyerId);
      const transferResult = await opend_backend.completePurchase(
        id,
        sellerId,
        BuyerId
      );
      console.log("Transfer Results " + transferResult);
    }
    setLoaderHidden(true);
    setShouldDisplay(false);
  }

  return (
    <div
      style={{ display: shouldDisplay ? "inline" : "none" }}
      className="disGrid-item"
    >
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
          {priceLable}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name} <span className="purple-text"> {sellStatus}</span>
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
