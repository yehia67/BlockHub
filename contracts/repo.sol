pragma solidity ^0.5.0;

import "./branch.sol";

contract repo{
    string repoName;
    string repoDescription;
    address repoOwner;
    uint creationDate;
    address[] collaborators;
    branch[] branches;
    mapping (string => address) branchesMap; //branchName => branchContract
    mapping (address => bool) collaboratorsMap;

    constructor(string memory _repoName, string memory _repoDescription, uint _creationDate) public{
        repoName = _repoName;
        repoDescription = _repoDescription;
        repoOwner = msg.sender;
        collaboratorsMap[msg.sender] = true;
        creationDate = _creationDate;

        mapping  (string => address) storage _commitMap;
        commit[] storage _commitArray;
        branch masterBranch = new branch("master", _commitMap, _commitArray);
        branchesMap["master"] = masterBranch;
        branches.push(masterBranch);
        emit branchCreated(repoName, "master");
    }

    event collaboratorAdded(address collaborator, address repoAddress, string repoName);
    event collaboratorRemoved(address collaborator, address repoAddress, string repoName);
    event branchCreated(string repoName, string _branchName);

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
        branchesMap[_branchName] = new branch(_branchName, branches[0].commitMap, branches[0].commitArray);
        branches.push(branch(branchesMap[_branchName]));

        emit branchCreated(repoName, _branchName);
    }
}