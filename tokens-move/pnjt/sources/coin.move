module punkninja::pnjt {
    use std::string;
    use std::signer::{address_of};
    use std::error;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_std::table::{Self, Table};
    use aptos_framework::resource_account;

    const ENOT_AUTHORIZED: u64 = 1;
    const EINVALID_ROLE_ID: u64 = 2;
    const EALREAY_ADDED: u64 = 3;
    const ENOT_EXIST: u64 = 4;
    const EREMOVE_SELF: u64 = 5;

    const ROLE_ADMIN:  u8 = 1;
    const ROLE_BURNER: u8 = 2;
    const ROLE_MINTER: u8 = 3;
    const ROLE_WITHRAWER: u8 = 4;

    struct CoinCapabilities<phantom CoinType> has key {
        roles: Table<u8, vector<address>>,
        signer_cap: account::SignerCapability,
        burn_cap: coin::BurnCapability<CoinType>,
        mint_cap: coin::MintCapability<CoinType>,
        freeze_cap: coin::FreezeCapability<CoinType>,
    }

    public entry fun add_role<CoinType>(caller: &signer, role_id: u8 , member: address) acquires CoinCapabilities {
        let caller_addr = address_of(caller);
        let roles = &mut borrow_global_mut<CoinCapabilities<CoinType>>(@punkninja).roles;

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

    public entry fun remove_role<CoinType>(caller: &signer, role_id: u8 , member: address) acquires CoinCapabilities {
        let caller_addr = address_of(caller);
        let roles = &mut borrow_global_mut<CoinCapabilities<CoinType>>(@punkninja).roles;
        
        // can not remove self
        assert!(caller_addr != member, error::permission_denied(EREMOVE_SELF));

        // role id must exsit
         assert!(table::contains(roles, role_id), error::permission_denied(EINVALID_ROLE_ID));

        // caller must has admin role
        let admins = table::borrow(roles, ROLE_ADMIN);
        assert!(vector::contains(admins, &caller_addr), error::permission_denied(ENOT_AUTHORIZED));

        // roles not added
        let role =table::borrow_mut(roles, role_id);
        let (exsit, index) = vector::index_of(role, &member);
        assert!(exsit, error::permission_denied(ENOT_EXIST));
        vector::remove(role, index);
    }

    /// Create new coins `CoinType` and deposit them into dst_addr's account.
    public entry fun mint<CoinType>(
        caller: &signer,
        dst_addr: address,
        amount: u64,
    ) acquires CoinCapabilities {
        // caller must be minter
        let caller_addr = address_of(caller);
        let capabilities = borrow_global<CoinCapabilities<CoinType>>(@punkninja);
        let minters = table::borrow(&capabilities.roles, ROLE_MINTER);
        assert!(vector::contains(minters, &caller_addr), error::permission_denied(ENOT_AUTHORIZED));
        let coins_minted = coin::mint(amount, &capabilities.mint_cap);
        coin::deposit(dst_addr, coins_minted);
    }

    /// Withdraw an `amount` of coin `CoinType` from `account` and burn it.
    public entry fun burn<CoinType>(
        caller: &signer,
        amount: u64,
    ) acquires CoinCapabilities {
        // caller must be burner
        let caller_addr = address_of(caller);
        let capabilities = borrow_global<CoinCapabilities<CoinType>>(@punkninja);
        let burners = table::borrow(&capabilities.roles, ROLE_BURNER);
        assert!(vector::contains(burners, &caller_addr), error::permission_denied(ENOT_AUTHORIZED));

        let from = account::create_signer_with_capability(&capabilities.signer_cap);
        let to_burn = coin::withdraw<CoinType>(&from, amount);
        coin::burn(to_burn, &capabilities.burn_cap);
    }

    /// Withdraw an `amount` of coin `CoinType` from `account` and deposit to other account.
    public entry fun withdraw_to<CoinType>(
        caller: &signer,
        to: address,
        amount: u64,
    ) acquires CoinCapabilities {
        // caller must be burner
        let caller_addr = address_of(caller);
        let capabilities = borrow_global<CoinCapabilities<CoinType>>(@punkninja);
        let withdrawer = table::borrow(&capabilities.roles, ROLE_WITHRAWER);
        assert!(vector::contains(withdrawer, &caller_addr), error::permission_denied(ENOT_AUTHORIZED));

        let from = account::create_signer_with_capability(&capabilities.signer_cap);
        let c = coin::withdraw<CoinType>(&from, amount);
        coin::deposit(to, c);
    }

    struct PunkNinjaToyToken {}
    fun init_module(resource_signer: &signer) {
        // retrieve the signer capability
        let signer_cap = resource_account::retrieve_resource_account_cap(resource_signer, @deployer);
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<PunkNinjaToyToken>(
            resource_signer,
            string::utf8(b"Punk Ninja Power Token"),
            string::utf8(b"PNJT"),
            8,
            true,
        );

        // add roles
        let roles = table::new();
        let admins = vector::empty<address>();
        vector::push_back(&mut admins, @deployer);
        let minters = vector::empty<address>();
        vector::push_back(&mut minters, @deployer);
        let burners = vector::empty<address>();
        vector::push_back(&mut burners, @deployer);
        let withdrawers = vector::empty<address>();
        vector::push_back(&mut withdrawers, @deployer);
        table::add(&mut roles, ROLE_ADMIN, admins);
        table::add(&mut roles, ROLE_MINTER, minters);
        table::add(&mut roles, ROLE_BURNER, burners);
        table::add(&mut roles, ROLE_WITHRAWER, withdrawers);

        move_to(resource_signer, CoinCapabilities<PunkNinjaToyToken> {
            roles,
            signer_cap,
            burn_cap,
            freeze_cap,
            mint_cap,
        });
        aptos_framework::coin::register<PunkNinjaToyToken>(resource_signer);
    }
}