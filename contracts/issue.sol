pragma solidity ^0.5.0;
import "./commit.sol";
contract issue{
    address payable repoOwner;
    address payable issueCreator;
    string issueName;
    string issueDescription;
    commit[] CommitsRequest;
    constructor(string memory _issueName, string memory _issueDescription) public{
        issueCreator = msg.sender;
        issueName = _issueName;
        issueDescription = _issueDescription;
    }
    modifier onlyPermitted(address closer){
        require(closer == repoOwner || closer == issueCreator);
         _;
    }
   function close() public onlyPermitted(msg.sender) {
       selfdestruct(issueCreator);
   }
   function pullRequest(commit commitRequest) public{
       CommitsRequest.push(commitRequest);
   }
}