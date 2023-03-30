use std::str::FromStr;
use std::time::Duration;
use aptos_sdk::rest_client::aptos_api_types::{MoveValue, HexEncodedBytes};
use aptos_sdk::rest_client::aptos_api_types::{TransactionPayload, EntryFunctionPayload, EntryFunctionId};
use poem::{endpoint::StaticFilesEndpoint, Route, listener::TcpListener};
use poem_openapi::Object;
use poem_openapi::{OpenApi, OpenApiService, payload::Json};
use aptos_sdk::types::account_address::AccountAddress;
use aptos_sdk::types::account_address::create_resource_address;
use aptos_sdk::bcs;
use aptos_framework::{BuildOptions, BuiltPackage};
use std::path::PathBuf;
use anyhow::Result;

const SERVER_NAME: &str = "AptosDeployer";
struct Api;

#[derive(Object)]
struct PublishRequest {
    module: String,
    wallet: String,
    seed: String,
}

#[OpenApi]
impl Api {
    #[oai(path = "/", method = "get")]
    async fn default(&self) -> Json<String> {
        Json(format!("Welcome to use {}", SERVER_NAME))
    }
    
    #[oai(path = "/publish", method = "post")]
    async fn publish(&self, req: Json<PublishRequest>) -> Json<TransactionPayload> {
        let address: AccountAddress = req.wallet.parse().unwrap();
        let seed: Vec<u8> = req.seed.as_bytes().to_vec();
        let resource_address = create_resource_address(address, &seed);
        println!("deployer: {:?}", address.to_string());
        println!("punkninja: {:?}", resource_address.to_string());
        println!("seed: {:?}", seed);

        // build move package
        let mut build_options = BuildOptions::default();
        build_options. named_addresses.insert("punkninja".to_string(), resource_address);
        build_options.named_addresses.insert("deployer".to_string(), address);

        let package = BuiltPackage::build(
            PathBuf::from(format!("../tokens-move/{}", req.module)),
            build_options,
        ).expect("building package must succeed");


        let metadata = package.extract_metadata().expect("extracting package metadata must succeed");
        let metadata_serialized = bcs::to_bytes(&metadata).expect("package metadata has BCS");
        let codes = package.extract_code();

        let seed_arg = MoveValue::Bytes(HexEncodedBytes(seed));
        let metadata_arg = MoveValue::Bytes(HexEncodedBytes(metadata_serialized));

        let mut codes_vec: Vec<MoveValue> = Vec::new();
        for code in codes {
            let val = MoveValue::Bytes(HexEncodedBytes(code));
            codes_vec.push(val);
        }
        let codes_arg = MoveValue::Vector(codes_vec);

        let result = TransactionPayload::EntryFunctionPayload(EntryFunctionPayload{
            function: EntryFunctionId::from_str("0x1::resource_account::create_resource_account_and_publish_package").unwrap(),
            type_arguments: vec![],
            arguments: vec![
                seed_arg.json().unwrap(), 
                metadata_arg.json().unwrap(), 
                codes_arg.json().unwrap()
            ],
        }); 
        Json(result)
    }
}

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    let api_service = OpenApiService::new(Api, "Aptos", "1.0").server("http://localhost:8889/api");
    let ui = api_service.swagger_ui();
    let app = Route::new()
        .nest("/api", api_service)
        .nest("/doc", ui)
        .nest("/", StaticFilesEndpoint::new("./web").show_files_listing().index_file("index.html"));

    poem::Server::new(TcpListener::bind("0.0.00:8889")).run_with_graceful_shutdown(
        app,
        async move {
            let _ = tokio::signal::ctrl_c().await;
        },
        Some(Duration::from_secs(5)),
    ).await
}