pragma solidity ^0.5.0;

import "./commit.sol";

contract branch{
    string branchName;
    mapping(string => address) commitMap; //CommitHash => contract
    commit[] commitArray;

    constructor(string memory _branchName, commit[] memory _commitArray) public{
        branchName = _branchName;
        commitArray = _commitArray;
        initMap(_commitArray);
    }
    function initMap(commit[] memory _commitArray)  private  {
        for (uint index = 0; index < _commitArray.length; index++) {
            commitMap[_commitArray[index].getHash()] = address(_commitArray[index]);
        }
    }
    function getCommitsArray() public view returns (commit[] memory) {
        return commitArray;
    }
     function getCommitsArrayLength() public view returns (uint) {
        return commitArray.length;
    }
   function pushCommit(string memory _authorName,string memory _commitHash,
  string memory  _date, string memory _message,string memory _change) public{
      
      commit Commit = new commit(_authorName,_commitHash,_date,_message,_change);
      commitMap[_commitHash] = address(Commit);
      emit commitCreated(msg.sender,_authorName,_message,_commitHash);
  }
    event commitCreated(address commitCreator, string name,string msg, string _commitHash);

    modifier onlyPermitted(){
        //require(msg.sender == owner);
        _;
    }
  

    function getLastCommitHash() public view returns(string memory) {
        return commitArray[commitArray.length-1].getHash();
    }



}