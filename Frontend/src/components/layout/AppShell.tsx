import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Ticker from "./Ticker";
import OfflineIndicator from "@/components/OfflineIndicator";
import CurrencyToggle from "@/components/CurrencyToggle";

export default function AppShell() {
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center border-b border-border bg-surface/50 backdrop-blur">
          <div className="flex-1 min-w-0"><Ticker /></div>
          <div className="flex items-center gap-2 px-4">
            <OfflineIndicator />
            <CurrencyToggle />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
