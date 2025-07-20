import { ethers } from "ethers"

const PEPU_V2_RPC = "https://rpc-pepu-v2-mainnet-0.t.conduit.xyz/"
const PEPU_ERC20_CONTRACT_ADDRESS = "0x93aA0ccD1e5628d3A841C4DbdF602D9eb04085d6" // Endereço do contrato PEPU ERC-20
const USDC_CONTRACT_ADDRESS = "0x7f56b07700109016870601719048c10702527060" // Endereço do contrato USDC na rede PEPU V2

// ABI mínima para obter o preço de um par Uniswap V2
const UNISWAP_V2_PAIR_ABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
]

// Endereço do par PEPU/USDC na Uniswap V2 (ou equivalente na rede PEPU V2)
// Este endereço precisa ser encontrado na rede PEPU V2 para o par PEPU-ERC20/USDC
// Exemplo: Se o par fosse 0x... (substitua pelo endereço real do par na PEPU V2)
const PEPU_USDC_PAIR_ADDRESS = "0x7f56b07700109016870601719048c10702527060" // Este é um placeholder, você precisará do endereço real do par

export async function fetchPepuErc20Price(): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(PEPU_V2_RPC)
    const pairContract = new ethers.Contract(PEPU_USDC_PAIR_ADDRESS, UNISWAP_V2_PAIR_ABI, provider)

    const token0Address = await pairContract.token0()
    const token1Address = await pairContract.token1()
    const reserves = await pairContract.getReserves()

    let pepuReserve: bigint
    let usdcReserve: bigint

    // Determinar qual reserva pertence ao PEPU e qual ao USDC
    if (token0Address.toLowerCase() === PEPU_ERC20_CONTRACT_ADDRESS.toLowerCase()) {
      pepuReserve = reserves.reserve0
      usdcReserve = reserves.reserve1
    } else if (token1Address.toLowerCase() === PEPU_ERC20_CONTRACT_ADDRESS.toLowerCase()) {
      pepuReserve = reserves.reserve1
      usdcReserve = reserves.reserve0
    } else {
      console.error("❌ PEPU ERC-20 ou USDC não encontrado no par Uniswap V2.")
      return 0 // Retorna 0 se os tokens esperados não estiverem no par
    }

    // Assumindo que USDC tem 6 decimais (padrão para USDC)
    // PEPU ERC-20 tem 18 decimais
    const usdcDecimals = 6
    const pepuDecimals = 18

    const usdcAmount = Number.parseFloat(ethers.formatUnits(usdcReserve, usdcDecimals))
    const pepuAmount = Number.parseFloat(ethers.formatUnits(pepuReserve, pepuDecimals))

    if (pepuAmount === 0) {
      console.warn("⚠️ Reserva de PEPU é zero, não é possível calcular o preço.")
      return 0
    }

    const pricePerPepu = usdcAmount / pepuAmount
    console.log(`✅ Preço PEPU ERC-20: ${pricePerPepu} USDC`)
    return pricePerPepu
  } catch (error) {
    console.error("❌ Erro ao buscar preço do PEPU ERC-20:", error)
    return 0 // Retorna 0 em caso de erro
  }
}
