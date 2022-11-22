module SakuraVerseTokenType::sakuraverse {
    use std::signer;
    struct SakuraToken {}
    struct PunkNinjaToken {}
    struct PunkPowerToken {}

    fun init_module(sender: &signer) {
        aptos_framework::managed_coin::initialize<SakuraToken>(
            sender,
            b"Sakura Token",
            b"Sakura",
            8,
            false,
        );

        aptos_framework::managed_coin::initialize<PunkNinjaToken>(
            sender,
            b"Punk Ninja Token",
            b"PNT",
            8,
            false,
        );


        aptos_framework::managed_coin::initialize<PunkPowerToken>(
            sender,
            b"Punk Power Token",
            b"PPT",
            8,
            false,
        );
    }

    use std::string::String;
    use aptos_token::token::{Self};
    use aptos_token::token_transfers::{Self};

    public entry fun transfer_token_script(
        sender: &signer,
        receiver: address,
        creator: address,
        collection: String,
        name: String,
        property_version: u64,
        amount: u64,
    ) {
        let token_id = token::create_token_id_raw(creator, collection, name, property_version);
        token::transfer(sender, token_id, receiver, amount);
    }

    public entry fun mint_token_to_script(
        sender: &signer,
        receiver: address,
        collection: String,
        name: String,
        description: String,
        uri: String,
    ) {
        let token_mut_config = token::create_token_mutability_config(&vector<bool>[false,false,false,false,false]);
        let account_addr = signer::address_of(sender);
        let tokendata_id = token::create_tokendata(
            sender,
            collection,
            name,
            description,
            1,
            uri,
            account_addr,
            0,
            0,
            token_mut_config,
            vector<String>[],
            vector<vector<u8>>[],
            vector<String>[]
        );
        token::mint_token_to(sender, receiver, tokendata_id, 1);
    }

    public entry fun mint_offer_token_script(
        sender: &signer,
        receiver: address,
        collection: String,
        name: String,
        description: String,
        uri: String,
    ) {
        let token_mut_config = token::create_token_mutability_config(&vector<bool>[false,false,false,false,false]);
        let account_addr = signer::address_of(sender);
        let tokendata_id = token::create_tokendata(
            sender,
            collection,
            name,
            description,
            1,
            uri,
            account_addr,
            0,
            0,
            token_mut_config,
            vector<String>[],
            vector<vector<u8>>[],
            vector<String>[]
        );
        token::mint_token(sender, tokendata_id, 1);
        let token_id = token::create_token_id_raw(account_addr, collection, name, 0);
        token_transfers::offer(sender, receiver, token_id, 1);
    }

    public entry fun prepare_account_script(
        owner: &signer
    ) {
        let account_addr = signer::address_of(owner);
        if(!aptos_framework::coin::is_account_registered<SakuraToken>(account_addr)){
            aptos_framework::managed_coin::register<SakuraToken>(owner);
        };

        if(!aptos_framework::coin::is_account_registered<PunkNinjaToken>(account_addr)){
            aptos_framework::managed_coin::register<PunkNinjaToken>(owner);
        };

        if(!aptos_framework::coin::is_account_registered<PunkPowerToken>(account_addr)){
            aptos_framework::managed_coin::register<PunkPowerToken>(owner);
        };
        //token::opt_in_direct_transfer(owner, true);
    }
}