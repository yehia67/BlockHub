pragma solidity ^0.5.0;

import "./branch.sol";
import "./issue.sol";

contract repo{
    string repoName;
    string repoDescription;
    address repoOwner;
    uint creationDate;
    address[] collaborators;
    branch[] branches;
    issue[] issues;
    mapping (string => address) branchesMap; //branchName => branchContract
    mapping (address => bool) collaboratorsMap;

    constructor(string memory _repoName, string memory _repoDescription) public{
        repoName = _repoName;
        repoDescription = _repoDescription;
        repoOwner = msg.sender;
        collaboratorsMap[msg.sender] = true;
        creationDate = now;
        commit[] memory _commitArray;
        branch masterBranch = new branch("master", _commitArray);
        branchesMap["master"] = address(masterBranch);
        branches.push(masterBranch);
        emit branchCreated(repoName, "master");
    }

    event collaboratorAdded(address collaborator, address repoAddress, string repoName);
    event collaboratorRemoved(address collaborator, address repoAddress, string repoName);
    event branchCreated(string repoName, string branchName);
    event issueCreated(string issueLabel, string issueMessage);

    modifier onlyOwner(){
        require(collaboratorsMap[msg.sender] == true);
        _;
    }

    modifier onlyPermitted(){
        //require(msg.sender == repoOwner);
        _;
    }

    function addColaborator (address _collaborator) onlyOwner public{
        collaborators.push(_collaborator);
        collaboratorsMap[_collaborator] = true;
        emit collaboratorAdded(_collaborator, address(this), repoName);
    }

    function removeCollaborator(address _collaborator) onlyOwner public{
        collaboratorsMap[_collaborator] = false;
        emit collaboratorRemoved(_collaborator, address(this), repoName);
    }

    function makeBranch(string memory _branchName) onlyPermitted public{
        branch Branch = new branch(_branchName, branches[0].getCommitsArray());
        branchesMap[_branchName] = address(Branch);
        branches.push(branch(branchesMap[_branchName]));
        emit branchCreated(repoName, _branchName);
    }

    function makeIssue(string memory _issueLabel, string memory _issueMessage) public{
        issues.push(new issue(_issueLabel, _issueMessage));
        emit issueCreated(_issueLabel, _issueMessage);
    }

}