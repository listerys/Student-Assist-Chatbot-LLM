import React, { useState, useEffect, useRef } from 'react';
import './Header.css'; // Ensure that your Header.css includes the styles you provided earlier

// Your Dropdown component code
const Dropdown = ({ selectedModule, setSelectedModule }) => {
  const [isOpen, setOpen] = useState(false);
  const [items, setItems] = useState([
    { id: 0, label: "Algo Project" },
    { id: 1, label: "Systems Paradigm" }
  ]);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setOpen(!isOpen);

  const handleItemClick = (id, label) => {
    setSelectedItem(id);
    setSelectedModule(label);
    setOpen(false); // Close the dropdown after selecting an item
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false); // Close the dropdown if a click occurs outside of it
      }
    };

    // Attach the event listener when the dropdown is open
    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
    }

    // Clean up the event listener when the component unmounts or the dropdown closes
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className='dropdown' ref={dropdownRef}>
      <div className='dropdown-header' onClick={toggleDropdown}>
        {selectedItem !== null ? items.find(item => item.id === selectedItem).label : "Select Your Notebook"}
        <i className={`fa fa-chevron-right icon ${isOpen && "open"}`}></i>
      </div>
      <div className={`dropdown-body ${isOpen && 'open'}`}>
        {items.map(item => (
          <div className="dropdown-item" onClick={() => handleItemClick(item.id, item.label)} key={item.id}>
            <span className={`dropdown-item-dot ${item.id === selectedItem ? 'selected' : ''}`}></span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
};

// Your Header component code, now including the Dropdown component
const Header = () => {
  const [selectedModule, setSelectedModule] = useState("Algo Project");

  return (
    <header className="header">
      <div className="back-button">
        <button onClick={() => window.history.back()}>Back</button>
      </div>
      <Dropdown selectedModule={selectedModule} setSelectedModule={setSelectedModule} /> {/* Include the Dropdown component here */}
    </header>
  );
};

export default Header;
