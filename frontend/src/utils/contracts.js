import { ethers } from 'ethers';

// Adresses des contrats
const CONTRACTS = {
  PAYROLL: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  TOKEN: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
};

// ABI complètes
const PAYROLL_ABI = [
  'function employer() view returns (address)',
  'function addEmployee(address, bytes, bytes, bytes, bytes)',
  'function updateSalary(address, bytes, bytes, bytes, bytes)',
  'function removeEmployee(address)',
  'function depositFunds(bytes, bytes)',
  'function processPayroll()',
  'function withdrawBalance()',
  'function getEmployeeInfo(address) view returns (bool, uint256, uint256)',
  'function getActiveEmployeeCount() view returns (uint256)',
  'function getEmployeeAddresses() view returns (address[])',
  'event EmployeeAdded(address indexed employee, uint256 hireDate)',
  'event EmployeeRemoved(address indexed employee)',
  'event PayrollProcessed(uint256 timestamp, uint256 employeeCount)',
  'event SalaryPaid(address indexed employee, uint256 timestamp)',
  'event FundsDeposited(address indexed from, uint256 timestamp)',
];

const TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
];

export function getPayrollContract(signer) {
  return new ethers.Contract(CONTRACTS.PAYROLL, PAYROLL_ABI, signer);
}

export function getTokenContract(signer) {
  return new ethers.Contract(CONTRACTS.TOKEN, TOKEN_ABI, signer);
}

export async function addEmployee(signer, employeeAddress, encryptedGrossSalary, encryptedTaxRate) {
  const contract = getPayrollContract(signer);
  const tx = await contract.addEmployee(
    employeeAddress,
    encryptedGrossSalary.data || '0x00',
    encryptedGrossSalary.proof || '0x00',
    encryptedTaxRate.data || '0x00',
    encryptedTaxRate.proof || '0x00'
  );
  return await tx.wait();
}

export async function updateEmployeeSalary(signer, employeeAddress, encryptedGrossSalary, encryptedTaxRate) {
  const contract = getPayrollContract(signer);
  const tx = await contract.updateSalary(
    employeeAddress,
    encryptedGrossSalary.data || '0x00',
    encryptedGrossSalary.proof || '0x00',
    encryptedTaxRate.data || '0x00',
    encryptedTaxRate.proof || '0x00'
  );
  return await tx.wait();
}

export async function removeEmployee(signer, employeeAddress) {
  const contract = getPayrollContract(signer);
  const tx = await contract.removeEmployee(employeeAddress);
  return await tx.wait();
}

export async function depositFunds(signer, encryptedAmount) {
  const contract = getPayrollContract(signer);
  const tx = await contract.depositFunds(
    encryptedAmount.data || '0x00',
    encryptedAmount.proof || '0x00'
  );
  return await tx.wait();
}

export async function processPayroll(signer) {
  const contract = getPayrollContract(signer);
  const tx = await contract.processPayroll();
  return await tx.wait();
}

export async function withdrawBalance(signer) {
  const contract = getPayrollContract(signer);
  const tx = await contract.withdrawBalance();
  return await tx.wait();
}

export async function getEmployeeInfo(signer, employeeAddress) {
  const contract = getPayrollContract(signer);
  const info = await contract.getEmployeeInfo(employeeAddress);
  return {
    isActive: info[0],
    lastPaymentDate: Number(info[1]),
    hireDate: Number(info[2])
  };
}

export async function getActiveEmployeeCount(signer) {
  const contract = getPayrollContract(signer);
  const count = await contract.getActiveEmployeeCount();
  return Number(count);
}

export async function getEmployeeAddresses(signer) {
  const contract = getPayrollContract(signer);
  return await contract.getEmployeeAddresses();
}

export async function requestBalanceDecryption(signer) {
  console.log('Balance decryption requested');
  return 12345; // Simulé pour la démo
}

export async function requestNetSalaryDecryption(signer) {
  console.log('Net salary decryption requested');
  return 67890; // Simulé pour la démo
}

export function listenToEvent(signer, eventName, callback) {
  const contract = getPayrollContract(signer);
  contract.on(eventName, callback);
}

export async function getEventHistory(signer, eventName = null, fromBlock = 0) {
  const contract = getPayrollContract(signer);
  const filter = eventName ? contract.filters[eventName]() : null;
  const events = await contract.queryFilter(filter, fromBlock);
  
  return events.map(event => ({
    event: event.eventName || event.fragment?.name,
    args: event.args,
    blockNumber: event.blockNumber,
    transactionHash: event.transactionHash,
  }));
}

export function isValidAddress(address) {
  return ethers.isAddress(address);
}

export function formatAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export async function getNetworkInfo(provider) {
  const network = await provider.getNetwork();
  return {
    name: network.name,
    chainId: Number(network.chainId),
  };
}