import { useState } from 'react';
import userLogo from '../assets/user-svgrepo-com.svg';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [apiError, setApiError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password
      });
      onLogin && onLogin(response.data.user);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setApiError(err.response.data.error);
      } else {
        setApiError('Chyba pripojenia k serveru.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 relative">
        <div className='bg-white p-6 rounded-lg shadow-md flex flex-col items-center gap-4 w-[20%]'>
            <h2 className='text-4xl font-[Montserrat] font-bold text-center'>Prihlásenie</h2>
            <img src={userLogo} alt="User Icon" className='w-8 h-8' />
            <form onSubmit={handleSubmit} className='flex flex-col items-center gap-4 w-full'>
                <input
                className='border-2 border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500 w-full'
                type="text"
                placeholder="Zadajte prihlasovacie meno"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                />
                <input  
                type="password"
                placeholder='Zadajte heslo'
                className='border-2 border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500 w-full'
                onChange={(event) => setPassword(event.target.value)}
                required
                />
                <button type="submit" className="w-min  py-2 px-4 rounded-xl font-[Montserrat] bg-blue-500 text-white
                     hover:bg-blue-700 transition-colors duration-300">
                    Prihlásiť
                </button>
            </form>
            {apiError && <p className="text-red-500">{apiError}</p>}
            <p className='text-sm text-gray-500'> Nemáte účet? 
                <Link to="/signup" className='text-blue-500 hover:underline'>
                    Zaregistrujte sa
                </Link>
            </p>
            <br/>
            <Link to="/" className='text-blue-500 hover:underline text-sm'>
                Späť na domovskú stránku
            </Link>
        </div>
    </div>
  );
}

export default Login;
