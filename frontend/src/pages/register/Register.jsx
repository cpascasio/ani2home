import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../config/firebase-config'; // Adjust the import path as necessary

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleEmailSignUp = async (email, password) => {
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log(userCredential.user);
            // Update authenticated state or perform other actions
            // setAuthenticated(true);
            // window.localStorage.setItem('authenticated', 'true');
            // const tokenResult = await userCredential.user.getIdTokenResult();
            // setToken(tokenResult.token);
        } catch (error) {
            console.error(error.message);
            setError(error.message);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleEmailSignUp(email, password);
    };

    return (
        <div>
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default Register;