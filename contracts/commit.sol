pragma solidity ^0.5.0;

contract commit{
   address authorAddress;
   string authoreName;
   string commitHash;
   string  date;
   string message;
   string change;
   constructor (address  _authorAddress,string memory _authoreName,string memory _commitHash,string memory  _date, string memory _message, string memory _change ) public {
       authorAddress = _authorAddress;
       commitHash = _commitHash;
       date = _date;
       message = _message;
       change = _change;
       authoreName = _authoreName;
   }
    function getAuthorAddress() view public returns (address) {
      return authorAddress;
  }
  function getAuthoreName() view public returns (string memory) {
      return authoreName;
  }
  function getHash() view public returns (string memory) {
      return commitHash;
  }
   function getDate() view public returns (string memory) {
      return date;
  }
    function getMessage() view public returns (string memory) {
      return message;
  }  
    function getChange() view public returns (string memory) {
      return change;
  }
}