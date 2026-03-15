import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const TimetablesLayout = () => {
  return (
    <>
      <Outlet />
      <Footer />
    </>
  );
};

export default TimetablesLayout;
