module punkninja::nft {
    use std::string::{Self, String};
    use std::vector;
    use std::signer::{address_of};
    use std::error;
    use aptos_framework::account;
    use aptos_token::token::{Self};
    use aptos_token::token_transfers::{Self};
    use aptos_std::table::{Self, Table};
    use aptos_framework::resource_account;

    struct NFTRolesData has key {
        roles: Table<u8, vector<address>>,
        signer_cap: account::SignerCapability,
        collection: String,
    }

    const ENOT_AUTHORIZED: u64 = 1;
    const EINVALID_ROLE_ID: u64 = 2;
    const EALREAY_ADDED: u64 = 3;
    const ENOT_EXIST: u64 = 4;
    const EREMOVE_SELF: u64 = 5;

    const ROLE_ADMIN:  u8 = 1;
    const ROLE_MINTER: u8 = 3;

    fun init_module(resource_signer: &signer) {
         // Create punkninja nft collection
        let maximum_supply = 0;
        let mutate_setting = vector<bool>[ false, false, false];
        let collection_name = string::utf8(b"PunkNinja");
        let description = string::utf8(b"PunkNinja collaborates with Japanese offline Web3 initiatives, seamlessly connecting over 10 million tourists annually to both the physical and metaverse realms, bridges offline value with the Web3 game.");
        let collection_uri = string::utf8(b"https://nft.punkninja.com/aptos/collection/1");
        token::create_collection(resource_signer, collection_name , description, collection_uri, maximum_supply, mutate_setting);

        // add roles
        let roles = table::new();
        let admins = vector::empty<address>();
        vector::push_back(&mut admins, @deployer);
        let minters = vector::empty<address>();
        vector::push_back(&mut minters, @deployer);
        table::add(&mut roles, ROLE_ADMIN, admins);
        table::add(&mut roles, ROLE_MINTER, minters);

        let signer_cap = resource_account::retrieve_resource_account_cap(resource_signer, @deployer);
        move_to(resource_signer, NFTRolesData {
            roles: roles,
            signer_cap: signer_cap,
            collection: collection_name,
        });
        aptos_framework::coin::register<aptos_framework::aptos_coin::AptosCoin>(resource_signer);
    }

    public entry fun add_role(caller: &signer, role_id: u8 , member: address) acquires NFTRolesData {
        let caller_addr = address_of(caller);
        let roles = &mut borrow_global_mut<NFTRolesData>(@punkninja).roles;

        // role id must exsit
        assert!(table::contains(roles, role_id), error::permission_denied(EINVALID_ROLE_ID));

        // caller must has admin role
        let admins = table::borrow(roles, ROLE_ADMIN);
        assert!(vector::contains(admins, &caller_addr), error::permission_denied(ENOT_AUTHORIZED));

        // roles not added
        let role = table::borrow_mut(roles, role_id);
        assert!(!vector::contains(role, &member), error::permission_denied(EALREAY_ADDED));

        vector::push_back(role, member);
    }

    public entry fun remove_role(caller: &signer, role_id: u8 , member: address) acquires NFTRolesData {
        let caller_addr = address_of(caller);
        let roles = &mut borrow_global_mut<NFTRolesData>(@punkninja).roles;
        
        // can not remove self
        assert!(caller_addr != member, error::permission_denied(EREMOVE_SELF));

        // role id must exsit
         assert!(table::contains(roles, role_id), error::permission_denied(EINVALID_ROLE_ID));

        // caller must has admin role
        let admins = table::borrow(roles, ROLE_ADMIN);
        assert!(vector::contains(admins, &caller_addr), error::permission_denied(ENOT_AUTHORIZED));

        // roles not added
        let role = table::borrow_mut(roles, role_id);
        let (exsit, index) = vector::index_of(role, &member);
        assert!(exsit, error::permission_denied(ENOT_EXIST));
        vector::remove(role, index);
    }

