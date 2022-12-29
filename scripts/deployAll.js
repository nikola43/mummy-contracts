/*

Vault:
Router:
VaultReader:
Reader:
GlpManager:
RewardRouter:
RewardReader:
NATIVE_TOKEN:
GLP:
GMX:
ES_GMX:
BN_GMX:
USDG:
ES_GMX_IOU:
StakedGmxTracker:
BonusGmxTracker:
FeeGmxTracker:
StakedGlpTracker:
FeeGlpTracker:
StakedGmxDistributor:
StakedGlpDistributor:
GmxVester:
GlpVester:
OrderBook:
OrderExecutor:
OrderBookReader:
PositionRouter:
PositionManager:
UniswapGmxEthPool:
ReferralStorage:
ReferralReader:
NFTClub:
MummyClubSale:
Multicall:
MummyClubStaking:
LiquidityLocker:

    // avalanche
    Vault: "0x9ab2De34A33fB459b538c43f251eB825645e8595",
    Router: "0x5F719c2F1095F7B9fc68a68e35B51194f4b6abe8",
    VaultReader: "0x66eC8fc33A26feAEAe156afA3Cb46923651F6f0D",
    Reader: "0x2eFEE1950ededC65De687b40Fd30a7B5f4544aBd",
    GlpManager: "0xD152c7F25db7F4B95b7658323c5F33d176818EE4",
    RewardRouter: "0x82147C5A7E850eA4E28155DF107F2590fD4ba327",
    GlpRewardRouter: "0xB70B91CE0771d3f4c81D87660f71Da31d48eB3B3",
    RewardReader: "0x04Fc11Bd28763872d143637a7c768bD96E44c1b6",
    NATIVE_TOKEN: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    GLP: "0x01234181085565ed162a948b6a5e88758CD7c7b8",
    GMX: "0x62edc0692BD897D2295872a9FFCac5425011c661",
    ES_GMX: "0xFf1489227BbAAC61a9209A08929E4c2a526DdD17",
    BN_GMX: "0x8087a341D32D445d9aC8aCc9c14F5781E04A26d2",
    USDG: "0xc0253c3cC6aa5Ab407b5795a04c28fB063273894",
    ES_GMX_IOU: "0x6260101218eC4cCfFF1b778936C6f2400f95A954", // placeholder address

    StakedGmxTracker: "0x2bD10f8E93B3669b6d42E74eEedC65dd1B0a1342",
    BonusGmxTracker: "0x908C4D94D34924765f1eDc22A1DD098397c59dD4",
    FeeGmxTracker: "0x4d268a7d4C16ceB5a606c173Bd974984343fea13",
    StakedGlpTracker: "0x9e295B5B976a184B14aD8cd72413aD846C299660",
    FeeGlpTracker: "0xd2D1162512F927a7e282Ef43a362659E4F2a728F",

    StakedGmxDistributor: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    StakedGlpDistributor: "0xDd593Cf40734199afc9207eBe9ffF23dA4Bf7720",

    GmxVester: "0x472361d3cA5F49c8E633FB50385BfaD1e018b445",
    GlpVester: "0x62331A7Bd1dfB3A7642B7db50B5509E57CA3154A",

    OrderBook: "0x4296e307f108B2f583FF2F7B7270ee7831574Ae5",
    OrderExecutor: "0x4296e307f108B2f583FF2F7B7270ee7831574Ae5",
    OrderBookReader: "0xccFE3E576f8145403d3ce8f3c2f6519Dae40683B",

    PositionRouter: "0xffF6D276Bc37c61A23f06410Dce4A400f66420f8",
    PositionManager: "0xA21B83E579f4315951bA658654c371520BDcB866",

    TraderJoeGmxAvaxPool: "0x0c91a070f862666bbcce281346be45766d874d98",
    ReferralStorage: "0x827ed045002ecdabeb6e2b0d1604cf5fc3d322f8",
    ReferralReader: "0x505Ce16D3017be7D76a7C2631C0590E71A975083",

    Multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",


*/

const { deployContract, sendTxn, writeTmpAddresses, callWithRetries, sleep } = require("./shared/helpers")
const { expandDecimals } = require("../test/shared/utilities")
const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./core/tokens')[network];
const gasLimit = 30000000
const gov = { address: "0x49B373D422BdA4C6BfCdd5eC1E48A9a26fdA2F8b" }
const { toUsd } = require("../test/shared/units")
const { errors } = require("../test/core/Vault/helpers")

