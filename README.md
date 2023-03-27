# punkninja
PunkNinja is a Web3 casual game platform of SakuraVerse. Through more relaxed and casual games, PunkNinja will further reduce the threshold for Web3 games and players from all over the world will be connected.

Please visit my website for more info  https://punkninja.sakuraverse.com/
# NFT minting demo on Aptos network

More detailed guide [here](https://imcoding.online/tutorials/how-to-implement-mint-allowlist-on-aptos).

## publish the module

```shell
$ cd deploy
$ export DEPLOYER_ADDRESS=3272452b1da356896514aecb4e9d9625b207c10b3affe04845f9763e838c7c6c
$ export DEPLOYER_PRIVATE_KEY=001140ddc92b95eed0655a73fde1f0141225329cc0212826d7ea056148b2a6e8
$ export APTOS_NODE_URL=http://127.0.0.1:8080
$ cargo run
```

If all goes well, the console will output the resource account and transaction hash.

```shell
resource account: "e678abebea551c752030dfe6c78147e62b393b74163a4f167ab3444e0eda55a9"
tx: "0x1233ab41de4c5b8346b7110b3f163ab835c24265bd93c7e2c99cd0b287af9ed2"!
```
