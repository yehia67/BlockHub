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
        await App.testSocket()
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
                currentChange.addedFiles = App.SendAddedFilesToPython(element[key]["change"]["files added"], dir)
                currentChange.removedFiles = element[key]["change"]["files deleted"]
                App.change.push(currentChange)
                App.changeJson.push(JSON.stringify(currentChange))
            }
        }
        let index = 0

        console.log(App.change[0].addedFiles)
        console.log(App.changeJson[0])
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
    testSocket: () => {
        var eventSource = new EventSource("http://127.0.0.1:5000/stream")
        eventSource.onmessage = function(e) {
            if (e.data !== "wait") {
                console.log(e.data)
                console.log("------------------------------------------------------------------------")
                let commitInfo = e.data.split("&&&&")
                App.ConnectedToServer(commitInfo[1], commitInfo[0])

            }

        }
    },
    SendAddedFilesToPython: (newAddedFiles, dir) => {
        const addedFiles = []

        for (let i = 0; i < newAddedFiles.length; i++) {
            let files = newAddedFiles[i].split(',')
            for (let j = 0; j < files.length; j++) {
                let fileNameAndLocation = files[j].split('/')
                let name = fileNameAndLocation.pop()
                let location = files[j].replace(name, '')
                    //Possible bug if we have directory inside directory
                addedFiles.push(name + "**" + dir + "/" + name + "**" + location + "&&")
            }
            console.log(addedFiles)
        }
        $.ajax({
            type: 'GET',
            url: 'http://127.0.0.1:5000/getFilesData?files=' + addedFiles,

            success: function(response) {
                alert(response)
                return App.IpfsHashForNewFiles(response)
            },
            error: function(response) {
                return console.error(response);
            }
        });

    },
    IpfsHashForNewFiles: (newFiles) => {
        let makeNewFilesArray = newFiles.split(+"&&")
        newFilesWithHashes = ""
        console.log(newFiles)
        Array.prototype.forEach.call(makeNewFilesArray, item => {

            fileInfo = item.split("**")

            ipfs.add(Buffer.from(fileInfo[1]), function(err, res) {
                if (err || !res) {
                    return console.error('ipfs add error', err, res)
                }
                res.forEach(function(file) {
                    if (file && file.hash) {

                        newFilesWithHashes += file.hash + "*" + fileInfo[0] + "*" + fileInfo[1] + ","
                        console.log(file.hash + " " + fileInfo[0])

                    }
                })
            })

        })
        return newFilesWithHashes
    },
    pushCommits: async() => {
        let urlParams = new URLSearchParams(location.search)
        let branchAddress = urlParams.get('address')
        const masterBranch = await $.getJSON('../branch.json')
        App.contracts.masterBranch = web3.eth.contract(masterBranch.abi).at(branchAddress)
        let x = App.change[3].addedFiles
        console.log("--------------------------------------------------------------------------------------------------")
        console.log(x)
            //newFilesHash = returnIpfsHashForNewFiles()

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
            App.goToRepoPage()
        }, 5000)
    },



    goToRepoPage: async() => {
        let urlParams = new URLSearchParams(location.search)
        window.location.href = "/pages/repoPage.html" + '?address=' + urlParams.get('address') + "&repoName=" + urlParams.get('repoName')
    },
    showRepoFiles: async() => {
        let urlParams = new URLSearchParams(location.search)
        let ipfsHash
        $('#repoNameNavBar').text(urlParams.get('repoName'))
        const masterBranch = await $.getJSON('../branch.json')
        let branchAddress = urlParams.get('address')
        App.contracts.masterBranch = web3.eth.contract(masterBranch.abi).at(branchAddress)
        App.getRootCommitPromise().then(function(result) {
                App.LoadRepoFiles(result)
            })
            //App.pushCommits()

    },
    LoadRepoFiles: async(ipfsHashs) => {
        let ipfsFiles = ipfsHashs.split(',')
        console.log(ipfsFiles)
        if (ipfsHashs.length !== 0) {
            for (let index = 0; index < ipfsFiles.length - 1; index++) {
                let file = ipfsFiles[index].split("*")
                $("#repoFiles").append("<tr style='color:steelBlue;font-family:ABeeZee, sans-serif;font-size:18px;'><td" + " onclick= ' App.uploadFile(" + '"' + file[0] + '"' + ")'" + "style='cursor:pointer !important;' >" + file[1] + "</<td><td>" + file[2] + "</td>   </tr>")
            }
            App.showCommits(true)
        } else {
            App.showCommits(false)
        }

    },
    uploadFile: (hash) => {
        $("table").hide()
        App.display("filContent", hash)
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
    display: (diplayID, hash) => {
        ipfs.cat(hash, function(err, res) {
            if (err || !res) {
                return console.error('ipfs cat error', err, res)
            }
            console.log(res.toString())
            $("#" + diplayID).html("<p>" + res.toString() + "</p>")
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
        let repos = await App.createRepo.returnRepos()
        console.log(repos)
        let repoName = $('#searchBox').val()
        let returnRepoAddress
        App.createRepo.returnRepoAddress(repoName).then(function(result) {
            returnRepoAddress = result
            if (returnRepoAddress !== '0x0000000000000000000000000000000000000000') {
                App.redirectToRepo(repoName)
            } else {
                window.location.href = '/pages/404.html'
            }
        })
    },

    redirectToRepo: async(repoName) => {
        App.createRepo.returnRepoAddress(repoName).then(function(result) {
            let returnRepoAddress = result
            App.createRepo.getRepoMasterBranch(returnRepoAddress).then(function(result) {
                window.location.href = "/pages/repoPage.html" + '?address=' + result + "&repoName=" + repoName
            })
        })
    },

    changeRepoName: async() => {
        let urlParams = new URLSearchParams(location.search)
        $('#repoNameNavBar').text(urlParams.get('repoName'))
    },

    createNewIssue: async() => {
        window.location.href = '/pages/createIssue.html' + '?' + 'repoName' + '=' + $('#repoNameNavBar').text()
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

    goToIssue: async() => {
        let urlParams = new URLSearchParams(location.search)
        window.location.href = "/pages/issues.html" + '?address=' + urlParams.get('address') + "&repoName=" + urlParams.get('repoName')
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
    showCommits: async(boolValue) => {
        //Hide Loader
        document.getElementById('loader').style.display = 'none'

        //Show Initial Commits
        if (boolValue) {
            console.log(document.getElementById('commitsDiv'))
            document.getElementById('commitsDiv').style.display = 'block'
            document.getElementById('noCommitBtn').style.display = 'none'
        }

        //No Initial Commits
        else {
            document.getElementById('commitsDiv').style.display = 'none'
            document.getElementById('noCommitBtn').style.display = 'block'
        }
    },

    goToInitialCommitPage: async() => {
        let urlParams = new URLSearchParams(location.search)
        window.location.href = "/pages/repoCreationDetails.html" + '?address=' + urlParams.get('address') + "&repoName=" + urlParams.get('repoName')
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
        App.changeRepoName()
    }
    if (location.pathname == "/pages/repoPage.html") {
        setTimeout(App.showRepoFiles, 5000)

    }
});