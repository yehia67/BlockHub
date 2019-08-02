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
    event commitCreated(address commitCreator, string msg, string _commitHash);

    modifier onlyPermitted(){
        //require(msg.sender == owner);
        _;
    }
    function parseCommit(address _authorAddress,string memory _authorName,string memory _commitHash, string memory _date,
    string memory _msg, bytes32[] memory _addedFiles, bytes32[] memory _addedLines,
    bytes32[] memory _removedFiles, bytes32[] memory _removedLines) public onlyPermitted{
        commit Commit = new commit(_authorAddress,_authorName, _commitHash, _date, _msg, _addedFiles,  _addedLines,
        _removedFiles, _removedLines);
        commitMap[_commitHash] = address(Commit);
        commitArray.push(commit(commitMap[_commitHash]));
        emit commitCreated(_authorAddress, _msg, _commitHash);
    }

    function pushCommit(string memory _authorName,string memory _commitHash, string memory _date,
    string memory _msg, bytes32[] memory _addedFiles, bytes32[] memory _addedLines,
    bytes32[] memory _removedFiles, bytes32[] memory _removedLines) public onlyPermitted{
        commit Commit = new commit(msg.sender,_authorName, _commitHash, _date, _msg, _addedFiles,  _addedLines,
        _removedFiles, _removedLines);
        commitMap[_commitHash] = address(Commit);
        commitArray.push(commit(commitMap[_commitHash]));
        emit commitCreated(msg.sender, _msg, _commitHash);
    }


    function getLastCommitHash() public view returns(string memory) {
        return commitArray[commitArray.length-1].getHash();
    }



}