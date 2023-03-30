use aptos_sdk::crypto::ed25519::Ed25519PrivateKey;
use aptos_sdk::types::account_address::AccountAddress;
use aptos_sdk::types::chain_id::ChainId;
use aptos_sdk::types::{LocalAccount, account_address::create_resource_address};
use aptos_sdk::{bcs, rest_client};
use aptos_sdk::{transaction_builder::TransactionBuilder};
use aptos_framework::{BuildOptions, BuiltPackage};
use aptos_cached_packages::aptos_stdlib;
use std::borrow::BorrowMut;
use std::path::PathBuf;
use url::Url;
use anyhow::{Context, Result};
use std::time::{SystemTime, UNIX_EPOCH};
use std::env;

#[tokio::main]
async fn main()  -> Result<()> {
    let args: Vec<String> = env::args().collect();
    let module = &args[1];
    let seed = &args[2];
    println!("deploy module: {:?}", module);
    // setup local account
    let key_bytes = hex::decode(env::var("DEPLOYER_PRIVATE_KEY").unwrap().trim_start_matches("0x")).unwrap();
    let private_key: Ed25519PrivateKey = (&key_bytes[..]).try_into().unwrap();

    let address: AccountAddress = env::var("DEPLOYER_ADDRESS").unwrap().parse().unwrap();

    // setup rest client using rpc node url
    let base_url = env::var("APTOS_NODE_URL").unwrap_or(String::from(""));
    let rest_url = Url::parse(&base_url).expect("url must valid");
    let client = rest_client::Client::new(rest_url).clone();

    let account_info = client.get_account(address).await.context("failed to fetch account info")?.into_inner();


    let mut account = LocalAccount::new(address.into(), private_key, account_info.sequence_number);

    let resource_address = create_resource_address(account.address(), &seed.as_bytes());
    println!("resource account: {:?}", resource_address.to_string());
    println!("resource seed: {:?}", seed);

    // build move package
    let mut build_options = BuildOptions::default();
    build_options. named_addresses.insert("punkninja".to_string(), resource_address);
    build_options.named_addresses.insert("deployer".to_string(), address);

    let package = BuiltPackage::build(
        PathBuf::from(format!("../tokens-move/{}", module)),
        build_options,
    ).expect("building package must succeed");

    let code = package.extract_code();
    let metadata = package.extract_metadata().
        expect("extracting package metadata must succeed");
    
    // deploy resource account and publish package
    let payload = aptos_stdlib::resource_account_create_resource_account_and_publish_package(
        seed.as_bytes().to_vec(), 
        bcs::to_bytes(&metadata).expect("package metadata has BCS"), 
        code,
    );

    let chain_id = client.get_index()
        .await
        .context("Failed to get chain ID")?
        .inner()
        .chain_id;

    let expiration = SystemTime::now().
        duration_since(UNIX_EPOCH).unwrap().as_secs() + 10;   
    

    let sequence_number = account.sequence_number();
    println!("current sequence_number: {:?}", sequence_number);

    let tx = TransactionBuilder::new(
        payload, expiration, ChainId::new(chain_id),
    ).sender(address).sequence_number(sequence_number + 1).max_gas_amount(2_00_000);

    let signed_tx = account.borrow_mut().sign_with_transaction_builder(tx);

    let pending_tx = client.submit(&signed_tx).await.context("failed to submit transfer transaction")?.into_inner();

    println!("tx: {:?}!", pending_tx.hash.to_string());

    client.wait_for_transaction(&pending_tx).await.context("failed when waiting for the transaction")?;
    Ok(())
}