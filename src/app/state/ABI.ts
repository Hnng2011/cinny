import { atom } from 'jotai';

const ABI : Array<Object> = [{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newPercentage","type":"uint256"}],"name":"ClaimablePercentageChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newDuration","type":"uint256"}],"name":"DefaultSubscriptionDurationChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"spaceOwner","type":"address"},{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"FeesClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"spaceOwner","type":"address"},{"indexed":false,"internalType":"string","name":"roomId","type":"string"},{"indexed":false,"internalType":"uint256","name":"subscriptionFee","type":"uint256"}],"name":"RoomCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"spaceOwner","type":"address"}],"name":"SpaceCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"spaceOwner","type":"address"},{"indexed":false,"internalType":"string","name":"roomId","type":"string"},{"indexed":false,"internalType":"address","name":"subscriber","type":"address"},{"indexed":false,"internalType":"uint256","name":"newExpiry","type":"uint256"}],"name":"SubscriberAddedOrExtended","type":"event"},{"inputs":[{"internalType":"address","name":"spaceOwner","type":"address"},{"internalType":"string","name":"_roomId","type":"string"}],"name":"addOrExtendSubscription","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"string","name":"_roomId","type":"string"},{"internalType":"uint256","name":"_subscriptionFee","type":"uint256"}],"name":"addRoomToSpace","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimFeeFromSpace","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimablePercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"createSpace","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"defaultSubscriptionDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spaceOwner","type":"address"},{"internalType":"string","name":"roomId","type":"string"},{"internalType":"address","name":"subscriber","type":"address"}],"name":"isSubscriptionActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nftContract","outputs":[{"internalType":"contract IERC721","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newPercentage","type":"uint256"}],"name":"setClaimablePercentage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newDuration","type":"uint256"}],"name":"setDefaultSubscriptionDuration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_votingManager","type":"address"},{"internalType":"address","name":"_nftContract","type":"address"}],"name":"setExternalContracts","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"spaces","outputs":[{"internalType":"address","name":"spaceOwner","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"votingManager","outputs":[{"internalType":"contract IVotingManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]

export const ABIAtom = atom(ABI);
