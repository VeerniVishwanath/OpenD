import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";

function Item(props) {
  // React UseState Hooks
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();

  // Canister Id
  // const id = Principal.fromText(props.id);
  const id = props.id;

  const localHost = "http://localhost:8080/";

  // Making a http request to access the canister
  const agent = new HttpAgent({ host: localHost });

  async function loadNFT() {
    const NFTActor = await Actor.createActor(idlFactory, {
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
  }

  // React Effect Hook
  useEffect(() => {
    loadNFT();
  }, []);

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
        />
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name} <span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Item;
