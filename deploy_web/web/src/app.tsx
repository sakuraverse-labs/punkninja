
import { createRoot } from 'react-dom/client';
import { StrictMode, useState } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Box, AccordionDetails, Typography, AccordionSummary, Accordion, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, TextField, Stack } from '@mui/material';
import {Send, ExpandMore} from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import {HexString} from 'aptos'
import {NumericFormat} from 'react-number-format';

import { createTheme, ThemeProvider} from '@mui/material/styles';

const theme = createTheme({
    palette: {
      mode: 'dark',
    },
});

const NFT_DESCRIPTION = "PunkNinja is the first Web3 casual game platform of SakuraVerse. First 1000 limited PunkNinja will be launched, with 76% Normal,21% SR qualities, and 15% SSR qualities. With the NFT you can enjoy all the casual games on PunkNinja platform. Linktree :https://linktr.ee/sakuraverse"; 
const NFT_NAME = "PunkNinja"; 
const NFT_BASE_URI = "https://nft.punkninja.com/aptos/nft/"

const showLog = (item: any)  => {
    return(
        <Typography>{item}</Typography>
    );
}

function Deployer() {
    const {
        account,
        network,
        connected,
        signAndSubmitTransaction,
    } = useWallet();

    const [module, setModule] = useState("nft");
    const [seed, setSeed] = useState("1001");
    const [loading, setLoading] = useState(false);
    const [deployLog, setDeployLog] = useState([]);
    const [resource, setResource] = useState(""); 

    const [mintReceiver, setMintReceiver] = useState("");
    const [mintAmount, setMintAmount] = useState("0");
    const [mintLoading, setMintLoading] = useState(false);
    const [mintType, setMintType] = useState("nft");
    const [mintModule, setMintModule] = useState("");
    const [minter, setMinter] = useState("");
    const [registerType, setRegisterType] = useState("pnjt");
    const [registerModule, setRegisterModule] = useState("");
    const [registerLoading, setRegisterLoading] = useState(false);
    const [minterType, setMinterType] = useState("nft");
    const [minterModule, setMinterModule] = useState("");
    const [minterLoading, setMinterLoading] = useState(false);

    const handleModuleChange = (event: SelectChangeEvent) => {
        setModule(event.target.value as string);
    };
    const handleSeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSeed(event.target.value as string);
    };

    const handleResourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setResource(event.target.value as string);
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
    };

    const handleRegisterTypeChange = (event: SelectChangeEvent) => {
        setRegisterType(event.target.value as string);
    };

    const handleMinterTypeChange = (event: SelectChangeEvent) => {
        setMinterType(event.target.value as string);
    };

    const handleMintModuleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMintModule(event.target.value as string);
    };

    const handleRegisterModuleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterModule(event.target.value as string);
    };

    const handleMinterModuleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMinterModule(event.target.value as string);
    };

    const handleDeploy = async () => {
        setLoading(true);
        let logs = deployLog;
        logs = [...logs, "Start compile contract code of " + module];
        setDeployLog(logs);
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
        logs = [...logs, "Start deploy contract and create resource account [" + data["arguments"][3] + "]"];
        setDeployLog(logs);
        const payload = {
            "arguments": [
                new HexString(data["arguments"][0]).toUint8Array(),
                new HexString(data["arguments"][1]).toUint8Array(),
                data["arguments"][2].map((e: string) => Array.from(new HexString(e).toUint8Array())),
            ],
            "function": data["function"],
            "type": data["type"],
            "type_arguments": data["type_arguments"],
        }
        try{
            const result = await signAndSubmitTransaction(payload);
            logs = [...logs, "Deploy success: " + result.hash];
            setDeployLog(logs);
        }catch(err) {
            logs = [...logs, "Deploy failed"];
            setDeployLog(logs);
        }
        setLoading(false);
    };

    const handleUpgrade = async () => {
        setLoading(true);
        let logs = deployLog;
        logs = [...logs, "Start compile contract code of " + module];
        setDeployLog(logs);
        const jsonData = {
            "module": module,
            "wallet": account.address,
            "resource": resource,
        }
        const response = await fetch('/api/upgrade', { 
            method: 'POST', 
            mode: 'cors', 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(jsonData) 
        });
        const data = await response.json();
        logs = [...logs, "Start re-deploy contract [" + resource + "]"];
        setDeployLog(logs);
        const payload = {
            "arguments": [
                new HexString(data["arguments"][0]).toUint8Array(),
                data["arguments"][1].map((e: string) => Array.from(new HexString(e).toUint8Array()))
            ],
            "function": data["function"],
            "type": data["type"],
            "type_arguments": data["type_arguments"],
        }
        try{
            const result = await signAndSubmitTransaction(payload);
            logs = [...logs, "Deploy success: " + result.hash];
            setDeployLog(logs);
        }catch(err) {
            logs = [...logs, "Deploy failed"];
            setDeployLog(logs);
        }
        setLoading(false);
    };

    const handleMint = async () => {
        setMintLoading(true);
        let logs = [...deployLog, "Mint " + mintType + " " + mintAmount + "to [" + mintReceiver +"]"];
        setDeployLog(logs);
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
            logs = [...logs, "Mint success: " + result.hash];
            setDeployLog(logs);
        }catch(err) {
            logs = [...logs, "Mint failed"];
            setDeployLog(logs);
        }
        setMintLoading(false);
    }

    const handleRegister = async () => {
        setRegisterLoading(true);
        let logs = [...deployLog, "Register coin resource to account [" + account.address +"]"];
        setDeployLog(logs);
        const payload = {
            arguments: [] as string[],
            function: registerModule + "::" + registerType + "::prepare_account_script",
            type: "entry_function_payload",
            type_arguments: [] as string[],
        };
        try{
            const result = await signAndSubmitTransaction(payload);
            logs = [...logs, "Register success:" + result.hash];
            setDeployLog(logs);
        }catch(err) {
            logs = [...logs, "Register failed"];
            setDeployLog(logs);
        }
        setRegisterLoading(false);
    }

    const handleAddMinter = async () => {
        setMinterLoading(true);
        let logs = [...deployLog, "Authorize minter role to account [" + minter +"]"];
        setDeployLog(logs);
        const payload = {
            arguments: [3 , minter],
            function: minterModule + "::" + minterType + "::add_role",
            type: "entry_function_payload",
            type_arguments: [] as string[],
        };
        try{
            const result = await signAndSubmitTransaction(payload);
            logs = [...logs, "Authorize success:" + result.hash];
            setDeployLog(logs);
        }catch(err) {
            logs = [...logs, "Authorize failed"];
            setDeployLog(logs);
        }
        setMinterLoading(false);
    }

    const handleRemoveMinter = async () => {
        setMinterLoading(true);
        let logs = [...deployLog, "Revoke minter role of account[" + minter +"]"];
        setDeployLog(logs);
        const payload = {
            arguments: [3, minter],
            function: minterModule + "::" + minterType + "::remove_role",
            type: "entry_function_payload",
            type_arguments: [] as string[],
        };
        try{
            const result = await signAndSubmitTransaction(payload);
            logs = [...logs, "Revoke success:" + result.hash];
            setDeployLog(logs);
        }catch(err) {
            logs = [...logs, "Revoke failed"];
            setDeployLog(logs);
        }
        
        setMinterLoading(false);
    }

    if(!connected) {
        return (<Stack spacing={2}><WalletConnector /></Stack>);
    }
    if(!network.name) {
        return (<Stack spacing={2}><WalletConnector /></Stack>);
    }

    return (
    <Box sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        borderRadius: 6,
      }}>
        <Stack>
            <FormControl fullWidth>
                <WalletConnector />
            </FormControl>
            <FormControl fullWidth>
                <TextField id="network-name" label="Network" variant="standard" disabled={true} value={network.name}/>
            </FormControl>
        </Stack>
        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="deploy-content"
            id="deploy-header"
            >
            <Typography>Deploy Contract</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="module-select-label">Contract Type</InputLabel>
                        <Select
                            labelId="module-select-label"
                            id="module-select"
                            value={module}
                            label="Contract Type"
                            onChange={handleModuleChange}
                        >
                            <MenuItem value={"nft"}>nft</MenuItem>
                            <MenuItem value={"pnjt"}>pnjt</MenuItem>
                            <MenuItem value={"ppt"}>ppt</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="seed-input" label="Seed Of Resource Account" variant="outlined" value={seed} onChange={handleSeedChange} />
                    </FormControl>
                    <FormControl fullWidth>
                    <LoadingButton
                        loading={loading}
                        loadingPosition="start"
                        startIcon={<Send />}
                        variant="outlined"
                        onClick={handleDeploy}
                    >
                        DEPLOY
                    </LoadingButton>
                    </FormControl>
                </Stack>
            </AccordionDetails>
        </Accordion>
        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="upgrade-content"
            id="upgrade-header"
            >
            <Typography>Upgrade Contract</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="module-select-label">Contract Type</InputLabel>
                        <Select
                            labelId="module-select-label"
                            id="module-select"
                            value={module}
                            label="Contract Type"
                            onChange={handleModuleChange}
                        >
                            <MenuItem value={"nft"}>nft</MenuItem>
                            <MenuItem value={"pnjt"}>pnjt</MenuItem>
                            <MenuItem value={"ppt"}>ppt</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="address-input" label="Address Of Resource Account" variant="outlined" value={resource} onChange={handleResourceChange}  />
                    </FormControl>
                    <FormControl fullWidth>
                    <LoadingButton
                        loading={loading}
                        loadingPosition="start"
                        startIcon={<Send />}
                        variant="outlined"
                        onClick={handleUpgrade}
                    >
                        UPGRADE
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
            <Typography>Mint Coin Or NFT</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="mint-select-label">Contract Type</InputLabel>
                        <Select
                            labelId="mint-select-label"
                            id="mint-select"
                            value={mintType}
                            label="Contract Type"
                            onChange={handleMintTypeChange}
                        >
                            <MenuItem value={"nft"}>nft</MenuItem>
                            <MenuItem value={"pnjt"}>pnjt</MenuItem>
                            <MenuItem value={"ppt"}>ppt</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="mint-contract-input" label="Resource Account" variant="outlined" value={mintModule} onChange={handleMintModuleChange}/>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="mint-receiver-input" label="Receiver Account" variant="outlined" value={mintReceiver}  onChange={handleMintReceiverChange}/>
                    </FormControl>
                    <FormControl fullWidth>
                        <NumericFormat customInput={TextField} id="mint-amount-input" label="Coin Amount Or NFT Id" variant="outlined" InputProps={{inputProps: {step: 1}}} decimalScale={0} allowNegative={false} thousandSeparator={false} value={mintAmount} autoComplete="off"  onChange={handleMintAmountChange} />
                    </FormControl>
                    <FormControl fullWidth>
                    <LoadingButton
                        loading={ mintLoading }
                        loadingPosition="start"
                        startIcon={<Send />}
                        variant="outlined"
                        onClick={handleMint}
                    >
                        MINT
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
            <Typography>Register Coin</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="register-select-label">Contract Type</InputLabel>
                        <Select
                            labelId="register-select-label"
                            id="register-select"
                            value={registerType}
                            label="Contract Type"
                            onChange={handleRegisterTypeChange}
                        >
                            <MenuItem value={"pnjt"}>pnjt</MenuItem>
                            <MenuItem value={"ppt"}>ppt</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="register-contract-input" label="Resource Account" variant="outlined" value={registerModule} onChange={handleRegisterModuleChange} />
                    </FormControl>
                    <FormControl fullWidth>
                    <LoadingButton
                        loading={registerLoading }
                        loadingPosition="start"
                        startIcon={<Send />}
                        variant="outlined"
                        onClick={handleRegister}
                    >
                        REGISTER COIN
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
            <Typography>Minter Authorization</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="minter-select-label">Contract Type</InputLabel>
                        <Select
                            labelId="minter-select-label"
                            id="minter-select"
                            value={minterType}
                            label="Contract Type"
                            onChange={handleMinterTypeChange}
                        >
                            <MenuItem value={"nft"}>nft</MenuItem>
                            <MenuItem value={"pnjt"}>pnjt</MenuItem>
                            <MenuItem value={"ppt"}>ppt</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="minter-contract-input" label="Resource Account" variant="outlined" value={minterModule} onChange={handleMinterModuleChange} />
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField id="mint-receiver-input" label="Minter Account" variant="outlined" value={minter}  onChange={handleMinterChange}/>
                    </FormControl>
                    <FormControl fullWidth>
                    <LoadingButton
                        loading={minterLoading }
                        loadingPosition="start"
                        startIcon={<Send />}
                        variant="outlined"
                        onClick={handleAddMinter}
                    >
                        AUTHORIZE
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
                        REVOKE AUTHORIZATION
                    </LoadingButton>
                    </FormControl>
                </Stack>
            </AccordionDetails>
        </Accordion>
        <Stack spacing={1}>
        {
           deployLog.map((log, i) => showLog(log))
        }
        </Stack>
    </Box>
    )
}
function App() {
    const wallets = [new PetraWallet(), new MartianWallet(), new FewchaWallet(), new PontemWallet()];
    return (
        <StrictMode>
            <ThemeProvider theme={theme}>
                <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
                    <Deployer />
                </AptosWalletAdapterProvider>
            </ThemeProvider>
        </StrictMode>
    )
}
const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<App/>);