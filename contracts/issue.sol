pragma solidity ^0.5.0;

contract issue{
    string label;
    string issueMessage;

    constructor(string memory _label, string memory _issueMessage) public{
        label = _label;
        issueMessage = _issueMessage;
    }
}