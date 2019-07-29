pragma solidity ^0.5.0;

import "./repo.sol";

contract createRepo{
    repo[] repos;
    //map
    event repoCreated(string _repoName, string _repoDescription, address _repoOwner, uint _creationDate);

    function createNewRepo(string memory _repoName, string memory _repoDescription, address _repoOwner, uint _creationDate) public{
        repos.push(new repo(_repoName, _repoDescription, _repoOwner, _creationDate));
        emit repoCreated(_repoName, _repoDescription, _repoOwner, _creationDate);
    }
}