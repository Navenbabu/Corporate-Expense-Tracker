import React, { createContext, useState, useEffect, useContext } from 'react';

export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkRole: (roles: UserRole[]) => boolean;
  addUser: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial mock users
const INITIAL_MOCK_USERS = [
  {
    id: '1',
    name: 'John Employee',
    email: 'employee@example.com',
    password: 'password123',
    role: 'employee' as UserRole,
    department: 'Marketing',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager' as UserRole,
    department: 'Finance',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: '3',
    name: 'David Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    department: 'Operations',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg'
  },
  {
    id: '4',
    name: 'Emily Johnson',
    email: 'emily@example.com',
    password: 'password123',
    role: 'employee' as UserRole,
    department: 'Sales',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
  },
  {
    id: '5',
    name: 'Michael Chen',
    email: 'michael@example.com',
    password: 'password123',
    role: 'manager' as UserRole,
    department: 'Engineering',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize users in localStorage if not present
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      localStorage.setItem('users', JSON.stringify(INITIAL_MOCK_USERS));
    }
    
    // Check for saved user session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const getAllUsers = () => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  };

  const addUser = async (userData: Omit<User, 'id'> & { password: string }) => {
    const users = getAllUsers();
    
    // Check if email already exists
    if (users.some((u: User) => u.email === userData.email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      ...userData,
      id: Date.now().toString(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const users = getAllUsers();
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      // Remove password before storing user
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const checkRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        loading, 
        login, 
        logout,
        checkRole,
        addUser,
        getAllUsers
      }}
    >
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