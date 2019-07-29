pragma solidity ^0.5.0;

import "./commit.sol";

contract branch{
    string branchName;
    mapping(string => address) commitMap; //CommitHash => contract
    commit[] commitArray;

    constructor(string memory _branchName, mapping (string => address) _commitMap, commit[] memory _commitArray) public{
        branchName = _branchName;
        commitMap = _commitMap;
        commitArray = _commitArray;
    }

    event commitCreated(address commitCreator, string msg, string _commitHash);

    modifier onlyPermitted(){
        //require(msg.sender == owner);
        _;
    }
    function parseCommit(string memory _commitHash, uint  _date, string memory _branchName,
    string memory _msg, string memory _change ) public onlyPermitted{
        commitMap[_commitHash] = new commit(msg.sender, _commitHash, _date, _branchName, _msg, _change);
        commitArray.push(commit(commitMap[_commitHash]));
        
        emit commitCreated(msg.sender, _msg, _commitHash);
    }

    function makeRoot() public {
        //if(commitArray.length -1 == 0)


        //parseCommit
    }

    function getLastCommitHash() public returns(string memory){
        return commitArray[commitArray.length-1].commitHash;
    }



}