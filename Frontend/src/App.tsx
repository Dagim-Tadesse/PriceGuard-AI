import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./screens/Login/Login";
import AddPrice from "./screens/AddPrice/AddPrice";
import History from "./screens/History/History";
import Compare from "./screens/Compare/Compare";
import Detail from "./screens/Detail/Detail";
import Insights from "./screens/Insights/Insights";
import AppShell from "./components/layout/AppShell";
import RequireAuth from "./components/RequireAuth";
import { ui, theme, i18n } from "./state/stores";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => { ui.initA11y(); theme.init(); i18n.init(); }, []);
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth><AppShell /></RequireAuth>}>
            <Route path="/" element={<Index />} />
            <Route path="/add-price" element={<AddPrice />} />
            <Route path="/history" element={<History />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/detail" element={<Detail />} />
            <Route path="/insights" element={<Insights />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
};

export default App;
