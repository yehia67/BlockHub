pragma solidity ^0.5.0;

import "./repo.sol";

contract createRepo{
    repo[] repos;
    mapping (string => address) repoMap;
    event repoCreated(string _repoName,address repoAddress, string _repoDescription, address _repoOwner, uint _creationDate);

    function createNewRepo(string memory _repoName, string memory _repoDescription) public returns(address){
        repo Repo = new repo(_repoName, _repoDescription);
        repoMap[_repoName] = address(Repo);
        repos.push(Repo);
        emit repoCreated(_repoName,address(Repo) ,_repoDescription, msg.sender, now);
        return(address(Repo));
    }
    function returnRepoNames() view public returns ( repo[] memory) {
        return repos;
    }
    
    function returnRepoAddress(string memory _repoName) public view returns (address){
        return repoMap[_repoName];
    }
    function getRootCommit(string memory repoName) public view  returns (string memory) {
          repo Repo = repo(repoMap[repoName]);
          return Repo.getMasterRootCommit();
    }
}