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
    Vault: "0x9ab2De34A33fB459b538c43f251eB825645e8595", ✅
    Router: "0x5F719c2F1095F7B9fc68a68e35B51194f4b6abe8", ✅
    VaultReader: "0x66eC8fc33A26feAEAe156afA3Cb46923651F6f0D", ✅
    Reader: "0x2eFEE1950ededC65De687b40Fd30a7B5f4544aBd", ✅
    GlpManager: "0xD152c7F25db7F4B95b7658323c5F33d176818EE4", ✅ 
    RewardRouter: "0x82147C5A7E850eA4E28155DF107F2590fD4ba327",
    GlpRewardRouter: "0xB70B91CE0771d3f4c81D87660f71Da31d48eB3B3",
    RewardReader: "0x04Fc11Bd28763872d143637a7c768bD96E44c1b6", ✅
    NATIVE_TOKEN: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    GLP: "0x01234181085565ed162a948b6a5e88758CD7c7b8", ✅
    GMX: "0x62edc0692BD897D2295872a9FFCac5425011c661", ✅
    ES_GMX: "0xFf1489227BbAAC61a9209A08929E4c2a526DdD17", ✅
    BN_GMX: "0x8087a341D32D445d9aC8aCc9c14F5781E04A26d2", ✅
    USDG: "0xc0253c3cC6aa5Ab407b5795a04c28fB063273894", ✅
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
import { ethers } from 'hardhat'
const { deployContract, sendTxn, writeTmpAddresses, callWithRetries, sleep, getFrameSigner } = require("./shared/helpers")
const { expandDecimals } = require("../test/shared/utilities")
const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./core/tokens')[network];
const gasLimit = 30000000
const gov = { address: "0x49B373D422BdA4C6BfCdd5eC1E48A9a26fdA2F8b" }
const { toUsd } = require("../test/shared/units")
const { errors } = require("../test/core/Vault/helpers")
const { AddressZero } = ethers.constants
const weth = { address: "0xC360D44d9021E0d9D2781a6c5c269D209F43dAa7" }
const wallet = { address: "0x5F799f365Fa8A2B60ac0429C48B153cA5a6f0Cf8" }
const bnAlp = { address: AddressZero }
const alp = { address: AddressZero }
const vestingDuration = 365 * 24 * 60 * 60

