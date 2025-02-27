import { useNavigate } from "react-router-dom";
import Button from "../UI/Button.jsx";
import { fetchData } from "../../hooks/fetchData.js";

const signOut = ({ className }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const resdata = await fetchData("/logout");
      sessionStorage.clear();
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button className={className} onClick={handleSignOut}>
      Sign Out
    </Button>
  );
};

export default signOut;
