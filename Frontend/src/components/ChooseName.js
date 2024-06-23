// src/components/ChooseName.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChooseName = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/drawing?name=${name}`);
  };

  return (
    <div>
      <h1>Choose your name</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <button type="submit">Start Drawing</button>
      </form>
    </div>
  );
};

export default ChooseName;