async function main() {
    const { nativeToken } = tokens
    const [deployer] = await ethers.getSigners()
    wallet.address = deployer.address

    // deployed addresses
    const addresses = {
        Vault: "",
        USDG: "",
        Reader: "",
        RewardReader: "",
        VaultReader: "",
        Router: "",
        VaultPriceFeed: "",
        GLP: "",
        ShortsTracker: "",
        GlpManager: "",
        VaultErrorController: "",
        VaultUtils: "",
        bnGMX: "",
        esGMX: "",
        GMX: "",
        sGMX: "",
        sGMXDistributor: "",
        sbfGMX: "",
        sbfGMXDistributor: "",
        RewardRouter: "",
        VesterGMX: "",
        VestedGLP: "",
    }

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

    // 13 - Bonus GMX --------------------------------------------------------------
    const bnGmx = await deployContract("MintableBaseToken", ["Bonus GMX", "bnGMX", 0]);
    addresses.bnGMX = bnGmx.address;
    await sleep(1)

    // 14 - EsGMX --------------------------------------------------------------------
    const esGmx = await deployContract("EsGMX", []);
    addresses.esGMX = esGmx.address;
    await sleep(1)

    // 15 - GMX --------------------------------------------------------------------
    const gmx = await deployContract("GMX", [])
    addresses.GMX = gmx.address
    await sleep(1)

    // 15 - RewardTracker ----------------------------------------------------------
    const stakedGmxTracker = await deployContract("RewardTracker", ["Staked GMX", "sGMX"])
    addresses.sGMX = stakedGmxTracker.address
    await sleep(1)

    // 15 - RewardTracker ----------------------------------------------------------
    const stakedGmxDistributor = await deployContract("RewardDistributor", [esGmx.address, stakedGmxTracker.address])
    addresses.sGMXDistributor = stakedGmxDistributor.address
    await sleep(1)
    await sendTxn(stakedGmxTracker.initialize([gmx.address, esGmx.address], stakedGmxDistributor.address), "stakedGmxTracker.initialize")
    await sleep(1)
    await sendTxn(stakedGmxDistributor.updateLastDistributionTime(), "stakedGmxDistributor.updateLastDistributionTime")
    await sleep(1)

    // 16 - Staked + Bonus GMX --------------------------------------------------------------------
    const bonusGmxTracker = await deployContract("RewardTracker", ["Staked + Bonus GMX", "sbGMX"])
    const bonusGmxDistributor = await deployContract("BonusDistributor", [bnGmx.address, bonusGmxTracker.address])
    await sendTxn(bonusGmxTracker.initialize([stakedGmxTracker.address], bonusGmxDistributor.address), "bonusGmxTracker.initialize")
    await sendTxn(bonusGmxDistributor.updateLastDistributionTime(), "bonusGmxDistributor.updateLastDistributionTime")

    // 17 - Staked + Bonus + Fee GMX --------------------------------------------------------------------
    const feeGmxTracker = await deployContract("RewardTracker", ["Staked + Bonus + Fee GMX", "sbfGMX"])
    addresses.sbfGMX = feeGmxTracker.address
    await sleep(1)
    const feeGmxDistributor = await deployContract("RewardDistributor", [weth.address, feeGmxTracker.address])
    addresses.sbfGMXDistributor = feeGmxDistributor.address
    await sleep(1)
    await sendTxn(feeGmxTracker.initialize([bonusGmxTracker.address, bnGmx.address], feeGmxDistributor.address), "feeGmxTracker.initialize")
    await sleep(1)
    await sendTxn(feeGmxDistributor.updateLastDistributionTime(), "feeGmxDistributor.updateLastDistributionTime")
    await sleep(1)

    const feeGlpTracker = { address: AddressZero }
    const stakedGlpTracker = { address: AddressZero }

    const stakedAlpTracker = { address: AddressZero }
    const bonusAlpTracker = { address: AddressZero }
    const feeAlpTracker = { address: AddressZero }

    await sendTxn(stakedGmxTracker.setInPrivateTransferMode(true), "stakedGmxTracker.setInPrivateTransferMode")
    await sleep(1)
    await sendTxn(stakedGmxTracker.setInPrivateStakingMode(true), "stakedGmxTracker.setInPrivateStakingMode")
    await sleep(1)
    await sendTxn(bonusGmxTracker.setInPrivateTransferMode(true), "bonusGmxTracker.setInPrivateTransferMode")
    await sleep(1)
    await sendTxn(bonusGmxTracker.setInPrivateStakingMode(true), "bonusGmxTracker.setInPrivateStakingMode")
    await sleep(1)
    await sendTxn(bonusGmxTracker.setInPrivateClaimingMode(true), "bonusGmxTracker.setInPrivateClaimingMode")
    await sleep(1)
    await sendTxn(feeGmxTracker.setInPrivateTransferMode(true), "feeGmxTracker.setInPrivateTransferMode")
    await sleep(1)
    await sendTxn(feeGmxTracker.setInPrivateStakingMode(true), "feeGmxTracker.setInPrivateStakingMode")
    await sleep(1)

    // 18 - Vester GMX -----------------------------------------------------------------
    const gmxVester = await deployContract("Vester", [
        "Vested GMX", // _name
        "vGMX", // _symbol
        vestingDuration, // _vestingDuration
        esGmx.address, // _esToken
        feeGmxTracker.address, // _pairToken
        gmx.address, // _claimableToken
        stakedGmxTracker.address, // _rewardTracker
    ])
    addresses.VesterGMX = gmxVester.address

    // 19 - Vester GLP --------------------------------------------------------------------
    const glpVested = await deployContract("Vester", [
        "Vested GLP", // _name
        "vGLP", // _symbol
        vestingDuration, // _vestingDuration
        esGmx.address, // _esToken
        stakedGlpTracker.address, // _pairToken
        gmx.address, // _claimableToken
        stakedGlpTracker.address, // _rewardTracker
    ])
    addresses.VestedGLP = gmxVester.address

    // 18 - RewardRouter --------------------------------------------------------------
    const rewardRouter = await deployContract("RewardRouterV2", [])
    addresses.RewardRouter = rewardRouter.address
    await sleep(1)
    await sendTxn(rewardRouter.initialize(
        nativeToken.address,
        gmx.address,
        esGmx.address,
        bnGmx.address,
        glp.address,
        stakedGmxTracker.address,
        bonusGmxTracker.address,
        feeGmxTracker.address,
        feeGlpTracker.address,
        stakedGlpTracker.address,
        glpManager.address,
        gmxVester.address,
        glpVested.address
    ), "rewardRouter.initialize")

    // allow rewardRouter to stake in stakedGmxTracker
    await sendTxn(stakedGmxTracker.setHandler(rewardRouter.address, true), "stakedGmxTracker.setHandler(rewardRouter)")
    await sleep(1)

    // allow bonusGmxTracker to stake stakedGmxTracker
    await sendTxn(stakedGmxTracker.setHandler(bonusGmxTracker.address, true), "stakedGmxTracker.setHandler(bonusGmxTracker)")
    await sleep(1)

    // allow rewardRouter to stake in bonusGmxTracker
    await sendTxn(bonusGmxTracker.setHandler(rewardRouter.address, true), "bonusGmxTracker.setHandler(rewardRouter)")
    await sleep(1)

    // allow bonusGmxTracker to stake feeGmxTracker
    await sendTxn(bonusGmxTracker.setHandler(feeGmxTracker.address, true), "bonusGmxTracker.setHandler(feeGmxTracker)")
    await sleep(1)

    await sendTxn(bonusGmxDistributor.setBonusMultiplier(10000), "bonusGmxDistributor.setBonusMultiplier")
    await sleep(1)

    // allow rewardRouter to stake in feeGmxTracker
    await sendTxn(feeGmxTracker.setHandler(rewardRouter.address, true), "feeGmxTracker.setHandler(rewardRouter)")
    await sleep(1)

    // allow stakedGmxTracker to stake esGmx
    await sendTxn(esGmx.setHandler(stakedGmxTracker.address, true), "esGmx.setHandler(stakedGmxTracker)")
    await sleep(1)

    // allow feeGmxTracker to stake bnGmx
    await sendTxn(bnGmx.setHandler(feeGmxTracker.address, true), "bnGmx.setHandler(feeGmxTracker")
    await sleep(1)

    // allow rewardRouter to burn bnGmx
    await sendTxn(bnGmx.setMinter(rewardRouter.address, true), "bnGmx.setMinter(rewardRouter")
    await sleep(1)

    // mint esGmx for distributors
    await sendTxn(esGmx.setMinter(wallet.address, true), "esGmx.setMinter(wallet)")
    await sleep(1)

    await sendTxn(esGmx.mint(stakedGmxDistributor.address, expandDecimals(50000 * 12, 18)), "esGmx.mint(stakedGmxDistributor") // ~50,000 GMX per month
    await sleep(1)

    await sendTxn(stakedGmxDistributor.setTokensPerInterval("20667989410000000"), "stakedGmxDistributor.setTokensPerInterval") // 0.02066798941 esGmx per second
    await sleep(1)

    // mint bnGmx for distributor
    await sendTxn(bnGmx.setMinter(wallet.address, true), "bnGmx.setMinter")
    await sleep(1)

    await sendTxn(bnGmx.mint(bonusGmxDistributor.address, expandDecimals(15 * 1000 * 1000, 18)), "bnGmx.mint(bonusGmxDistributor)")
    await sleep(1)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
