var createRepo = artifacts.require("./createRepo.sol");

module.exports = function(deployer) {
    deployer.deploy(createRepo);
};