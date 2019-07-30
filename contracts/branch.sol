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
                commitMap[_commitArray[index].getHash()]  = address(_commitArray[index]);
        }
    }
    function getCommitsArray() view public returns (commit[] memory) {
        return commitArray;
    }
    event commitCreated(address commitCreator, string msg, string _commitHash);

    modifier onlyPermitted(){
        //require(msg.sender == owner);
        _;
    }
    function parseCommit(string memory _commitHash, string memory _date, 
    string memory _msg, string memory _change ) public onlyPermitted{
        commit Commit =  new commit(msg.sender, _commitHash, _date, _msg, _change);
        commitMap[_commitHash] = address(Commit);
        commitArray.push(commit(commitMap[_commitHash]));
        
        emit commitCreated(msg.sender, _msg, _commitHash);
    }


    function getLastCommitHash() public view returns(string memory) {
        return commitArray[commitArray.length-1].getHash();
    }



}