    public entry fun transfer_token_script(
        sender: &signer,
        receiver: address,
        name: String,
        property_version: u64,
        amount: u64,
    ) acquires NFTRolesData  {
        let data = borrow_global<NFTRolesData>(@punkninja);
        let token_id = token::create_token_id_raw(@punkninja, data.collection, name, property_version);
        token::transfer(sender, token_id, receiver, amount);
    }

    public entry fun mint_token_to_script(
        caller: &signer,
        receiver: address,
        name: String,
        description: String,
        uri: String,
    ) acquires NFTRolesData {
        // caller must be minter
        let caller_addr = address_of(caller);
        let data = borrow_global<NFTRolesData>(@punkninja);
        let minters = table::borrow(&data.roles, ROLE_MINTER);
        assert!(vector::contains(minters, &caller_addr), error::permission_denied(ENOT_AUTHORIZED));

        let resource_signer = account::create_signer_with_capability(&data.signer_cap);
        let token_mut_config = token::create_token_mutability_config(&vector<bool>[false,false,false,false,false]);
        let tokendata_id = token::create_tokendata(
            &resource_signer,
            data.collection,
            name,
            description,
            1,
            uri,
            @punkninja,
            0,
            0,
            token_mut_config,
            vector<String>[],
            vector<vector<u8>>[],
            vector<String>[]
        );
        token::mint_token_to(&resource_signer, receiver, tokendata_id, 1);
    }

    public entry fun mint_offer_token_script(
        caller: &signer,
        receiver: address,
        name: String,
        description: String,
        uri: String,
    ) acquires NFTRolesData {
        // caller must be minter
        let caller_addr = address_of(caller);
        let data = borrow_global<NFTRolesData>(@punkninja);
        let minters = table::borrow(&data.roles, ROLE_MINTER);
        assert!(vector::contains(minters, &caller_addr), error::permission_denied(ENOT_AUTHORIZED));

        let resource_signer = account::create_signer_with_capability(&data.signer_cap);
        let token_mut_config = token::create_token_mutability_config(&vector<bool>[false,false,false,false,false]);
        let tokendata_id = token::create_tokendata(
            &resource_signer,
            data.collection,
            name,
            description,
            1,
            uri,
            @punkninja,
            0,
            0,
            token_mut_config,
            vector<String>[],
            vector<vector<u8>>[],
            vector<String>[]
        );
        token::mint_token(&resource_signer, tokendata_id, 1);
        let token_id = token::create_token_id_raw(@punkninja, data.collection, name, 0);
        token_transfers::offer(&resource_signer, receiver, token_id, 1);
    }

    public entry fun cancel_offer_script(
        caller: &signer,
        receiver: address,
        name: String,
        property_version: u64
    ) acquires NFTRolesData {
        // caller must be minter
        let caller_addr = address_of(caller);
        let data = borrow_global<NFTRolesData>(@punkninja);
        let minters = table::borrow(&data.roles, ROLE_MINTER);
        assert!(vector::contains(minters, &caller_addr), error::permission_denied(ENOT_AUTHORIZED));
        let resource_signer = account::create_signer_with_capability(&data.signer_cap);
        let token_id = token::create_token_id_raw(@punkninja, data.collection, name, property_version);
        token_transfers::cancel_offer(&resource_signer, receiver, token_id);
    }

    public entry fun upgrade_package(
        caller: &signer,
        metadata_serialized: vector<u8>,
        code: vector<vector<u8>>,
    ) acquires NFTRolesData {
        // caller must be admin
        let caller_addr = address_of(caller);
        let data = borrow_global<NFTRolesData>(@punkninja);
        let admins = table::borrow(&data.roles, ROLE_ADMIN);
        assert!(vector::contains(admins, &caller_addr), error::permission_denied(ENOT_AUTHORIZED));
        let resource_signer = account::create_signer_with_capability(&data.signer_cap);
        aptos_framework::code::publish_package_txn(&resource_signer, metadata_serialized, code);
    }
}