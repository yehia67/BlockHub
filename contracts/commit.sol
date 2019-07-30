pragma solidity ^0.5.0;

contract commit{
   address authorAddress;
   string commitHash;
   string  date;
   string message;
   string change;
   constructor (address  _authorAddress,string memory _commitHash,string memory  _date, string memory _message, string memory _change ) public {
       authorAddress = _authorAddress;
       commitHash = _commitHash;
       date = _date;
       message = _message;
       change = _change;
   }
  function getHash() view public returns (string memory) {
      return commitHash;
  }
}