import React from "react";
import { propTypes } from "../../../../node_modules/react-bootstrap/esm/Image";

export default function PriceLable(props) {
  return (
    <div className="disButtonBase-root disChip-root makeStyles-price-23 disChip-outlined">
      <span className="disChip-label">{props.sellPrice} DVIS</span>
    </div>
  );
}
