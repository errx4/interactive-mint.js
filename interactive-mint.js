// interactive-mint.js

const { ethers } = require("ethers");
// Node.js এর বিল্ট-ইন 'readline' মডিউল ব্যবহার করে আমরা ইউজারের কাছ থেকে ইনপুট নেব
const readline = require('readline/promises');

// কন্ট্রাক্টের ABI (Application Binary Interface)
// এটি সাধারণত একই থাকে, তবে প্রয়োজনে আপনি Etherscan থেকে নতুন ABI যোগ করতে পারেন।
const contractABI = [
  // উদাহরণ: "function mint(uint256 amount) public payable"
  // আপনাকে আসল mint ফাংশনের নাম ব্যবহার করতে হবে।
  "function mint(uint256 numberOfTokens)"
];

// মূল অ্যাসিঙ্ক্রোনাস ফাংশন
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("=== ইন্টারঅ্যাক্টিভ NFT মিন্টিং স্ক্রিপ্ট ===");

  // ইউজারের কাছ থেকে ধাপে ধাপে ইনপুট নেওয়া
  const contractAddress = await rl.question("NFT কন্ট্রাক্ট অ্যাড্রেস পেস্ট করুন: ");
  const privateKey = await rl.question("আপনার ওয়ালেটের প্রাইভেট কী পেস্ট করুন (এটি কোথাও সেভ হবে না): ");
  const quantityStr = await rl.question("কয়টি NFT মিন্ট করতে চান? (সংখ্যা লিখুন): ");
  const mintPriceStr = await rl.question("একটি NFT-এর দাম ETH-এ লিখুন (যেমন: 0.05): ");
  
  rl.close(); // সমস্ত ইনপুট নেওয়া শেষ

  // ইনপুটগুলোকে সঠিক ফরম্যাটে রূপান্তর করা
  const mintQuantity = parseInt(quantityStr);
  const mintPrice = ethers.parseEther(mintPriceStr);
  const totalCost = mintPrice * BigInt(mintQuantity);

  // --- আগের স্ক্রিপ্টের মতো বাকি অংশ ---
  try {
    // ১. প্রোভাইডারের সাথে সংযোগ স্থাপন (এখানে একটি পাবলিক RPC ব্যবহার করা হলো, আপনি চাইলে এটিও ইনপুট নিতে পারেন)
    const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY"); // আপনার Infura/Alchemy কী দিন
    console.log("\n✅ Provider এর সাথে সংযোগ সফল।");

    // ২. ওয়ালেট লোড করা (ইনপুট করা প্রাইভেট কী দিয়ে)
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`✅ ওয়ালেট লোড করা হয়েছে: ${wallet.address}`);

    // ৩. কন্ট্রাক্টের সাথে সংযোগ
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      wallet
    );
    console.log(`✅ কন্ট্রাক্টের সাথে সংযোগ সফল: ${await contract.getAddress()}`);

    console.log(`\n🚀 মিন্ট করার চেষ্টা চলছে...`);
    console.log(`   - পরিমাণ: ${mintQuantity}`);
    console.log(`   - মোট খরচ: ${ethers.formatEther(totalCost)} ETH`);

    // ৪. মিন্ট ট্রানজ্যাকশন পাঠানো
    const tx = await contract.mint(mintQuantity, {
      value: totalCost,
    });

    console.log(`⏳ ট্রানজ্যাকশন পাঠানো হয়েছে। হ্যাশ: ${tx.hash}`);
    console.log("ট্রানজ্যাকশন নিশ্চিত হওয়ার জন্য অপেক্ষা করা হচ্ছে...");

    const receipt = await tx.wait();

    console.log("\n🎉 অভিনন্দন! মিন্ট সফল হয়েছে!");
    console.log(`Etherscan-এ দেখুন: https://etherscan.io/tx/${receipt.hash}`);

  } catch (error) {
    console.error("\n❌ একটি ত্রুটি ঘটেছে:");
    console.error(error.reason || error.message);
  }
}

main();
