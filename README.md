# BlockHub
 BlockHub is a decentralized version control system similar to (GitHub,GitLab,...). 
 
## Our Goal: 
 
 Gitcoin is a bug bounties platform for decentralized softwares but unfortunately they use GitHub a centralized app. 
 We intend to create our software for Gitcoin to earn your bounties by making pull-request. Pull-Requests get up-votes, 
 the contributor and the reviewer earn tokens for their help.
 
 
## Installation

Install dependencies 
```sh
npm install
```
OS X & Linux:

```sh
truffle develop
compile
migrate
```
Open Another Terminal
```sh
npm run dev
```
To deploy on ropsten
```sh
deploy --network ropsten-infura
```

Initialize the IPFS Daemon 
```sh
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"*\"]"
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
ipfs daemon
```

Run Flask Server


```sh
. venv/bin/activate
python3 serv.py 
```
