import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, AuthContextType, DUMMY_CREDENTIALS, ROLE_PERMISSIONS, Role } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('hostel_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('hostel_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials against dummy data
    const matchedRole = Object.entries(DUMMY_CREDENTIALS).find(
      ([role, creds]) => 
        creds.username === credentials.username && 
        creds.password === credentials.password
    );

    if (matchedRole) {
      const [role] = matchedRole;
      const newUser: User = {
        id: `${role.toLowerCase()}_001`,
        username: credentials.username,
        email: `${credentials.username}@hostel.edu`,
        role: role as Role,
        fullName: getFullNameByRole(role as Role),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.username}`,
        blockAssigned: role === 'Warden' ? 'Block A' : undefined,
        permissions: ROLE_PERMISSIONS[role as Role]
      };

      setUser(newUser);
      localStorage.setItem('hostel_user', JSON.stringify(newUser));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${newUser.fullName}!`,
        variant: "default"
      });
      
      setLoading(false);
      return true;
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hostel_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
      variant: "default"
    });
  };

  const getFullNameByRole = (role: Role): string => {
    const names = {
      Admin: 'Dr. Sarah Johnson',
      Warden: 'Mr. Michael Chen',
      Management: 'Ms. Emily Rodriguez',
      Student: 'Alex Thompson'
    };
    return names[role];
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};