pragma solidity ^0.5.0;

contract commit{
  address authorAddress;
  string authorName;
  string commitHash;
  string date;
  string message;
  //string change;
  bytes32[] addedFiles;
  bytes32[] addedLines;
  bytes32[] removedFiles;
  bytes32[] removedLines;
  
  constructor (address  _authorAddress,string memory _authorName,string memory _commitHash,
  string memory  _date, string memory _message, bytes32[] memory _addedFiles, bytes32[] memory _addedLines,
  bytes32[] memory _removedFiles, bytes32[] memory _removedLines) public {
    authorAddress = _authorAddress;
    commitHash = _commitHash;
    date = _date;
    message = _message;
    //change = _change;
    authorName = _authorName;
    addedFiles = _addedFiles;
    addedLines = _addedLines;
    removedFiles = _removedFiles;
    removedLines = _removedLines;
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

  function getAddedFiles() public view returns (bytes32[] memory){
    return addedFiles;
  }

  function getAddedLines() public view returns (bytes32[] memory){
    return addedLines;
  }

  function getRemovedFiles() public view returns (bytes32[] memory){
    return removedFiles;
  }
  
  function getRemovedLines() public view returns (bytes32[] memory){
    return removedLines;
  }
}