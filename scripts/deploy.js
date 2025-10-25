const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Déploiement du système ZK-Payroll...\n");

  // Obtenir le déployeur
  const [deployer] = await ethers.getSigners();
  console.log("📍 Déploiement avec le compte:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Solde du compte:", ethers.formatEther(balance), "ETH\n");

  // 1. Déployer le token confidentiel
  console.log("📦 Déploiement du ConfidentialERC20...");
  const ConfidentialERC20 = await ethers.getContractFactory("ConfidentialERC20");
  const token = await ConfidentialERC20.deploy(
    "Confidential USDC",
    "cUSDC",
    6
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ ConfidentialERC20 déployé à:", tokenAddress);

  // 2. Déployer le contrat de paie
  console.log("\n📦 Déploiement du ZKPayroll...");
  const ZKPayroll = await ethers.getContractFactory("ZKPayroll");
  const payroll = await ZKPayroll.deploy();
  await payroll.waitForDeployment();
  const payrollAddress = await payroll.getAddress();
  console.log("✅ ZKPayroll déployé à:", payrollAddress);

  // 3. Sauvegarder les adresses
  const fs = require("fs");
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ConfidentialERC20: {
        address: tokenAddress,
        name: "Confidential USDC",
        symbol: "cUSDC",
        decimals: 6
      },
      ZKPayroll: {
        address: payrollAddress,
        employer: deployer.address
      }
    }
  };

  const deploymentsPath = "./deployments";
  if (!fs.existsSync(deploymentsPath)) {
    fs.mkdirSync(deploymentsPath, { recursive: true });
  }

  const filename = `${deploymentsPath}/deployment-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Informations de déploiement sauvegardées dans:", filename);

  // 4. Vérifier les déploiements
  console.log("\n🔍 Vérification des contrats...");
  const employerAddress = await payroll.employer();
  console.log("👔 Employeur:", employerAddress);
  
  const tokenName = await token.name();
  const tokenSymbol = await token.symbol();
  console.log("🪙  Token:", tokenName, "(", tokenSymbol, ")");

  console.log("\n✨ Déploiement terminé avec succès!");
  console.log("\n📋 Résumé:");
  console.log("   Token:", tokenAddress);
  console.log("   Payroll:", payrollAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
