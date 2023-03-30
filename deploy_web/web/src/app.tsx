
import { createRoot } from 'react-dom/client';
import { StrictMode, useState } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AccordionDetails, Typography, AccordionSummary, Accordion, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, TextField, Stack } from '@mui/material';
import {Send, ExpandMore} from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import {HexString} from 'aptos'
import {NumericFormat} from 'react-number-format';

const NFT_DESCRIPTION = "PunkNinja is the first Web3 casual game platform of SakuraVerse. First 1000 limited PunkNinja will be launched, with 76% Normal,21% SR qualities, and 15% SSR qualities. With the NFT you can enjoy all the casual games on PunkNinja platform. Linktree :https://linktr.ee/sakuraverse"; 
const NFT_NAME = "PunkNinja"; 
const NFT_BASE_URI = "https://nft.punkninja.com/aptos/nft/"

const MODULES : {[key: string]: {[key: string]: string} } = {
    "Testnet": {
        "pnjt": "0xd84df0125baf77d07a4797086af1c83c7c68bebd2dafe9d01ff56b2bcd36ee70",
        "nft": "0x630888cd8af9c784549e7f04af68ee5ad5bfc6fdeb79cf1811f4389ab9a17aa2",
        "ppt": "0xae0930da2d89a88db1a7b29c31f7aa4c7aa4573559264b96237cacc4b7b4e2d7"
    },
    "Mainnet": {
        "pnjt": "0xd84df0125baf77d07a4797086af1c83c7c68bebd2dafe9d01ff56b2bcd36ee70",
        "nft": "0x630888cd8af9c784549e7f04af68ee5ad5bfc6fdeb79cf1811f4389ab9a17aa2",
        "ppt": "0xae0930da2d89a88db1a7b29c31f7aa4c7aa4573559264b96237cacc4b7b4e2d7"
    },
};

