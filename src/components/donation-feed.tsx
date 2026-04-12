"use client";

import { useEffect, useState } from "react";

interface Transaction {
  hash: string;
  from: string;
  value: string;
  timeStamp: string;
  chain: string;
  explorer: string;
  symbol: string;
}

const WALLET = "0x8b930D725e7D4CE7442b9BdCe4c470cf7beDda72";

const CHAINS = [
  {
    name: "Ethereum",
    symbol: "ETH",
    api: "https://api.etherscan.io/api",
    explorer: "https://etherscan.io",
  },
  {
    name: "Polygon",
    symbol: "MATIC",
    api: "https://api.polygonscan.com/api",
    explorer: "https://polygonscan.com",
  },
  {
    name: "Arbitrum",
    symbol: "ETH",
    api: "https://api.arbiscan.io/api",
    explorer: "https://arbiscan.io",
  },
  {
    name: "Optimism",
    symbol: "ETH",
    api: "https://api-optimistic.etherscan.io/api",
    explorer: "https://optimistic.etherscan.io",
  },
  {
    name: "Base",
    symbol: "ETH",
    api: "https://api.basescan.org/api",
    explorer: "https://basescan.org",
  },
];

function weiToEth(wei: string): string {
  const eth = Number(wei) / 1e18;
  if (eth < 0.001) return "<0.001";
  return eth.toFixed(4);
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(timestamp: string): string {
  const seconds = Math.floor(Date.now() / 1000 - Number(timestamp));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function fetchChainDonations(chain: (typeof CHAINS)[number]): Promise<Transaction[]> {
  try {
    const res = await fetch(
      `${chain.api}?module=account&action=txlist&address=${WALLET}&startblock=0&endblock=99999999&sort=desc&page=1&offset=25`
    );
    const data = await res.json();

    if (data.status === "1" && Array.isArray(data.result)) {
      return data.result
        .filter(
          (tx: { to?: string; value: string; isError: string }) =>
            tx.to?.toLowerCase() === WALLET.toLowerCase() &&
            tx.value !== "0" &&
            tx.isError === "0"
        )
        .map((tx: { hash: string; from: string; value: string; timeStamp: string }) => ({
          hash: tx.hash,
          from: tx.from,
          value: tx.value,
          timeStamp: tx.timeStamp,
          chain: chain.name,
          explorer: chain.explorer,
          symbol: chain.symbol,
        }));
    }
  } catch {
    // Chain unavailable, skip silently
  }
  return [];
}

export function DonationFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEth, setTotalEth] = useState("0");

  useEffect(() => {
    async function fetchAll() {
      // Fetch all chains in parallel, stagger slightly to avoid rate limits
      const results = await Promise.all(
        CHAINS.map((chain, i) =>
          new Promise<Transaction[]>((resolve) =>
            setTimeout(() => fetchChainDonations(chain).then(resolve), i * 300)
          )
        )
      );

      const all = results
        .flat()
        .sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp));

      setTransactions(all);

      const totalWei = all.reduce((sum, tx) => sum + Number(tx.value), 0);
      setTotalEth((totalWei / 1e18).toFixed(4));
      setLoading(false);
    }

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-muted py-8 text-center">
        Scanning 5 networks for donations...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="border border-border border-dashed rounded-lg p-8 text-center">
        <p className="font-display text-lg text-muted mb-1">
          No donations yet
        </p>
        <p className="text-sm text-muted">
          Be the first to support the wiki.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Total */}
      <div className="flex items-baseline gap-3 mb-6">
        <span className="font-display text-3xl font-light">{totalEth} ETH</span>
        <span className="text-sm text-muted">
          from {transactions.length} donation
          {transactions.length !== 1 ? "s" : ""} across{" "}
          {new Set(transactions.map((t) => t.chain)).size} network
          {new Set(transactions.map((t) => t.chain)).size !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Transaction list */}
      <div className="border border-border rounded-lg overflow-hidden">
        {transactions.slice(0, 20).map((tx, i) => (
          <a
            key={`${tx.chain}-${tx.hash}`}
            href={`${tx.explorer}/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between px-5 py-3.5 hover:bg-surface transition-colors !no-underline !border-none ${
              i < Math.min(transactions.length, 20) - 1
                ? "border-b border-border"
                : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-semibold shrink-0">
                Ξ
              </div>
              <div>
                <span className="text-sm font-medium text-text">
                  {weiToEth(tx.value)} {tx.symbol}
                </span>
                <span className="text-xs text-muted ml-2">
                  from {shortenAddress(tx.from)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-semibold border border-border rounded-sm px-2 py-0.5 text-muted">
                {tx.chain}
              </span>
              <span className="text-xs text-muted">{timeAgo(tx.timeStamp)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
