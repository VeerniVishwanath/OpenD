import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import NFTActorClass "../NFT/nft";
import Principal "mo:base/Principal";

actor OpenD{
  
  public shared(msg) func mint(name: Text, image: [Nat8]): async Principal{
    
    let owner: Principal = msg.caller;

    Debug.print(debug_show(Cycles.balance()));
    Cycles.add(100_500_000_000);

    let newNFT = await NFTActorClass.NFT(name, owner, image);
    Debug.print(debug_show(Cycles.balance()));

    let nftPrincipal = await newNFT.getcanisterId();

    return nftPrincipal;

  };
   public query func getBalance() : async Nat {
      Cycles.balance();
   };
}