import { Header } from "../components/header/Header"
import { VisorView } from "../views/VisorView"

export const BaseLayout = () => {
    return (
      <div>
        <Header />
        <div>
          <VisorView />
        </div>
      </div>
    );
}