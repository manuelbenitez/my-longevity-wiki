"use client";

import { useEffect, useState } from "react";

interface Transaction {
  hash: string;
  from: string;
  value: string;
  timeStamp: string;
}

const WALLET = "0x8b930D725e7D4CE7442b9BdCe4c470cf7beDda72";

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

export function DonationFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState("0");

  useEffect(() => {
    async function fetchDonations() {
      try {
        const res = await fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${WALLET}&startblock=0&endblock=99999999&sort=desc&page=1&offset=50`
        );
        const data = await res.json();

        if (data.status === "1" && Array.isArray(data.result)) {
          // Filter: only incoming transactions with value > 0
          const incoming = data.result.filter(
            (tx: Transaction & { to: string; isError: string }) =>
              tx.to?.toLowerCase() === WALLET.toLowerCase() &&
              tx.value !== "0" &&
              tx.isError === "0"
          );

          setTransactions(incoming);

          const totalWei = incoming.reduce(
            (sum: number, tx: Transaction) => sum + Number(tx.value),
            0
          );
          setTotal((totalWei / 1e18).toFixed(4));
        }
      } catch {
        // Silently fail, the feed is a nice-to-have
      } finally {
        setLoading(false);
      }
    }

    fetchDonations();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-muted py-8 text-center">
        Loading donations...
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
        <span className="font-display text-3xl font-light">{total} ETH</span>
        <span className="text-sm text-muted">
          from {transactions.length} donation{transactions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Transaction list */}
      <div className="border border-border rounded-lg overflow-hidden">
        {transactions.slice(0, 20).map((tx, i) => (
          <a
            key={tx.hash}
            href={`https://etherscan.io/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between px-5 py-3.5 hover:bg-surface transition-colors !no-underline !border-none ${
              i < transactions.length - 1 && i < 19
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
                  {weiToEth(tx.value)} ETH
                </span>
                <span className="text-xs text-muted ml-2">
                  from {shortenAddress(tx.from)}
                </span>
              </div>
            </div>
            <span className="text-xs text-muted shrink-0">
              {timeAgo(tx.timeStamp)}
            </span>
          </a>
        ))}
      </div>

      <p className="text-xs text-muted mt-3 text-center">
        <a
          href={`https://etherscan.io/address/${WALLET}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent-hover !border-none"
        >
          View all on Etherscan
        </a>
      </p>
    </div>
  );
}