function Deployer() {
    const {
        account,
        network,
        connected,
        signAndSubmitTransaction,
    } = useWallet();

    const network_name = network && network.name ? network.name : "Testnet";

    const [module, setModule] = useState("nft");
    const [seed, setSeed] = useState("1001");
    const [loading, setLoading] = useState(false);
    

    const [mintReceiver, setMintReceiver] = useState("");
    const [mintAmount, setMintAmount] = useState("0");
    const [mintLoading, setMintLoading] = useState(false);
    const [mintType, setMintType] = useState("nft");
    const [mintModule, setMintModule] = useState(MODULES[network_name]["nft"]);
    const [minter, setMinter] = useState("");
    const [registerType, setRegisterType] = useState("pnjt");
    const [registerModule, setRegisterModule] = useState(MODULES[network_name]["pnjt"]);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [minterType, setMinterType] = useState("nft");
    const [minterModule, setMinterModule] = useState(MODULES[network_name]["nft"]);
    const [minterLoading, setMinterLoading] = useState(false);

    const handleModuleChange = (event: SelectChangeEvent) => {
        setModule(event.target.value as string);
    };
    const handleSeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSeed(event.target.value as string);
    };
    const handleMintReceiverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMintReceiver(event.target.value as string);
    };
    const handleMinterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMinter(event.target.value as string);
    };
    
    const handleMintAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMintAmount(event.target.value as string);
    };
    const handleMintTypeChange = (event: SelectChangeEvent) => {
        setMintType(event.target.value as string);
        setMintModule(MODULES[network.name][event.target.value as string]);
    };

    const handleRegisterTypeChange = (event: SelectChangeEvent) => {
        setRegisterType(event.target.value as string);
        setRegisterModule(MODULES[network.name][event.target.value as string]);
    };

    const handleMinterTypeChange = (event: SelectChangeEvent) => {
        setMinterType(event.target.value as string);
        setMinterModule(MODULES[network.name][event.target.value as string]);
    };

    const handleDeploy = async () => {
        setLoading(true);
        const jsonData = {
            "module": module,
            "wallet": account.address,
            "seed": seed,
        }
        const response = await fetch('/api/publish', { 
            method: 'POST', 
            mode: 'cors', 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(jsonData) 
        });

        const data = await response.json();
        const payload = {
            "arguments": [
                new HexString(data["arguments"][0]).toUint8Array(),
                new HexString(data["arguments"][1]).toUint8Array(),
                data["arguments"][2].map((e: string) => new HexString(e).toUint8Array()),
            ],
            "function": data["function"],
            "type": data["type"],
            "type_arguments": data["type_arguments"],
        }
        try{
            const result = await signAndSubmitTransaction(payload);
            console.log(result);
        }catch(err) {
            console.log(err);
        }
        setLoading(false);
    };

    const handleMint = async () => {
        setMintLoading(true);
        const payload = mintType == "nft"? {
            arguments: [
                mintReceiver,
                NFT_NAME +" #" + mintAmount,
                NFT_DESCRIPTION,
                NFT_BASE_URI + mintAmount,
            ],
            function: mintModule + "::" + mintType + "::mint_offer_token_script",
            type: "entry_function_payload",
            type_arguments: [] as string[],
        } : {
            arguments: [
                mintReceiver,
                mintAmount,
            ],
            function: mintModule + "::" + mintType + "::mint",
            type: "entry_function_payload",
            type_arguments: [] as string[],
        };
        try{
            const result = await signAndSubmitTransaction(payload);
            console.log(result);
        }catch(err) {
            console.log(err);
        }
        setMintLoading(false);
    }

    const handleRegister = async () => {
        setRegisterLoading(true);
        const payload = {
            arguments: [] as string[],
            function: registerModule + "::" + registerType + "::prepare_account_script",
            type: "entry_function_payload",
            type_arguments: [] as string[],
        };
        try{
            const result = await signAndSubmitTransaction(payload);
            console.log(result);
        }catch(err) {
            console.log(err);
        }
        setRegisterLoading(false);
    }

    const handleAddMinter = async () => {
        setMinterLoading(true);
        const payload = {
            arguments: [3 , minter],
            function: minterModule + "::" + minterType + "::add_role",
            type: "entry_function_payload",
            type_arguments: [] as string[],
        };
        try{
            const result = await signAndSubmitTransaction(payload);
            console.log(result);
        }catch(err) {
            console.log(err);
        }
        setMinterLoading(false);
    }

    const handleRemoveMinter = async () => {
        setMinterLoading(true);
        const payload = {
            arguments: [3, minter],
            function: minterModule + "::" + minterType + "::remove_role",
            type: "entry_function_payload",
            type_arguments: [] as string[],
        };
        try{
            const result = await signAndSubmitTransaction(payload);
            console.log(result);
        }catch(err) {
            console.log(err);
        }
        setMinterLoading(false);
    }

    if(!connected) {
        return (<WalletConnector />);
    }
    if(!network.name) {
        return (<WalletConnector />);
    }

    return (
    <Stack spacing={2}>
        <WalletConnector />
        <TextField id="network-name" label="网络名称" variant="standard" disabled={true} value={network.name}/>
        <TextField id="network-chainid" label="网络ID" variant="standard" disabled={true} value={network.chainId}/>
        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="deploy-content"
            id="deploy-header"
            >
            <Typography>部署合约</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    <InputLabel id="module-select-label">合约类型</InputLabel>
                    <FormControl fullWidth>
                        <Select
                            labelId="module-select-label"
                            id="module-select"
                            value={module}
                            label="合约类型"
                            onChange={handleModuleChange}
                        >
                            <MenuItem value={"nft"}>nft</MenuItem>
                            <MenuItem value={"pnjt"}>pnjt</MenuItem>
                            <MenuItem value={"ppt"}>ppt</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="seed-input" label="生成资源账户用种子" variant="outlined" value={seed} onChange={handleSeedChange} />
                    </FormControl>
                    <FormControl fullWidth>
                    <LoadingButton
                        loading={loading}
                        loadingPosition="start"
                        startIcon={<Send />}
                        variant="outlined"
                        onClick={handleDeploy}
                    >
                        部署
                    </LoadingButton>
                    </FormControl>
                </Stack>
            </AccordionDetails>
        </Accordion>
        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="mint-content"
            id="mint-header"
            >
            <Typography>铸造Coin或者NFT</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="mint-select-label">合约类型</InputLabel>
                        <Select
                            labelId="mint-select-label"
                            id="mint-select"
                            value={mintType}
                            label="合约类型"
                            onChange={handleMintTypeChange}
                        >
                            <MenuItem value={"nft"}>nft</MenuItem>
                            <MenuItem value={"pnjt"}>pnjt</MenuItem>
                            <MenuItem value={"ppt"}>ppt</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="mint-contract-input" label="合约资源地址" variant="outlined" value={mintModule} disabled={true} />
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="mint-receiver-input" label="接收账户地址" variant="outlined" value={mintReceiver}  onChange={handleMintReceiverChange}/>
                    </FormControl>
                    <FormControl fullWidth>
                        <NumericFormat customInput={TextField} id="mint-amount-input" label="Coin数量或NFT ID" variant="outlined" InputProps={{inputProps: {step: 1}}} decimalScale={0} allowNegative={false} thousandSeparator={false} value={mintAmount} autoComplete="off"  onChange={handleMintAmountChange} />
                    </FormControl>
                    <FormControl fullWidth>
                    <LoadingButton
                        loading={ mintLoading }
                        loadingPosition="start"
                        startIcon={<Send />}
                        variant="outlined"
                        onClick={handleMint}
                    >
                        铸造
                    </LoadingButton>
                    </FormControl>
                </Stack>
            </AccordionDetails>
        </Accordion>
        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="register-content"
            id="register-header"
            >
            <Typography>注册代币</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="register-select-label">合约类型</InputLabel>
                        <Select
                            labelId="register-select-label"
                            id="register-select"
                            value={registerType}
                            label="合约类型"
                            onChange={handleRegisterTypeChange}
                        >
                            <MenuItem value={"pnjt"}>pnjt</MenuItem>
                            <MenuItem value={"ppt"}>ppt</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="register-contract-input" label="合约资源地址" variant="outlined" value={registerModule} disabled={true} />
                    </FormControl>
                    <FormControl fullWidth>
                    <LoadingButton
                        loading={registerLoading }
                        loadingPosition="start"
                        startIcon={<Send />}
                        variant="outlined"
                        onClick={handleRegister}
                    >
                        注册
                    </LoadingButton>
                    </FormControl>
                </Stack>
            </AccordionDetails>
        </Accordion>

        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="minter-content"
            id="minter-header"
            >
            <Typography>授权铸造者</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="minter-select-label">合约类型</InputLabel>
                        <Select
                            labelId="minter-select-label"
                            id="minter-select"
                            value={minterType}
                            label="合约类型"
                            onChange={handleMinterTypeChange}
                        >
                            <MenuItem value={"nft"}>nft</MenuItem>
                            <MenuItem value={"pnjt"}>pnjt</MenuItem>
                            <MenuItem value={"ppt"}>ppt</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="minter-contract-input" label="合约资源地址" variant="outlined" value={minterModule} disabled={true} />
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="mint-receiver-input" label="授权铸造者地址" variant="outlined" value={minter}  onChange={handleMinterChange}/>
                    </FormControl>
                    <FormControl fullWidth>
                    <LoadingButton
                        loading={minterLoading }
                        loadingPosition="start"
                        startIcon={<Send />}
                        variant="outlined"
                        onClick={handleAddMinter}
                    >
                        添加铸造者权限
                    </LoadingButton>
                    </FormControl>
                    <FormControl fullWidth>
                    <LoadingButton
                        loading={minterLoading }
                        loadingPosition="start"
                        startIcon={<Send />}
                        variant="outlined"
                        onClick={handleRemoveMinter}
                    >
                        取消铸造者权限
                    </LoadingButton>
                    </FormControl>
                </Stack>
            </AccordionDetails>
        </Accordion>
    </Stack>
    )
}
function App() {
    const wallets = [new PetraWallet(), new MartianWallet(), new FewchaWallet(), new PontemWallet()];
    return (
        <StrictMode>
            <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
                <Deployer />
            </AptosWalletAdapterProvider>
        </StrictMode>
    )
}
const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<App/>);