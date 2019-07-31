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
        branch Branch = new branch(_branchName, branches[0].getCommitsArray());
        branchesMap[_branchName] = address(Branch);
        branches.push(branch(branchesMap[_branchName]));

        emit branchCreated(repoName, _branchName);
    }
    function doMerge(commit[] memory originalBranhceCommits,commit[] memory mergedBranhceCommits,branch  mergedBranch) private returns(uint8) {
            uint  diff = originalBranhceCommits.length -  mergedBranhceCommits.length;
             if(originalBranhceCommits[originalBranhceCommits.length-1-diff] != mergedBranhceCommits[mergedBranhceCommits.length-1] )
             {
                return 99;
             }
             else{
                uint  counter = mergedBranhceCommits.length;
                for(uint i = 0; i < diff;i++ ){
                    mergedBranch.parseCommit(originalBranhceCommits[counter].getAuthorAddress(),originalBranhceCommits[counter].getAuthoreName(),
                    originalBranhceCommits[counter].getDate(), originalBranhceCommits[counter].getHash(),originalBranhceCommits[counter].getMessage(),originalBranhceCommits[counter].getChange());
                    counter++;
                }
                
                return 1;
             }
    }
    function merge(string memory _firstBranchName,string memory _secondBranchName) public returns(uint8) {
        branch firstBranche = branch(branchesMap[_firstBranchName]);
        branch secondBranche = branch(branchesMap[_secondBranchName]);
        commit[] memory firstBranchCommits = firstBranche.getCommitsArray();
        commit[] memory secondBranchCommits = secondBranche.getCommitsArray();
        if(keccak256(abi.encodePacked((firstBranchCommits[firstBranchCommits.length -1].getHash())))  ==keccak256(abi.encodePacked((secondBranchCommits[secondBranchCommits.length -1].getHash())))){
            return 0;
        }
        else if(secondBranchCommits.length  > firstBranchCommits.length){
             return doMerge(secondBranchCommits,firstBranchCommits,firstBranche);
        }
        else{
            return doMerge(firstBranchCommits,secondBranchCommits,secondBranche);
        }
    }
}