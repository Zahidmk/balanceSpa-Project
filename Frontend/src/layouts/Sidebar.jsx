import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCog,
  FaSignOutAlt,
  FaUsers,
  FaUser,
  FaCalendarAlt,
  FaShoppingBag,
  FaBuilding,
} from "react-icons/fa";
import { RiStackFill } from "react-icons/ri";
import { BsBoxSeamFill } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { assets } from "@assets/assets";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full z-40 bg-white transition-transform duration-500 ease-in-out dark:bg-bgDark 
      ${isCollapsed ? "-translate-x-full" : "translate-x-0"} md:relative md:translate-x-0`}
    >
      {/* Logo Section */}
      <div className="flex items-center p-4 justify-center">
        <img
          src={assets.textlogo}
          alt="Logo"
          className={`h-8 transition-all duration-500 dark:invert dark:brightness-0 
            ${isCollapsed ? "hidden" : "hidden md:block w-28"}`}
        />
        <img
          src={assets.textlogo}
          alt="Mobile Logo"
          className={`h-8 w-10 transition-all duration-500 dark:invert dark:brightness-0 
            ${isCollapsed ? "block" : "md:hidden"}`}
        />
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-700 text-2xl ms-11 bg-red-100 rounded-full p-1"
          aria-label="Close Sidebar"
        >
          <IoClose />
        </button>
      </div>

      {/* Menu Items */}
      <div className="p-4 flex flex-col gap-2">
        <MenuItem icon={<FaCalendarAlt />} text="Appointments" to="/appointment" isCollapsed={isCollapsed} />
        <MenuItem icon={<RiStackFill />} text="Services" to="/service-category" isCollapsed={isCollapsed} />
        <MenuItem icon={<BsBoxSeamFill />} text="Treatment" to="/treatment" isCollapsed={isCollapsed} />
        <MenuItem icon={<FaUsers />} text="Customers" to="/customers" isCollapsed={isCollapsed} />
        <MenuItem icon={<FaUser />} text="Users" to="/users" isCollapsed={isCollapsed} />
        <MenuItem icon={<FaCog />} text="Settings" to="/settings" isCollapsed={isCollapsed} />
        <MenuItem icon={<BsBoxSeamFill />} text="Food Admin" to="/food-admin" isCollapsed={isCollapsed} />
        <MenuItem icon={<FaShoppingBag />} text="Products" to="/product-admin" isCollapsed={isCollapsed} />
        <MenuItem icon={<FaBuilding />} text="Facility Admin" to="/facility-admin" isCollapsed={isCollapsed} />
        <LogoutItem icon={<FaSignOutAlt />} text="Logout" isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

// ✅ Single Sidebar Menu Link
const MenuItem = ({ icon, text, to, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-3 rounded-lg transition duration-200 cursor-pointer 
        ${isCollapsed ? "justify-center w-12 h-12" : "justify-start pe-16"} 
        ${isActive ? "bg-[#18181b] text-white" : "text-gray-500"} 
        hover:bg-gray-300 hover:text-white dark:hover:bg-gray-600`}
    >
      {icon}
      {!isCollapsed && <span className="ml-3">{text}</span>}
    </Link>
  );
};

// ✅ Logout with Side Effect
const LogoutItem = ({ icon, text, isCollapsed }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center w-full text-left px-3 py-3 rounded-lg transition duration-200 cursor-pointer 
        ${isCollapsed ? "justify-center w-12 h-12" : "justify-start pe-16"} 
        text-gray-500 hover:bg-red-400 hover:text-white dark:hover:bg-red-600`}
    >
      {icon}
      {!isCollapsed && <span className="ml-3">{text}</span>}
    </button>
  );
};

export default Sidebar;
