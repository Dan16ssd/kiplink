// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Holds USDT for a remittance until the receiver claims it (released to the
/// off-ramp address) or the timeout passes and the depositor refunds. Each transfer settles once.
contract RemittanceEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Status { None, Pending, Claimed, Refunded }

    struct Transfer {
        address depositor;
        uint256 amount;
        bytes32 claimHash;
        uint64 expiry;
        Status status;
    }

    IERC20 public immutable token;
    address public immutable offRamp;
    mapping(bytes32 => Transfer) public transfers;

    event Deposited(bytes32 indexed transferId, address indexed depositor, uint256 amount, uint64 expiry);
    event Claimed(bytes32 indexed transferId, address indexed offRamp, uint256 amount);
    event Refunded(bytes32 indexed transferId, address indexed depositor, uint256 amount);

    error ZeroAmount();
    error BadExpiry();
    error AlreadyExists();
    error NotPending();
    error WrongClaimCode();
    error Expired();
    error NotExpired();

    constructor(IERC20 _token, address _offRamp) {
        token = _token;
        offRamp = _offRamp;
    }

    function deposit(bytes32 transferId, uint256 amount, bytes32 claimHash, uint64 expiry) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (expiry <= block.timestamp) revert BadExpiry();
        if (transfers[transferId].status != Status.None) revert AlreadyExists();

        transfers[transferId] = Transfer(msg.sender, amount, claimHash, expiry, Status.Pending);
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(transferId, msg.sender, amount, expiry);
    }

    function claim(bytes32 transferId, string calldata claimCode) external nonReentrant {
        Transfer storage t = transfers[transferId];
        if (t.status != Status.Pending) revert NotPending();
        if (block.timestamp >= t.expiry) revert Expired();
        if (keccak256(bytes(claimCode)) != t.claimHash) revert WrongClaimCode();

        t.status = Status.Claimed;
        token.safeTransfer(offRamp, t.amount);
        emit Claimed(transferId, offRamp, t.amount);
    }

    function refund(bytes32 transferId) external nonReentrant {
        Transfer storage t = transfers[transferId];
        if (t.status != Status.Pending) revert NotPending();
        if (block.timestamp < t.expiry) revert NotExpired();

        t.status = Status.Refunded;
        token.safeTransfer(t.depositor, t.amount);
        emit Refunded(transferId, t.depositor, t.amount);
    }
}
