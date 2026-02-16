// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract QuickPollRegistry {
    struct PollResult {
        string questionHash;      // IPFS hash or keccak of question text
        string optionsHash;       // IPFS hash or keccak of options + results
        uint256 totalVotes;
        uint256 timestamp;
        address creator;
    }

    mapping(bytes32 => PollResult) public polls;  // pollId => result

    event PollSaved(bytes32 indexed pollId, address indexed creator, uint256 totalVotes);

    function savePollResult(
        bytes32 pollId,
        string calldata questionHash,
        string calldata optionsHash,
        uint256 totalVotes
    ) external {
        polls[pollId] = PollResult({
            questionHash: questionHash,
            optionsHash: optionsHash,
            totalVotes: totalVotes,
            timestamp: block.timestamp,
            creator: msg.sender
        });

        emit PollSaved(pollId, msg.sender, totalVotes);
    }

    function getPollResult(bytes32 pollId) external view returns (PollResult memory) {
        return polls[pollId];
    }
}
