viewRepo = async() => {
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
};

changeRepoName = async() => {
    let urlParams = new URLSearchParams(location.search)
    $('#repoNameNavBar').text(urlParams.get('repoName'))
}

goToIssue = async() => {
    let urlParams = new URLSearchParams(location.search)
    window.location.href = "/pages/issues.html" + '?address=' + urlParams.get('address') + "&repoName=" + urlParams.get('repoName')
}
goToRepoPage = async() => {
    let urlParams = new URLSearchParams(location.search)
    window.location.href = "/pages/repoPage.html" + '?address=' + urlParams.get('address') + "&repoName=" + urlParams.get('repoName')
}
createNewIssue = async() => {
    window.location.href = '/pages/createIssue.html' + '?' + 'repoName' + '=' + $('#repoNameNavBar').text()
}
goToInitialCommitPage = async() => {
    let urlParams = new URLSearchParams(location.search)
    window.location.href = "/pages/repoCreationDetails.html" + '?address=' + urlParams.get('address') + "&repoName=" + urlParams.get('repoName')
}