
const USERS_KEY = 'cargaExpressUsers_v1';
const CURRENT_USER_KEY = 'cargaExpressCurrentUser_v1';

export const getUsers = () => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error("Error retrieving users from localStorage:", error);
    return [];
  }
};

export const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users to localStorage:", error);
  }
};

export const registerUser = (email, password, role) => {
  const users = getUsers();
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return { success: false, message: 'El correo electrónico ya está registrado.' };
  }
  const newUser = { id: Date.now().toString(), email, password, role };
  saveUsers([...users, newUser]);
  return { success: true, message: 'Usuario registrado exitosamente.', user: newUser };
};

export const loginUser = (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false, message: 'Credenciales incorrectas.' };
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error retrieving current user from localStorage:", error);
    return null;
  }
};
  