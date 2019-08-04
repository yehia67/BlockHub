pragma solidity ^0.5.0;

contract commit{
  address authorAddress;
  string authorName;
  string commitHash;
  string date;
  string message;
  string change;

  
  constructor (string memory _authorName,string memory _commitHash,
  string memory  _date, string memory _message,string memory _change) public {
    authorAddress = msg.sender;
    commitHash = _commitHash;
    date = _date;
    message = _message;
    authorName = _authorName;
    change = _change;
  }

  function getAuthorAddress() public view returns (address) {
    return authorAddress;
  }

  function getAuthorName() public view returns (string memory) {
    return authorName;
  }

  function getHash() public view returns (string memory) {
    return commitHash;
  }

  function getDate() public view returns (string memory) {
    return date;
  }

  function getMessage() public view returns (string memory) {
    return message;
  }


}