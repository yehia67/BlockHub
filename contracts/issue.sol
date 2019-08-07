pragma solidity ^0.5.0;
import "./commit.sol"; 
contract issue{
    address payable repoOwner;
    address payable issueCreator;
    commit[] CommitsRequest;
    constructor(address payable _repoOwner) public{
        repoOwner= _repoOwner;
        issueCreator = msg.sender;
    }
    modifier onlyPermited(address closer){
        require(closer == repoOwner || closer == issueCreator);
         _;
    }
   function close() public onlyPermited(msg.sender) {
       selfdestruct(issueCreator);
   }
   function pullRequest(commit commitRequest) public{
       CommitsRequest.push(commitRequest);
   }
}