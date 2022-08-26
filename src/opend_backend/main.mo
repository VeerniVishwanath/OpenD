import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import List "mo:base/List";
import NFTActorClass "../NFT/nft";
import Pricipal "mo:base/Array";
import Principal "mo:base/Principal";
import Array "mo:base/Array";

actor OpenD{

  //A custom DataType to store owner and price details
  private type Listing = {
    itemOwner: Principal;
    itemPrice: Nat;
  };

  //A HashMap of all the NFTs
  var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);
  //A HashMap of all the NFTs owned by a owner
  var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);
  //A HashMap to store all the nfts for Sale
  var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);

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

  //Return an Array of listed NFT Ids
  public query func getListedNFTs(): async [Principal]{
    let ids = Iter.toArray(mapOfListings.keys());
    return ids;
  };

  //Returns the Pricipal ID of the caller
  public shared(msg) func getPrincipalId():async Principal{
    return msg.caller;
  };

  //Adds the nftId, Owner and Price to a HashMap
  public shared(msg) func listItem(id:Principal , price:Nat):async Text{
    var item: NFTActorClass.NFT = switch(mapOfNFTs.get(id)){
      case null return "No such NFT available";
      case (?result) result;
    };

    let owner = await item.getOwner();
    if(Principal.equal(owner, msg.caller)){

      let newListing :Listing = {
        itemOwner = owner;
        itemPrice = price;
      };

      mapOfListings.put(id, newListing);

      return "Success";

    }else{
      return "You don't own this NFT";
    }
  };

  public query func getOwnerId():async Principal{
    return Principal.fromActor(OpenD);
  };

  public query func isListed(id: Principal) : async Bool{
    if( mapOfListings.get(id) == null ){
      return false;
    }else{
      return true;
    };
  };

  public query func getOriginalOwner(id:Principal) :async Principal{
    var ownerId: Principal = switch(mapOfListings.get(id)){
      case null return Principal.fromText("");
      case (?result) result.itemOwner;
    };
    return ownerId;
  };

  public query func getNFTPrice(id: Principal): async Nat{
    switch(mapOfListings.get(id)){
      case null return 0;
      case (?result) return result.itemPrice;
    }
  };

  //Function to transfer ownerShip to new owner
  public func completePurchase(id: Principal, ownerId:Principal, newOwnerId: Principal):async Text{
    let purchasedNFT: NFTActorClass.NFT =switch(mapOfNFTs.get(id)){
      case null return "NFT doesn't exists";
      case (?result) result;
    };

    let transferResult = await purchasedNFT.transferOwnership(newOwnerId);
    if(transferResult == "Success"){
      mapOfListings.delete(id);
      var ownedNFTs : List.List<Principal> = switch(mapOfOwners.get(id)){
        case null List.nil<Principal>();
        case (?result) result;
      };

      ownedNFTs := List.filter(ownedNFTs, func(listItemId:Principal) : Bool {
        return listItemId != id ;
      });

      addToOwnershipMap(newOwnerId, id);
      return "Success";
    }else{
      return "Error!!";
    }    
  }                                                      
}