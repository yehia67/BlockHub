const ipfs = IpfsApi("localhost", "5001")
    //const ipfs = IpfsApi("ipfs.infura.io", "5001", {protocol: 'https'});
ipfs.id(function(err, res) {
    if (err) throw err
    console.log("Connected to IPFS node!", res.id, res.agentVersion, res.protocolVersion);
})
App = {
    loading: false,
    contracts: {},
    repoAddress: '',
    repoBranchMasterAdress: '',
    commitsLength: -1,
    author: '',
    message: '',
    hash: '',
    change: {},
    date: '',
    changeJson: '',
    ipfsHash: '',

    load: async() => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.ConnectedToServer()
        await App.makeRepo()

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
    ConnectedToServer: async() => {
        var commitsArray = []
        $.ajax({
            type: 'GET',
            url: 'http://127.0.0.1:5000/getDifference?len=29',

            success: function(response) {
                var commitsArray = JSON.parse(response)
                var element = commitsArray[0]
                console.log(element)
                for (key in element) {
                    console.log("key : " + key + "-> " + element[key]["author"])
                    App.author = element[key]["author"]
                    App.hash = element[key]["hash"]
                    App.message = element[key]["message"]
                    App.date = element[key]["date"]
                    /*for(changeKey in element[key]["change"]) {
                        if(changeKey === "Added Lines") {
                            App.change.addedLines = element[key]["change"][changeKey]
                        } else if(changeKey === "Removed Lines") {
                            App.change.removedLines = element[key]["change"][changeKey]
                        } else if(changeKey === "files added") {
                            App.change.addedFiles = element[key]["change"][changeKey]
                        } else if(changeKey === "files deleted") {
                            App.change.removedFiles = element[key]["change"][changeKey]
                        }
                    }*/
                    App.change.addedLines = element[key]["change"]["Added Lines"]
                    App.change.removedLines = element[key]["change"]["Removed Lines"]
                    App.change.addedFiles = element[key]["change"]["files added"]
                    App.change.removedFiles = element[key]["change"]["files deleted"]

                    App.changeJson = JSON.stringify(App.change)
                }

            },
            error: function(response) {
                return console.error(response);
            }
        });
    },
    makeRepo: async() => {
        let repoName = prompt("enter your repo name")
        let repoDescription = prompt("enter repo desription")
        const repo = await App.createRepo.createNewRepo(repoName, repoDescription)
        console.log(repo)
        App.repoAddress = repo.logs[0].args.repoAddress
        alert("Your repo address is " + App.repoAddress)
        App.loadRepo()
    },
    loadRepo: async() => {
        const repo = await $.getJSON('repo.json')
        App.contracts.repo = web3.eth.contract(repo.abi).at(App.repoAddress)
        App.masterBranchPromise()

    },
    masterBranchPromise: async() => {
        return new Promise(function(resolve, reject) {
            App.contracts.repo.getMasterBranch(function(error, response) {
                if (error) {
                    reject(error)
                } else {
                    resolve(response)
                    console.log("hnaaaa " + response)
                    alert("branch address = " + response)
                    App.repoBranchMasterAdress = response
                    App.loadMasterBranch()

                }
            })
        });
    },
    loadMasterBranch: async() => {
        const masterBranch = await $.getJSON('branch.json')
        App.contracts.masterBranch = web3.eth.contract(masterBranch.abi).at(App.repoBranchMasterAdress)
        console.log(App.repoBranchMasterAdress)
        App.pushCommits()
    },
    pushCommits: async() => {
        App.checkLengthPromise()
        ipfs.add([Buffer.from(JSON.stringify(App.changeJson))], function(err, res) {
            if (err || !res) {
                return console.error('ipfs add error', err, res)
            } else {
                App.makeCommitPromise(App.author, App.hash, App.date, App.message, res[0].hash)
            }
        })
    },
    checkLengthPromise: async() => {
        return new Promise(function(resolve, reject) {
            App.contracts.masterBranch.getCommitsArrayLength(
                function(error, response) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(response)
                        console.log("length " + response)
                        App.commitsLength = response

                    }
                })
        });
    },
    checkLastHashPromise: async() => {
        return new Promise(function(resolve, reject) {
            App.contracts.masterBranch.getLastCommitHash(
                function(error, response) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(response)
                        console.log("hash " + response)
                    }
                })
        });
    },

    makeCommitPromise: (_authorName, _commitHash, _date, _msg, _change) => {
        return new Promise(function(resolve, reject) {
            App.contracts.masterBranch.pushCommit(_authorName, _commitHash, _date,
                _msg, _change,
                function(error, response) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(response)
                        alert("done")
                        console.log(response)
                    }
                })
        });
    },


    getvalue: async() => {
        ipfs.cat(App.ipfsHash, function(err, res) {
            if (err || !res) {
                return console.error('ipfs cat error', err, res)
            }
            $('#getValue').html(res.toString())
        })
    },
    setValue: async() => {
        var input = document.getElementById("setValue");
        var fReader = new FileReader();
        fReader.readAsText(input.files[0]);
        fReader.onloadend = function(event) {
            filePath = event.target.result
            ipfs.add([Buffer.from(JSON.stringify(event.target.result))], function(err, res) {
                if (err || !res) {
                    return console.error('ipfs add error', err, res)
                } else {
                    App.ipfsHash = res[0].hash
                    console.log(res[0].hash)
                }
            })
        }
    },
    uploadIPFS: (file) => {
        let hash
        ipfs.add([Buffer.from(JSON.stringify(file))], function(err, res) {
            if (err || !res) {
                return console.error('ipfs add error', err, res)
            } else {
                hash = res[0].hash
                console.log(res[0].hash)
            }
        })
        return hash
    }


}

$(() => {
    $(window).load(() => {
        App.load()
    })
})