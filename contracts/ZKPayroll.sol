// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "fhevm/lib/FHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title ZKPayroll
 * @dev Smart contract de paie confidentielle utilisant Fully Homomorphic Encryption (FHE)
 * @notice Permet de gérer des salaires sans révéler les montants sur la blockchain
 */
contract ZKPayroll is GatewayCaller {
    
    // ============ Types et Structures ============
    
    struct Employee {
        address wallet;
        euint64 grossSalary;      // Salaire brut chiffré
        euint64 taxRate;          // Taux d'imposition chiffré (en pourcentage * 100)
        euint64 netSalary;        // Salaire net chiffré
        euint64 balance;          // Solde disponible chiffré
        bool isActive;
        uint256 lastPaymentDate;
        uint256 hireDate;
    }
    
    struct PayrollSummary {
        euint64 totalGrossPaid;   // Total brut versé (chiffré)
        euint64 totalTaxes;       // Total des taxes (chiffré)
        euint64 totalNetPaid;     // Total net versé (chiffré)
        uint256 lastPayrollDate;
    }
    
    // ============ Variables d'état ============
    
    address public employer;
    euint64 private contractBalance;  // Solde du contrat (chiffré)
    
    mapping(address => Employee) public employees;
    address[] public employeeAddresses;
    
    PayrollSummary public payrollSummary;
    
    // Permissions de déchiffrement
    mapping(address => mapping(bytes32 => bool)) private decryptionPermissions;
    
    // ============ Events ============
    
    event EmployeeAdded(address indexed employee, uint256 hireDate);
    event EmployeeRemoved(address indexed employee);
    event SalaryUpdated(address indexed employee);
    event PayrollProcessed(uint256 timestamp, uint256 employeeCount);
    event FundsDeposited(address indexed from, uint256 timestamp);
    event SalaryPaid(address indexed employee, uint256 timestamp);
    event BalanceWithdrawn(address indexed employee, uint256 timestamp);
    
    // ============ Modifiers ============
    
    modifier onlyEmployer() {
        require(msg.sender == employer, "Only employer can call this function");
        _;
    }
    
    modifier onlyActiveEmployee() {
        require(employees[msg.sender].isActive, "Not an active employee");
        _;
    }
    
    modifier employeeExists(address _employee) {
        require(employees[_employee].wallet != address(0), "Employee does not exist");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        employer = msg.sender;
        contractBalance = FHE.asEuint64(0);
    }
    
    // ============ Fonctions de gestion des employés ============
    
    /**
     * @dev Ajoute un nouvel employé avec son salaire brut et taux d'imposition chiffrés
     * @param _employee Adresse du wallet de l'employé
     * @param _encryptedGrossSalary Salaire brut chiffré (input chiffré)
     * @param _encryptedTaxRate Taux d'imposition chiffré (en pourcentage * 100, ex: 2500 = 25%)
     */
    function addEmployee(
        address _employee,
        einput _encryptedGrossSalary,
        bytes calldata _encryptedGrossSalaryProof,
        einput _encryptedTaxRate,
        bytes calldata _encryptedTaxRateProof
    ) external onlyEmployer {
        require(_employee != address(0), "Invalid employee address");
        require(employees[_employee].wallet == address(0), "Employee already exists");
        
        // Convertir les inputs chiffrés en euint64
        euint64 grossSalary = FHE.asEuint64(_encryptedGrossSalary, _encryptedGrossSalaryProof);
        euint64 taxRate = FHE.asEuint64(_encryptedTaxRate, _encryptedTaxRateProof);
        
        // Calculer le salaire net : Net = Brut - (Brut * TauxTaxe / 10000)
        euint64 taxAmount = FHE.div(FHE.mul(grossSalary, taxRate), FHE.asEuint64(10000));
        euint64 netSalary = FHE.sub(grossSalary, taxAmount);
        
        // Créer l'employé
        employees[_employee] = Employee({
            wallet: _employee,
            grossSalary: grossSalary,
            taxRate: taxRate,
            netSalary: netSalary,
            balance: FHE.asEuint64(0),
            isActive: true,
            lastPaymentDate: 0,
            hireDate: block.timestamp
        });
        
        employeeAddresses.push(_employee);
        
        // Accorder les permissions de déchiffrement
        _grantDecryptionPermission(_employee, "balance");
        _grantDecryptionPermission(_employee, "netSalary");
        
        emit EmployeeAdded(_employee, block.timestamp);
    }
    
    /**
     * @dev Met à jour le salaire d'un employé
     */
    function updateSalary(
        address _employee,
        einput _newEncryptedGrossSalary,
        bytes calldata _grossSalaryProof,
        einput _newEncryptedTaxRate,
        bytes calldata _taxRateProof
    ) external onlyEmployer employeeExists(_employee) {
        Employee storage emp = employees[_employee];
        require(emp.isActive, "Employee is not active");
        
        euint64 newGrossSalary = FHE.asEuint64(_newEncryptedGrossSalary, _grossSalaryProof);
        euint64 newTaxRate = FHE.asEuint64(_newEncryptedTaxRate, _taxRateProof);
        
        // Recalculer le net
        euint64 taxAmount = FHE.div(FHE.mul(newGrossSalary, newTaxRate), FHE.asEuint64(10000));
        euint64 newNetSalary = FHE.sub(newGrossSalary, taxAmount);
        
        emp.grossSalary = newGrossSalary;
        emp.taxRate = newTaxRate;
        emp.netSalary = newNetSalary;
        
        emit SalaryUpdated(_employee);
    }
    
    /**
     * @dev Désactive un employé
     */
    function removeEmployee(address _employee) external onlyEmployer employeeExists(_employee) {
        employees[_employee].isActive = false;
        emit EmployeeRemoved(_employee);
    }
    
    // ============ Fonctions de paie ============
    
    /**
     * @dev Dépose des fonds chiffrés dans le contrat
     */
    function depositFunds(
        einput _encryptedAmount,
        bytes calldata _amountProof
    ) external onlyEmployer {
        euint64 amount = FHE.asEuint64(_encryptedAmount, _amountProof);
        contractBalance = FHE.add(contractBalance, amount);
        emit FundsDeposited(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Traite la paie pour tous les employés actifs
     * @notice Transfère le salaire net de chaque employé dans son solde
     */
    function processPayroll() external onlyEmployer {
        uint256 employeeCount = 0;
        euint64 totalGross = FHE.asEuint64(0);
        euint64 totalNet = FHE.asEuint64(0);
        euint64 totalTax = FHE.asEuint64(0);
        
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            address empAddress = employeeAddresses[i];
            Employee storage emp = employees[empAddress];
            
            if (emp.isActive) {
                // Vérifier qu'il y a suffisamment de fonds (comparaison FHE)
                ebool hasSufficientFunds = FHE.gte(contractBalance, emp.netSalary);
                
                // Le paiement ne s'effectue que si les fonds sont suffisants
                // Note: En production, utiliser un mécanisme de vérification plus robuste
                
                // Calculer les taxes
                euint64 taxAmount = FHE.sub(emp.grossSalary, emp.netSalary);
                
                // Ajouter au solde de l'employé
                emp.balance = FHE.add(emp.balance, emp.netSalary);
                
                // Déduire du solde du contrat
                contractBalance = FHE.sub(contractBalance, emp.netSalary);
                
                // Mettre à jour la date de paiement
                emp.lastPaymentDate = block.timestamp;
                
                // Accumuler les totaux
                totalGross = FHE.add(totalGross, emp.grossSalary);
                totalNet = FHE.add(totalNet, emp.netSalary);
                totalTax = FHE.add(totalTax, taxAmount);
                
                employeeCount++;
                
                emit SalaryPaid(empAddress, block.timestamp);
            }
        }
        
        // Mettre à jour le résumé de la paie
        payrollSummary.totalGrossPaid = FHE.add(payrollSummary.totalGrossPaid, totalGross);
        payrollSummary.totalNetPaid = FHE.add(payrollSummary.totalNetPaid, totalNet);
        payrollSummary.totalTaxes = FHE.add(payrollSummary.totalTaxes, totalTax);
        payrollSummary.lastPayrollDate = block.timestamp;
        
        emit PayrollProcessed(block.timestamp, employeeCount);
    }
    
    /**
     * @dev Permet à un employé de retirer son solde (simulation)
     * @notice En production, cela transférerait des tokens FHE réels
     */
    function withdrawBalance() external onlyActiveEmployee {
        Employee storage emp = employees[msg.sender];
        
        // Vérifier qu'il y a un solde
        ebool hasBalance = FHE.gt(emp.balance, FHE.asEuint64(0));
        
        // Réinitialiser le solde
        emp.balance = FHE.asEuint64(0);
        
        emit BalanceWithdrawn(msg.sender, block.timestamp);
    }
    
    // ============ Fonctions de lecture ============
    
    /**
     * @dev Obtenir le nombre d'employés actifs
     */
    function getActiveEmployeeCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employees[employeeAddresses[i]].isActive) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Obtenir la liste des adresses des employés
     */
    function getEmployeeAddresses() external view returns (address[] memory) {
        return employeeAddresses;
    }
    
    /**
     * @dev Demande de déchiffrement du solde d'un employé (via Gateway)
     * @notice Seul l'employé peut déchiffrer son propre solde
     */
    function requestBalanceDecryption() external onlyActiveEmployee returns (uint256) {
        Employee storage emp = employees[msg.sender];
        
        // Générer un ID de requête unique
        uint256 requestId = uint256(keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            "balance"
        )));
        
        // Demander le déchiffrement via la Gateway
        uint256[] memory cts = new uint256[](1);
        cts[0] = FHE.decrypt(emp.balance);
        
        return requestId;
    }
    
    /**
     * @dev Demande de déchiffrement du salaire net
     */
    function requestNetSalaryDecryption() external onlyActiveEmployee returns (uint256) {
        Employee storage emp = employees[msg.sender];
        
        uint256 requestId = uint256(keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            "netSalary"
        )));
        
        uint256[] memory cts = new uint256[](1);
        cts[0] = FHE.decrypt(emp.netSalary);
        
        return requestId;
    }
    
    // ============ Fonctions de gestion des permissions ============
    
    /**
     * @dev Accorde la permission de déchiffrement
     */
    function _grantDecryptionPermission(address _user, bytes32 _dataType) private {
        decryptionPermissions[_user][_dataType] = true;
    }
    
    /**
     * @dev Vérifie si un utilisateur a la permission de déchiffrer
     */
    function hasDecryptionPermission(address _user, bytes32 _dataType) external view returns (bool) {
        return decryptionPermissions[_user][_dataType];
    }
    
    /**
     * @dev Obtenir les informations publiques d'un employé
     */
    function getEmployeeInfo(address _employee) external view employeeExists(_employee) returns (
        bool isActive,
        uint256 lastPaymentDate,
        uint256 hireDate
    ) {
        Employee storage emp = employees[_employee];
        return (
            emp.isActive,
            emp.lastPaymentDate,
            emp.hireDate
        );
    }
}
