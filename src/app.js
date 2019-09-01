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
        const createRepo = await $.getJSON('../createRepo.json')
        App.contracts.createRepo = TruffleContract(createRepo)
        App.contracts.createRepo.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain
        App.createRepo = await App.contracts.createRepo.deployed()

        if (location.pathname == "/index.html" || location.pathname == "/") {
            App.addReposToHomePage()
        }
    },
    ConnectedToServer: async(response, dir) => {
        const masterBranch = await $.getJSON('../branch.json')
        let urlParams = new URLSearchParams(location.search)
        let branchAddress = urlParams.get('address')
        App.contracts.masterBranch = web3.eth.contract(masterBranch.abi).at(branchAddress)
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
                currentChange.addedFiles = SendAddedFilesToPython(element[key]["change"]["files added"], dir)
                currentChange.removedFiles = element[key]["change"]["files deleted"]
                App.change.push(currentChange)
                App.changeJson.push(JSON.stringify(currentChange))
            }
        }
        let index = 0

        console.log(App.changeJson[0])
        console.log(App.changeJson[1])
        console.log(App.changeJson[2])
        Array.prototype.forEach.call(commitsArray, item => {
            App.makeCommitPromise(App.author[index], App.hash[index], App.message[index], App.date[index], App.changeJson[index])
            index++;
        })


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
        const repo = await $.getJSON('../repo.json')
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
        const masterBranch = await $.getJSON('../branch.json')
        App.contracts.masterBranch = web3.eth.contract(masterBranch.abi).at(App.repoBranchMasterAdress)
        console.log(App.repoBranchMasterAdress)
        window.location.href = "/pages/repoCreationDetails.html" + '?address=' + App.repoBranchMasterAdress + "&repoName=" + $('#repoNameText').val()
    },

    IpfsHashForNewFiles: async(newFiles) => {

        let makeNewFilesArray = newFiles.split("&&")

        let index = 0;
        makeNewFilesArray = makeNewFilesArray.filter(item => item !== "")
        console.log(makeNewFilesArray)


        const ipfsHash = await uploadIPFS(makeNewFilesArray)
        return ipfsHash
    },


    pushCommits: async() => {
        let urlParams = new URLSearchParams(location.search)
        let branchAddress = urlParams.get('address')
        const masterBranch = await $.getJSON('../branch.json')
        App.contracts.masterBranch = web3.eth.contract(masterBranch.abi).at(branchAddress)
        let x = App.change[3].addedFiles
        console.log("--------------------------------------------------------------------------------------------------")
        console.log(x)

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
        document.getElementById('createRepoForm').style.display = 'none'
        document.getElementById('loader').style.display = 'block'
        let input = document.getElementById("uploadInput")
        let msg = $("#initialCommitMsg").val()
        console.log(input.files)
        const masterBranch = await $.getJSON('../branch.json')
        let urlParams = new URLSearchParams(location.search)
        let branchAddress = urlParams.get('address')
        App.contracts.masterBranch = web3.eth.contract(masterBranch.abi).at(branchAddress)
        hashs = ""
        console.log(input.files)
        let filesIterator = 0
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

                            hashs += file.hash + "*" + input.files[filesIterator].name + "*" + input.files[filesIterator].webkitRelativePath + ","
                            filesIterator++
                            console.log(hashs)
                        }
                    })
                })
            }
        })
        setTimeout(function() {
            let date = new Date().toLocaleDateString("en", { year: "numeric", day: "2-digit", month: "2-digit" })
            App.makeCommitPromise("owner", "root", date, msg, hashs)
            goToRepoPage()
        }, 5000)
    },




    showRepoFiles: async() => {
        let urlParams = new URLSearchParams(location.search)
        let ipfsHash
        $('#repoNameNavBar').text(urlParams.get('repoName'))
        const masterBranch = await $.getJSON('../branch.json')
        let branchAddress = urlParams.get('address')
        App.contracts.masterBranch = web3.eth.contract(masterBranch.abi).at(branchAddress)
        App.getRootCommitPromise().then(function(result) {
            LoadRepoFiles(result)
        })

    },

    getRootCommitPromise: () => {
        return new Promise(function(resolve, reject) {
            console.log("HNAAAAAAAAAAAAAAAAAAAAAAAA")
            App.contracts.masterBranch.getRootCommit(
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




    redirectToRepo: async(repoName) => {
        App.createRepo.returnRepoAddress(repoName).then(function(result) {
            let returnRepoAddress = result
            App.createRepo.getRepoMasterBranch(returnRepoAddress).then(function(result) {
                window.location.href = "/pages/repoPage.html" + '?address=' + result + "&repoName=" + repoName
            })
        })
    },





    createIssue: async() => {
        //loading repo
        const repo = await $.getJSON('../repo.json')
        console.log($('#repoNameNavBar').text())
        App.createRepo.returnRepoAddress($('#repoNameNavBar').text()).then(function(result) {
            newRepoAddress = result
            if (newRepoAddress !== '0x0000000000000000000000000000000000000000') {
                console.log(newRepoAddress)
                App.contracts.repo = web3.eth.contract(repo.abi).at(newRepoAddress)
                $('#repoNameNavBar').text($('#repoNameNavBar').text())

                let issueName = $('#issueName').val()
                let issueDescription = $('#issueDescription').val()
                App.makeIssue(issueName, issueDescription)
            } else {
                window.location.href = '/pages/404.html'
            }
        })
    },

    makeIssue: async(issueName, issueDescription) => {
        return new Promise(function(resolve, reject) {
            App.contracts.repo.makeIssue(issueName, issueDescription,
                function(error, response) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(response)
                        console.log(response)
                    }
                })
        });
    },



    addReposToHomePage: async() => {
        App.createRepo.returnRepos().then(function(result) {
            let repos = result
            if (repos.length !== 0) {
                for (let i in repos) {
                    App.createRepo.returnRepoName(repos[i]).then(function(result) {
                        let repoName = result
                        let repoNode = document.createElement("a")
                        repoNode.setAttribute("id", "repoNameLink")
                        let repoURL
                        App.createRepo.returnRepoAddress(repoName).then(function(result) {
                            let returnRepoAddress = result
                            App.createRepo.getRepoMasterBranch(returnRepoAddress).then(function(result) {
                                console.log('result', result)
                                console.log('repoaddress', returnRepoAddress)
                                repoURL = "/pages/repoPage.html" + '?address=' + result + "&repoName=" + repoName
                                repoNode.setAttribute("href", repoURL)
                                let textNode = document.createTextNode(repoName)
                                repoNode.appendChild(textNode)
                                document.getElementById('reposDiv').appendChild(repoNode)
                                let breakNode = document.createElement("br")
                                repoNode.appendChild(breakNode)
                                document.getElementById('reposDiv').appendChild(breakNode)
                            })
                        })

                    })
                }
            } else {
                console.log('no repos found')
            }
        })
    },



    testFn: async() => {}
}

//Loading App
$(window).on('load', function() {
    App.load()
});

//Changing Repo Name in Navbar
$(function() {
    if (location.pathname == "/pages/repoPage.html" || location.pathname == "/pages/issues.html" || location.pathname == "/pages/createIssue.html") {
        changeRepoName()
    }
    if (location.pathname == "/pages/repoPage.html") {
        setTimeout(App.showRepoFiles, 5000)

    }
});