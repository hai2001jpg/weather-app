import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const schema = yup.object().shape({
  name: yup.string().required('Meno a priezvisko je povinné.').min(3, 'Meno a priezvisko musí obsahovať aspoň 3 znaky.'),
  username: yup.string().required('Prihlasovacie meno je povinné.').min(3, 'Prihlasovacie meno musí obsahovať aspoň 3 znaky.'),
  password: yup.string().min(6, 'Heslo musí obsahovať aspoň 6 znakov.').required('Heslo je povinné.'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Heslá sa nezhodujú.')
    .required('Potvrdťe heslo, prosím.'),
});

const Signup = ({ onSignup }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });
  
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    setApiError(null);
    setSuccess(false);
    try {
      const response = await axios.post('http://localhost:5000/api/signup', {
        name: data.name,
        username: data.username,
        password: data.password
      });
      setSuccess(true);
      reset();
      onSignup && onSignup(response.data.user);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setApiError(err.response.data.error);
      } else {
        setApiError('Chyba pripojenia k serveru.');
        console.error(err);
      }
    }
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-md w-[20%] gap-4">
            <h2 className='text-4xl font-[Montserrat] font-bold text-center'>Registrácia</h2>
            <hr className='w-[90%] border-b border-gray-300 mb-4'/>
            {apiError && <p className="text-red-500">{apiError}</p>}
            {success && <p className="text-green-600">Registrácia bola úspešná!</p>}
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col items-center gap-4 w-full'>
                <input 
                type='text'
                placeholder='Zadajte meno a priezvisko'
                className='border-2 border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500 w-full'
                {...register('name')}
                />
                {errors.name && <p className="error">{errors.name.message}</p>}
                
                <input
                type="text"
                placeholder="Zadajte prihlasovacie meno"
                {...register('username')}
                className='border-2 border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500 w-full'
                />  
                {errors.username && <p className="error">{errors.username.message}</p>}

                <input
                type="password"
                placeholder="Zadajte heslo"
                {...register('password')}
                className='border-2 border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500 w-full'
                />
                {errors.password && <p className="error">{errors.password.message}</p>}

                <input
                type="password"
                placeholder="Potvrďte vaše heslo"
                {...register('confirmPassword')}
                className='border-2 border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500 w-full'
                />
                {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}

                <button type="submit" className='w-min  py-2 px-4 rounded-xl font-[Montserrat] bg-blue-500 text-white
                     hover:bg-blue-700 transition-colors duration-300'>Registrovať</button>
            </form>
            <p className='text-sm text-gray-500'> Už máte účet? 
                <Link to="/login" className='text-blue-500 hover:underline'>
                Prihláste sa
                </Link>
            </p>
            <Link to="/" className='text-blue-500 hover:underline text-sm'>
                Späť na domovskú stránku
            </Link>
        </div>
    </div>
  );
}

export default Signup;