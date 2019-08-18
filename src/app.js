const ipfs = IpfsApi("localhost", "5001")
    //const ipfs = IpfsHttpClient("ipfs.infura.io", "5001", {protocol: 'https'});
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
    author: [],
    message: [],
    hash: [],
    change: [],
    date: [],
    changeJson: [],
    ipfsHashArr: [],
    ipfsHash: '',

    load: async() => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.ConnectedToServer()
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
            url: 'http://127.0.0.1:5000/getDifference?len=30',

            success: function(response) {
                var commitsArray = JSON.parse(response)
                for (var i = 0; i < commitsArray.length; i++) {
                    var element = commitsArray[i]
                    console.log(element)
                    for (key in element) {
                        console.log("key : " + key + "-> " + element[key]["author"])
                        App.author.push(element[key]["author"])
                        App.hash.push(element[key]["hash"])
                        App.message.push(element[key]["message"])
                        App.date.push(element[key]["date"])
                        currentChange = {}
                        currentChange.addedLines = element[key]["change"]["Added Lines"]
                        currentChange.removedLines = element[key]["change"]["Removed Lines"]
                        currentChange.addedFiles = element[key]["change"]["files added"]
                        currentChange.removedFiles = element[key]["change"]["files deleted"]
                        App.change.push(currentChange)

                        App.changeJson.push(JSON.stringify(currentChange))
                    }
                }
                console.log("Authors : ", App.author)
                console.log("Dates : ", App.date)
                console.log("Messages : ", App.message)
                console.log("Hashes: ", App.hash)
                    // App.makeRepo()

            },
            error: function(response) {
                return console.error(response);
            }
        });
    },
    makeRepo: async() => {
        let repoName = $('#repoNameText').val()
        let repoDescription = $('#repoDescriptionText').val()
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
        window.location.href = "repoCreationDetails.html";

        //App.pushCommits()
        //App.pushGitFile()
    },
    pushCommits: async() => {
        App.checkLengthPromise()
        for (let j = 0; j < App.hash.length; j++) {
            ipfs.add([Buffer.from(App.changeJson[j])], function(err, res) {
                if (err || !res) {
                    return console.error('ipfs add error', err, res)
                } else {
                    console.log(App.author[j])
                    App.makeCommitPromise(App.author[j], App.hash[j], App.date[j], App.message[j], res[0].hash)
                }
            })
        }
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

    pushGitFile: async() => {
        ipfs.add([Buffer.from("/.git")], function(err, res) {
            if (err || !res) {
                return console.error('ipfs add error', err, res)
            } else {
                console.log("weeeeeeeeeeeeeeeeeeeeeeeeee")
            }
        })
    },


    getvalue: async() => {
        ipfs.cat(App.ipfsHash, function(err, res) {
            if (err || !res) {
                return console.error('ipfs cat error', err, res)
            }
            $('#getValue').html(res.toString())

        })
    },
    initialCommit: async() => {
        let input = document.getElementById("uploadInput")
        hashs = []
        console.log(input.files)
        Array.prototype.forEach.call(input.files, item => {
            let fReader = new FileReader()
            fReader.readAsText(item)
            fReader.onloadend = function(event) {
                ipfs.add(Buffer.from(event.target.result), function(err, res) {
                    if (err || !res) {
                        return console.error('ipfs add error', err, res)
                    }
                    res.forEach(function(file) {
                        if (file && file.hash) {
                            console.log('successfully stored', file.hash)
                            console.log(file.hash)
                            console.log(file)
                            console.log(res)
                            hashs.push(file.hash)
                        }
                    })
                })
            }
        });
    },

    display: (hash) => {
        ipfs.cat(hash, function(err, res) {
            if (err || !res) {
                return console.error('ipfs cat error', err, res)
            }

            document.getElementById('hash').innerText = hash
            document.getElementById('content').innerText = res.toString()
        })
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
    },

    viewRepo: async() => {
        let repos = await App.createRepo.returnRepoNames()
        console.log(repos)
        let repoName = $('#searchBox').val()
        let returnRepoName
        App.createRepo.returnRepoAddress(repoName).then(function(result) {
            returnRepoName = result
            console.log(returnRepoName)
            if (returnRepoName !== '0x0000000000000000000000000000000000000000') {
                console.log(repoName)
            } else {
                alert("Repo not found!")
            }
        })
    },

    redirectToRepo: async(repoName) => {
        window.location.href = 'repoPage.html' + '?' + 'repoName' + '=' + repoName
    },

    changeRepoName: async() => {
        let urlParams = new URLSearchParams(location.search)
        $('#repoNameNavBar').text(urlParams.get('repoName'))
    },

    testFn: async() => {}
}

//Loading App
$(window).on('load', function() {
    App.load()
});

//Changing Repo Name in Navbar
$(function() {
    if (location.pathname == "/repoPage.html") {
        App.changeRepoName()
    }
});