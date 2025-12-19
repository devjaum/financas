import React, { useState } from 'react';
import AuthService from "../services/authService.ts";

import "../styles/components/LoginComponent.css";
import "../styles/patterns/global.css"
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../app.router.ts';

function LoginComponent(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            let aux = await AuthService.login(username, password);
            if(aux){
                setError('');
                //Preciso ir para /home/:id
                navigate(ROUTES.HOME + "/" +username);
                
            }else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className='login-container'>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className='username-field'>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className='password-field'>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className='error'>{error}</p>}
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
    
}

export default LoginComponent;

