import { Link } from "react-router-dom";

const Navbar = ({ user, setUser }) => {
  return (
    <>
      {user ? (
        <nav className='flex flex-row justify-between items-center p-2 shadow-md bg-blue-950 text-white'>
          <Link to="/" className="py-2 px-4 rounded-xl font-[Montserrat] bg-white text-blue-950">
            Domov
          </Link>
          <Link to="/dashboard" className="py-2 px-4 rounded-xl font-[Montserrat] bg-blue-500 text-white">Užívateľský panel</Link>
          <h2 className="font-[Montserrat] font-bold">Vitajte, {user.name}!</h2>
          <button onClick={() => setUser(null)}
            className="py-2 px-4 rounded-xl font-[Montserrat] bg-red-500 text-white transition-colors hover:bg-red-700 duration-300">
            Odhlásiť
          </button>
        </nav>
      ) : (
        <nav className="flex flex-row justify-between items-center p-2 shadow-md bg-blue-950 text-white w-full">
            <Link to="/" className="py-2 px-4 rounded-xl font-[Montserrat] bg-white text-blue-950 ml-4">
                Domov
            </Link>
            <div className="flex flex-row gap-4 mr-4">
                <Link to="/login" className="py-2 px-4 rounded-xl font-[Montserrat] bg-blue-500 text-white transition-colors hover:bg-blue-700 duration-300">
                Prihlásenie 
                </Link>
                <Link to="/signup" className="py-2 px-4 rounded-xl font-[Montserrat] bg-white text-blue-950 transition-colors hover:bg-gray-200 duration-300">
                Registrácia
                </Link>
            </div>
        </nav>
      )}
    </>
  );
}

export default Navbar;