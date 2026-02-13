"use client";

import { useEffect, useRef, useState } from "react";

const APP_ID = 126398;
const WS_URL = wss://ws.derivws.com/websockets/v3?app_id=${APP_ID};

export default function Dashboard() {
  const [status, setStatus] = useState("Disconnected");
  const [ticks, setTicks] = useState<string[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("USD");
  const [positions, setPositions] = useState<any[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const API_TOKEN = process.env.DERIV_API_TOKEN || "";

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, []);

  const connect = () => {
    setStatus("Connecting...");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("Connected (public data active)");
      console.log("WS open");

      const pingId = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ ping: 1 }));
        }
      }, 30000);

      ws.addEventListener("close", () => clearInterval(pingId));

      ws.send(JSON.stringify({ ticks: "R_100" }));

      if (API_TOKEN.trim()) {
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            console.log("Auto authorizing...");
            ws.send(JSON.stringify({ authorize: API_TOKEN.trim() }));
          }
        }, 800);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("←", data.msg_type || "message", data);

        if (data.msg_type === "tick") {
          const q = data.tick?.quote?.toFixed(3) ?? "—";
          const time = new Date().toLocaleTimeString("en-KE");
          setTicks((prev) => [${time} | ${q}, ...prev].slice(0, 30));
        }

        if (data.msg_type === "authorize") {
          if (data.authorize) {
            setAuthorized(true);
            setStatus("Authorized ✓");
            setCurrency(data.authorize.currency || "USD");

            ws.send(JSON.stringify({ balance: 1, subscribe: 1 }));
            ws.send(JSON.stringify({ proposal_open_contract: 1, subscribe: 1 }));
          } else if (data.error) {
            setStatus(Auth failed: ${data.error.message || "check token"});
          }
        }

        if (data.msg_type === "balance") {
          setBalance(data.balance?.balance ?? null);
        }

        if (data.msg_type === "proposal_open_contract") {
          const contract = data.proposal_open_contract;
          if (contract) {
            setPositions((prev) => {
              const list = [...prev];
              const idx = list.findIndex(c => c.contract_id === contract.contract_id);
              if (idx >= 0) list[idx] = contract;
              else list.push(contract);
              return list.slice(0, 15);
            });
          }
        }
      } catch (err) {
        console.error("Parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WS error:", err);
      setStatus("Connection error – retrying...");
    };

    ws.onclose = () => {
      setStatus("Disconnected – reconnecting in 5s...");
      reconnectTimeout.current = setTimeout(connect, 5000);
    };
  };

  return (
    <main className="p-5 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Dennisfx</h1>
      <p className="text-gray-400 mb-6">Deriv Dashboard • App ID {APP_ID}</p>

      <div className="bg-gray-800/70 backdrop-blur-sm p-5 rounded-xl border border-gray-700 mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-lg">
              Status:{" "}
              <span
                className={
                  status.includes("Connected") || status.includes("Authorized")
                    ? "text-green-400 font-semibold"
                    : status.includes("failed") || status.includes("error")
                    ? "text-red-400 font-semibold"
                    : "text-yellow-400"
                }
              >
                {status}
              </span>
            </p>
            {authorized && balance !== null && (
              <p className="text-2xl font-bold mt-2">
                {balance.toFixed(2)} {currency}
              </p>
            )}
          </div>
        </div>
      </div>

      {!authorized && !API_TOKEN && (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 mb-8">
          <h2 className="text-xl mb-4">Quick Authorization (for testing)</h2>
          <p className="text-sm text-gray-400 mb-4">
            Add <code>DERIV_API_TOKEN=your-token</code> to .env.local or Vercel Environment Variables
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/70 p-5 rounded-xl border border-gray-700">
          <h2 className="text-xl mb-4">Live Ticks – Volatility 100 (R_100)</h2>
          <div className="h-64 overflow-y-auto text-sm font-mono space-y-1 pr-2">
            {ticks.length === 0 ? (
              <p className="text-gray-500">Waiting for market data...</p>
            ) : (
              ticks.map((line, i) => (
                <div key={i} className="py-0.5">
                  {line}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-800/70 p-5 rounded-xl border border-gray-700">
          <h2 className="text-xl mb-4">Open Contracts / Positions</h2>
          {positions.length === 0 ? (
            <p className="text-gray-500">
              {authorized ? "No open positions right now" : "Authorize to see positions"}
            </p>
          ) : (
            <div className="space-y-4 text-sm">
              {positions.map((p, i) => (
                <div key={i} className="border-b border-gray-700 pb-3 last:border-0">
                  <div className="font-medium">{p.display_name || p.shortcode || "Contract"}</div>
                  <div className="text-gray-400">
                    ID: {p.contract_id} • {p.status}
                  </div>
                  {p.profit !== undefined && (
                    <div className={p.profit >= 0 ? "text-green-400" : "text-red-400"}>
                      Profit: {p.profit.toFixed(2)} {currency}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        https://dennisfx.vercel.app • Personal Deriv tool • Test on demo first
      </footer>
    </main>
  );
}