async function main() {
    const { nativeToken } = tokens

    // deployed addresses
    const addresses = {}

    // 1 - Reader ------------------------------------------------------------------
    const reader = await deployContract("Reader", [], "Reader")
    if (network === "ftm") {
        await sendTxn(reader.setConfig(true), "Reader.setConfig")
    }
    addresses.Reader = reader.address
    await sleep(1)

    // 2 - RewardReader ------------------------------------------------------------
    const rewardReader = await deployContract("RewardReader", [], "RewardReader")
    addresses.RewardReader = rewardReader.address
    await sleep(1)

    // 3 - VaultReader -------------------------------------------------------------
    const vaultReader = await deployContract("VaultReader", [], "VaultReader")
    addresses.VaultReader = vaultReader.address
    await sleep(1)

    // 4 - Vault --------------------------------------------------------------------
    const vault = await deployContract("Vault", [])
    addresses.Vault = vault.address
    await sleep(1)

    // 5 - USDG --------------------------------------------------------------------
    const usdg = await deployContract("USDG", [vault.address])
    addresses.USDG = usdg.address
    await sleep(1)

    // 6 - Router ------------------------------------------------------------------
    const router = await deployContract("Router", [vault.address, usdg.address, nativeToken.address])
    addresses.Router = router.address
    await sleep(1)

    // 7 - VaultPriceFeed ----------------------------------------------------------
    const vaultPriceFeed = await deployContract("VaultPriceFeed", [])
    addresses.VaultPriceFeed = vaultPriceFeed.address
    await sleep(1)

    await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation") // 0.05 USD
    await sleep(1)
    await sendTxn(vaultPriceFeed.setPriceSampleSpace(1), "vaultPriceFeed.setPriceSampleSpace")
    await sleep(1)
    await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), "vaultPriceFeed.setIsAmmEnabled")
    await sleep(1)

    // 8 - GLP
    const glp = await deployContract("GLP", [])
    addresses.GLP = glp.address
    await sleep(1)
    await sendTxn(glp.setInPrivateTransferMode(true), "glp.setInPrivateTransferMode")
    await sleep(1)

    // 9 - ShortsTracker -----------------------------------------------------------
    const shortsTracker = await deployContract("ShortsTracker", [vault.address], "ShortsTracker", { gasLimit })
    addresses.ShortsTracker = shortsTracker.address
    await sendTxn(shortsTracker.setGov(gov.address), "shortsTracker.setGov")

    // 10 - GlpManager --------------------------------------------------------------
    const glpManager = await deployContract("GlpManager", [vault.address, usdg.address, glp.address, shortsTracker.address, 15 * 60])
    addresses.GlpManager = glpManager.address
    await sleep(1)
    await sendTxn(glpManager.setInPrivateMode(true), "glpManager.setInPrivateMode")
    await sleep(1)
    await sendTxn(glp.setMinter(glpManager.address, true), "glp.setMinter")
    await sleep(1)
    await sendTxn(usdg.addVault(glpManager.address), "usdg.addVault(glpManager)")
    await sleep(1)

    await sendTxn(vault.initialize(
        router.address, // router
        usdg.address, // usdg
        vaultPriceFeed.address, // priceFeed
        toUsd(2), // liquidationFeeUsd
        100, // fundingRateFactor
        100 // stableFundingRateFactor
    ), "vault.initialize")
    await sleep(1)

    await sendTxn(vault.setFundingRate(60 * 60, 100, 100), "vault.setFundingRate")
    await sleep(1)
    await sendTxn(vault.setInManagerMode(true), "vault.setInManagerMode")
    await sleep(1)
    await sendTxn(vault.setManager(glpManager.address, true), "vault.setManager")
    await sleep(1)

    await sendTxn(vault.setFees(
        10, // _taxBasisPoints
        5, // _stableTaxBasisPoints
        20, // _mintBurnFeeBasisPoints
        20, // _swapFeeBasisPoints
        1, // _stableSwapFeeBasisPoints
        10, // _marginFeeBasisPoints
        toUsd(2), // _liquidationFeeUsd
        24 * 60 * 60, // _minProfitTime
        true // _hasDynamicFees
    ), "vault.setFees")
    await sleep(1)

    // 11 - VaultErrorController ---------------------------------------------------
    const vaultErrorController = await deployContract("VaultErrorController", [])
    addresses.VaultErrorController = vaultErrorController.address
    await sleep(1)
    await sendTxn(vault.setErrorController(vaultErrorController.address), "vault.setErrorController")
    await sleep(1)
    await sendTxn(vaultErrorController.setErrors(vault.address, errors), "vaultErrorController.setErrors")
    await sleep(1)

    // 12 - VaultUtils -------------------------------------------------------------
    const vaultUtils = await deployContract("VaultUtils", [vault.address])
    addresses.VaultUtils = vaultUtils.address
    await sleep(1)
    await sendTxn(vault.setVaultUtils(vaultUtils.address), "vault.setVaultUtils")
    await sleep(1)
    writeTmpAddresses(addresses)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
