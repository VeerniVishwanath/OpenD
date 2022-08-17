import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import NFTActorClass "../NFT/nft";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import List "mo:base/List";

actor OpenD{

  //A HashMap of all the NFTs
  var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);
  //A HashMap of all the NFTs owned by a owner
  var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);


  //Function to Mint a NFT
  public shared(msg) func mint(name: Text, image: [Nat8]): async Principal{
    
    // The principalId of user who called this function
    let owner: Principal = msg.caller;

    Debug.print(debug_show(Cycles.balance()));
    //Giving Cycles for the creation of the nftCanister and addition cycles for operations
    Cycles.add(100_500_000_000);

    let newNFT = await NFTActorClass.NFT(name, owner, image);
    Debug.print(debug_show(Cycles.balance()));

    //Principal ID of the NFTCanister
    let nftPrincipal = await newNFT.getcanisterId();

    mapOfNFTs.put(nftPrincipal, newNFT);
    addToOwnershipMap(owner, nftPrincipal);


    return nftPrincipal;

  };

  // Function to add nftIds to a LIst owned by a owner/user 
  private func addToOwnershipMap(owner: Principal, nftId: Principal){
    var ownedNFTs: List.List<Principal> = switch(mapOfOwners.get(owner)){
      case null List.nil<Principal>();
      case (?result) result;
    }; 

    ownedNFTs := List.push(nftId, ownedNFTs);
    mapOfOwners.put(owner, ownedNFTs);

  };

  public query func getOwnedNFTs(user: Principal): async [Principal]{
    var userNFTs: List.List<Principal> = switch(mapOfOwners.get(user)){
      case null List.nil<Principal>();
      case (?result) result;
    };

    return List.toArray(userNFTs);
  };

  public shared(msg) func getPrincipalId():async Principal{
    return msg.caller;
  }
}