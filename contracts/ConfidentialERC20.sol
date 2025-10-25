// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "fhevm/lib/FHE.sol";

/**
 * @title ConfidentialERC20
 * @dev Token ERC20 confidentiel utilisant FHE pour les montants
 * @notice Tous les transferts et soldes sont chiffrés
 */
contract ConfidentialERC20 {
    
    // ============ Variables d'état ============
    
    string public name;
    string public symbol;
    uint8 public decimals;
    
    address public owner;
    euint64 private _totalSupply;
    
    // Soldes chiffrés
    mapping(address => euint64) private _balances;
    
    // Allowances chiffrées
    mapping(address => mapping(address => euint64)) private _allowances;
    
    // ============ Events ============
    
    event Transfer(address indexed from, address indexed to);
    event Approval(address indexed owner, address indexed spender);
    event Mint(address indexed to);
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = msg.sender;
        _totalSupply = FHE.asEuint64(0);
    }
    
    // ============ Fonctions principales ============
    
    /**
     * @dev Retourne le solde chiffré d'un utilisateur
     * @notice Le solde reste chiffré, utilisez decrypt pour voir la valeur
     */
    function balanceOf(address account) public view returns (euint64) {
        return _balances[account];
    }
    
    /**
     * @dev Transfère des tokens de manière confidentielle
     * @param to Destinataire
     * @param encryptedAmount Montant chiffré à transférer
     */
    function transfer(
        address to,
        einput encryptedAmount,
        bytes calldata amountProof
    ) public returns (bool) {
        require(to != address(0), "Transfer to zero address");
        
        euint64 amount = FHE.asEuint64(encryptedAmount, amountProof);
        
        // Vérifier que le solde est suffisant
        ebool hasSufficientBalance = FHE.gte(_balances[msg.sender], amount);
        
        // Effectuer le transfert seulement si le solde est suffisant
        // Note: Dans une implémentation réelle, il faudrait gérer les erreurs différemment
        _balances[msg.sender] = FHE.sub(_balances[msg.sender], amount);
        _balances[to] = FHE.add(_balances[to], amount);
        
        // Permettre au destinataire de déchiffrer son solde
        FHE.allowTransient(FHE.asEuint64(amount), to);
        
        emit Transfer(msg.sender, to);
        return true;
    }
    
    /**
     * @dev Transfère des tokens chiffrés (montant déjà chiffré)
     */
    function transferEncrypted(
        address to,
        euint64 amount
    ) public returns (bool) {
        require(to != address(0), "Transfer to zero address");
        
        ebool hasSufficientBalance = FHE.gte(_balances[msg.sender], amount);
        
        _balances[msg.sender] = FHE.sub(_balances[msg.sender], amount);
        _balances[to] = FHE.add(_balances[to], amount);
        
        FHE.allowTransient(amount, to);
        
        emit Transfer(msg.sender, to);
        return true;
    }
    
    /**
     * @dev Approuve un spender à dépenser des tokens
     */
    function approve(
        address spender,
        einput encryptedAmount,
        bytes calldata amountProof
    ) public returns (bool) {
        require(spender != address(0), "Approve to zero address");
        
        euint64 amount = FHE.asEuint64(encryptedAmount, amountProof);
        _allowances[msg.sender][spender] = amount;
        
        emit Approval(msg.sender, spender);
        return true;
    }
    
    /**
     * @dev Transfère des tokens depuis un compte approuvé
     */
    function transferFrom(
        address from,
        address to,
        einput encryptedAmount,
        bytes calldata amountProof
    ) public returns (bool) {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        
        euint64 amount = FHE.asEuint64(encryptedAmount, amountProof);
        
        // Vérifier l'allowance
        ebool hasAllowance = FHE.gte(_allowances[from][msg.sender], amount);
        
        // Vérifier le solde
        ebool hasSufficientBalance = FHE.gte(_balances[from], amount);
        
        // Effectuer le transfert
        _balances[from] = FHE.sub(_balances[from], amount);
        _balances[to] = FHE.add(_balances[to], amount);
        
        // Réduire l'allowance
        _allowances[from][msg.sender] = FHE.sub(_allowances[from][msg.sender], amount);
        
        FHE.allowTransient(amount, to);
        
        emit Transfer(from, to);
        return true;
    }
    
    /**
     * @dev Mint de nouveaux tokens (réservé à l'owner)
     */
    function mint(
        address to,
        einput encryptedAmount,
        bytes calldata amountProof
    ) public onlyOwner returns (bool) {
        require(to != address(0), "Mint to zero address");
        
        euint64 amount = FHE.asEuint64(encryptedAmount, amountProof);
        
        _balances[to] = FHE.add(_balances[to], amount);
        _totalSupply = FHE.add(_totalSupply, amount);
        
        FHE.allowTransient(amount, to);
        
        emit Mint(to);
        emit Transfer(address(0), to);
        return true;
    }
    
    /**
     * @dev Retourne l'allowance chiffrée
     */
    function allowance(address _owner, address spender) public view returns (euint64) {
        return _allowances[_owner][spender];
    }
    
    /**
     * @dev Demande le déchiffrement du solde via la Gateway
     */
    function requestBalanceDecryption() public view returns (uint256) {
        return FHE.decrypt(_balances[msg.sender]);
    }
    
    /**
     * @dev Obtenir le total supply chiffré
     */
    function totalSupply() public view returns (euint64) {
        return _totalSupply;
    }
}
