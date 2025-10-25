const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ZKPayroll", function () {
  let payroll;
  let token;
  let employer;
  let employee1;
  let employee2;
  let employee3;

  beforeEach(async function () {
    // Obtenir les signers
    [employer, employee1, employee2, employee3] = await ethers.getSigners();

    // Déployer le token confidentiel
    const ConfidentialERC20 = await ethers.getContractFactory("ConfidentialERC20");
    token = await ConfidentialERC20.deploy("Confidential USDC", "cUSDC", 6);
    await token.waitForDeployment();

    // Déployer le contrat de paie
    const ZKPayroll = await ethers.getContractFactory("ZKPayroll");
    payroll = await ZKPayroll.deploy();
    await payroll.waitForDeployment();
  });

  describe("Déploiement", function () {
    it("Devrait définir le bon employeur", async function () {
      expect(await payroll.employer()).to.equal(employer.address);
    });

    it("Devrait avoir 0 employé au départ", async function () {
      expect(await payroll.getActiveEmployeeCount()).to.equal(0);
    });
  });

  describe("Gestion des employés", function () {
    it("Devrait permettre à l'employeur d'ajouter un employé", async function () {
      // Note: Dans un vrai test FHE, il faudrait chiffrer les valeurs
      // Ici, on simule avec des valeurs en clair converties
      
      const grossSalary = ethers.parseUnits("5000", 6); // 5000 USDC
      const taxRate = 2500; // 25%

      // Simuler l'ajout (en production, utiliser le SDK FHE pour chiffrer)
      await expect(
        payroll.addEmployee(
          employee1.address,
          grossSalary, // Simulé comme einput
          "0x", // Proof simulé
          taxRate,
          "0x"
        )
      ).to.emit(payroll, "EmployeeAdded")
        .withArgs(employee1.address, await time.latest());

      expect(await payroll.getActiveEmployeeCount()).to.equal(1);
    });

    it("Ne devrait pas permettre à un non-employeur d'ajouter un employé", async function () {
      const grossSalary = ethers.parseUnits("5000", 6);
      const taxRate = 2500;

      await expect(
        payroll.connect(employee1).addEmployee(
          employee2.address,
          grossSalary,
          "0x",
          taxRate,
          "0x"
        )
      ).to.be.revertedWith("Only employer can call this function");
    });

    it("Ne devrait pas permettre d'ajouter le même employé deux fois", async function () {
      const grossSalary = ethers.parseUnits("5000", 6);
      const taxRate = 2500;

      await payroll.addEmployee(
        employee1.address,
        grossSalary,
        "0x",
        taxRate,
        "0x"
      );

      await expect(
        payroll.addEmployee(
          employee1.address,
          grossSalary,
          "0x",
          taxRate,
          "0x"
        )
      ).to.be.revertedWith("Employee already exists");
    });

    it("Devrait permettre de désactiver un employé", async function () {
      const grossSalary = ethers.parseUnits("5000", 6);
      const taxRate = 2500;

      await payroll.addEmployee(
        employee1.address,
        grossSalary,
        "0x",
        taxRate,
        "0x"
      );

      await expect(
        payroll.removeEmployee(employee1.address)
      ).to.emit(payroll, "EmployeeRemoved")
        .withArgs(employee1.address);

      const info = await payroll.getEmployeeInfo(employee1.address);
      expect(info.isActive).to.be.false;
    });
  });

  describe("Mise à jour des salaires", function () {
    beforeEach(async function () {
      const grossSalary = ethers.parseUnits("5000", 6);
      const taxRate = 2500;

      await payroll.addEmployee(
        employee1.address,
        grossSalary,
        "0x",
        taxRate,
        "0x"
      );
    });

    it("Devrait permettre à l'employeur de mettre à jour un salaire", async function () {
      const newGrossSalary = ethers.parseUnits("6000", 6);
      const newTaxRate = 3000; // 30%

      await expect(
        payroll.updateSalary(
          employee1.address,
          newGrossSalary,
          "0x",
          newTaxRate,
          "0x"
        )
      ).to.emit(payroll, "SalaryUpdated")
        .withArgs(employee1.address);
    });

    it("Ne devrait pas permettre à un non-employeur de mettre à jour un salaire", async function () {
      const newGrossSalary = ethers.parseUnits("6000", 6);
      const newTaxRate = 3000;

      await expect(
        payroll.connect(employee1).updateSalary(
          employee1.address,
          newGrossSalary,
          "0x",
          newTaxRate,
          "0x"
        )
      ).to.be.revertedWith("Only employer can call this function");
    });
  });

  describe("Traitement de la paie", function () {
    beforeEach(async function () {
      // Ajouter plusieurs employés
      const grossSalary1 = ethers.parseUnits("5000", 6);
      const grossSalary2 = ethers.parseUnits("7000", 6);
      const taxRate = 2500; // 25%

      await payroll.addEmployee(employee1.address, grossSalary1, "0x", taxRate, "0x");
      await payroll.addEmployee(employee2.address, grossSalary2, "0x", taxRate, "0x");

      // Déposer des fonds
      const totalFunds = ethers.parseUnits("20000", 6);
      await payroll.depositFunds(totalFunds, "0x");
    });

    it("Devrait traiter la paie pour tous les employés actifs", async function () {
      await expect(payroll.processPayroll())
        .to.emit(payroll, "PayrollProcessed");

      expect(await payroll.getActiveEmployeeCount()).to.equal(2);
    });

    it("Devrait émettre des événements SalaryPaid pour chaque employé", async function () {
      const tx = await payroll.processPayroll();
      const receipt = await tx.wait();

      // Vérifier que des événements SalaryPaid ont été émis
      const salaryPaidEvents = receipt.logs.filter(
        log => log.fragment && log.fragment.name === "SalaryPaid"
      );

      expect(salaryPaidEvents.length).to.be.greaterThan(0);
    });

    it("Ne devrait pas permettre à un non-employeur de traiter la paie", async function () {
      await expect(
        payroll.connect(employee1).processPayroll()
      ).to.be.revertedWith("Only employer can call this function");
    });
  });

  describe("Retrait de solde", function () {
    beforeEach(async function () {
      const grossSalary = ethers.parseUnits("5000", 6);
      const taxRate = 2500;

      await payroll.addEmployee(employee1.address, grossSalary, "0x", taxRate, "0x");

      const totalFunds = ethers.parseUnits("10000", 6);
      await payroll.depositFunds(totalFunds, "0x");

      await payroll.processPayroll();
    });

    it("Devrait permettre à un employé de retirer son solde", async function () {
      await expect(
        payroll.connect(employee1).withdrawBalance()
      ).to.emit(payroll, "BalanceWithdrawn")
        .withArgs(employee1.address, await time.latest());
    });

    it("Ne devrait pas permettre à un non-employé de retirer", async function () {
      await expect(
        payroll.connect(employee3).withdrawBalance()
      ).to.be.revertedWith("Not an active employee");
    });
  });

  describe("Informations et permissions", function () {
    beforeEach(async function () {
      const grossSalary = ethers.parseUnits("5000", 6);
      const taxRate = 2500;

      await payroll.addEmployee(employee1.address, grossSalary, "0x", taxRate, "0x");
    });

    it("Devrait retourner les informations correctes d'un employé", async function () {
      const info = await payroll.getEmployeeInfo(employee1.address);
      
      expect(info.isActive).to.be.true;
      expect(info.hireDate).to.be.greaterThan(0);
    });

    it("Devrait retourner la liste des adresses des employés", async function () {
      const addresses = await payroll.getEmployeeAddresses();
      
      expect(addresses.length).to.equal(1);
      expect(addresses[0]).to.equal(employee1.address);
    });

    it("Devrait gérer les permissions de déchiffrement", async function () {
      const hasPermission = await payroll.hasDecryptionPermission(
        employee1.address,
        ethers.id("balance")
      );
      
      expect(hasPermission).to.be.true;
    });
  });

  describe("Dépôt de fonds", function () {
    it("Devrait permettre à l'employeur de déposer des fonds", async function () {
      const amount = ethers.parseUnits("10000", 6);

      await expect(
        payroll.depositFunds(amount, "0x")
      ).to.emit(payroll, "FundsDeposited")
        .withArgs(employer.address, await time.latest());
    });

    it("Ne devrait pas permettre à un non-employeur de déposer des fonds", async function () {
      const amount = ethers.parseUnits("10000", 6);

      await expect(
        payroll.connect(employee1).depositFunds(amount, "0x")
      ).to.be.revertedWith("Only employer can call this function");
    });
  });
});

// Helper pour obtenir le timestamp actuel
const time = {
  latest: async () => {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
};
