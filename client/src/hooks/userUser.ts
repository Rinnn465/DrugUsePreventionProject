// useUser.ts
import { useContext } from 'react';
import { UserContext } from '../components/Layout';

export const useUser = () => useContext(UserContext);
