import { Link } from "react-router-dom";
import { FaHome, FaPlusSquare, FaUser } from "react-icons/fa";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  return (
    <div className="bg-white border-b fixed w-full top-0 z-50">
  <div className="max-w-4xl mx-auto flex justify-between items-center p-2 sm:p-3">

    <h1 className="text-lg sm:text-xl font-bold text-rwandaBlue">
      IwacuHub
    </h1>

    <div className="flex space-x-4 sm:space-x-6 text-lg sm:text-xl">
      {/* icons */}
    </div>
  </div>
</div>
  );
}