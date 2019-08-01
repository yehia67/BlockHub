/* const ipfs = IpfsApi("localhost", "5001")
ipfs.id(function(err, res) {
    if (err) throw err
    console.log("Connected to IPFS node!", res.id, res.agentVersion, res.protocolVersion);
}); */
App = {
    loading: false,
    contracts: {},
    repoAddress: '',
    repoBranchMasterAdress: '',

    load: async() => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.makeRepo()
        await App.push()
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async() => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                // Request account access if needed
                await ethereum.enable()
                    // Acccounts now exposed
                web3.eth.sendTransaction({ /* ... */ })
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
                // Acccounts always exposed
            web3.eth.sendTransaction({ /* ... */ })
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async() => {
        // Set the current blockchain account
        App.account = web3.eth.accounts[0]
    },

    loadContract: async() => {
        // Create a JavaScript version of the smart contract
        const createRepo = await $.getJSON('createRepo.json')
        App.contracts.createRepo = TruffleContract(createRepo)
        App.contracts.createRepo.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain
        App.createRepo = await App.contracts.createRepo.deployed()
    },
    makeRepo: async() => {
        const repo = await App.createRepo.createNewRepo("Create Project", "Awsome project el7")
        console.log(repo)
        App.repoAddress = repo.logs[0].args.repoAddress
        App.loadRepo()
    },
    loadRepo: async() => {
        const repo = await $.getJSON('repo.json')
        App.contracts.repo = web3.eth.contract(repo.abi).at(App.repoAddress)
        App.masterBranchPromise()
        App.loadMasterBranch()
            // App.makeCommitPromise()
    },
    masterBranchPromise: async() => {
        return new Promise(function(resolve, reject) {
            App.contracts.repo.getMasterBranch(function(error, response) {
                if (error) {
                    reject(error)
                } else {
                    resolve(response)
                    App.repoBranchMasterAdress = response
                }
            })
        });
    },
    loadMasterBranch: async() => {
        const masterBranch = await $.getJSON('branch.json')
        App.contracts.masterBranch = web3.eth.contract(masterBranch.abi).at(App.repoBranchMasterAdress)
    },

    makeCommitPromise: async() => {
        return new Promise(function(resolve, reject) {
            App.contracts.masterBranch.pushCommit(_authorName, _commitHash, _date,
                _msg, change,
                function(error, response) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(response)
                    }
                })
        });
    },

    push: async() => {
        return $.ajax({
            type: 'GET',
            url: 'http://127.0.0.1:5000/',

            success: function(response) {
                console.log(response);
            },
            error: function(response) {
                return console.error(response);
            }
        });
    },
    getvalue: async() => {
        var value = await App.Simple.get()
        $('#getValue').html(value)

    },
    setValue: async() => {
        var value = $('#setValue').val()
        await App.Simple.set(value)
    }

}

$(() => {
    $(window).load(() => {
        App.load()
    })
})