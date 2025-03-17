import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
    authUserId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useStoredAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useConvexAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authUserId, setAuthUserId] = useState<string | null>(null);
    const { userId } = useAuth();

    const user = useQuery(api.users.getUserByClerkId, userId ? { clerkId: userId } : 'skip');

    useEffect(() => {
        if (user) {
            setAuthUserId(user._id); // Assuming `_id` is the correct field for authUserId
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ authUserId }}>
            {children}
        </AuthContext.Provider>
    );
};