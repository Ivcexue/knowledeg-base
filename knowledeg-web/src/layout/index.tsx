import { Outlet } from "react-router"
import { Header } from "@/components/header"

const Layout: React.FC = () => {
  return (
    <div className="mx-auto h-full overflow-hidden">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;