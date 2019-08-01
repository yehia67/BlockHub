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
        emit branchCreated(repoName,address(masterBranch), "master");
    }

    event collaboratorAdded(address collaborator, address repoAddress, string repoName);
    event collaboratorRemoved(address collaborator, address repoAddress, string repoName);
    event branchCreated(string repoName,address branchAddress ,string branchName);
    event issueCreated(string issueLabel, string issueMessage);
    function getMasterBranch() public view returns (address) {
        return branchesMap['master'];
    }
    modifier onlyOwner(){
        require(collaboratorsMap[msg.sender] == true);
        _;
    }

    modifier onlyPermitted(){
        //require(msg.sender == repoOwner);
        _;
    }

    function addColaborator (address _collaborator) public onlyOwner{
        collaborators.push(_collaborator);
        collaboratorsMap[_collaborator] = true;
        emit collaboratorAdded(_collaborator, address(this), repoName);
    }

    function removeCollaborator(address _collaborator) public onlyOwner{
        collaboratorsMap[_collaborator] = false;
        emit collaboratorRemoved(_collaborator, address(this), repoName);
    }

    function makeBranch(string memory _branchName) public onlyPermitted{
        branch Branch = new branch(_branchName, branches[0].getCommitsArray());
        branchesMap[_branchName] = address(Branch);
        branches.push(branch(branchesMap[_branchName]));
        emit branchCreated(repoName,address(Branch),_branchName);
    }
    function doMerge(commit[] memory originalBranchCommits,commit[] memory mergedBranchCommits,branch mergedBranch) private returns(uint8) {
            uint  diff = originalBranchCommits.length - mergedBranchCommits.length;
             if(originalBranchCommits[originalBranchCommits.length-1-diff] != mergedBranchCommits[mergedBranchCommits.length-1] )
             {
                return 99;
             }
             else{
                uint  counter = mergedBranchCommits.length;
                for(uint i = 0; i < diff;i++ ){
                    mergedBranch.parseCommit(originalBranchCommits[counter].getAuthorAddress(),originalBranchCommits[counter].getAuthorName(),
                    originalBranchCommits[counter].getDate(), originalBranchCommits[counter].getHash(),originalBranchCommits[counter].getMessage(),
                    originalBranchCommits[counter].getAddedFiles(), originalBranchCommits[counter].getAddedLines(),
                    originalBranchCommits[counter].getRemovedFiles(),originalBranchCommits[counter].getRemovedLines());
                    counter++;
                }
                
                return 1;
             }
    }
    function merge(string memory _firstBranchName,string memory _secondBranchName) public returns(uint8) {
        branch firstBranch = branch(branchesMap[_firstBranchName]);
        branch secondBranch = branch(branchesMap[_secondBranchName]);
        commit[] memory firstBranchCommits = firstBranch.getCommitsArray();
        commit[] memory secondBranchCommits = secondBranch.getCommitsArray();
        if(keccak256(abi.encodePacked((firstBranchCommits[firstBranchCommits.length -1].getHash())))  == keccak256(abi.encodePacked((secondBranchCommits[secondBranchCommits.length -1].getHash())))){
            return 0;
        }
        else if(secondBranchCommits.length > firstBranchCommits.length){
             return doMerge(secondBranchCommits,firstBranchCommits,firstBranch);
        }
        else{
            return doMerge(firstBranchCommits,secondBranchCommits,secondBranch);
        }
    }

    function makeIssue(string memory _issueLabel, string memory _issueMessage) public{
        issues.push(new issue(_issueLabel, _issueMessage));
        emit issueCreated(_issueLabel, _issueMessage);
    }
}