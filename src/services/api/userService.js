import users from "@/services/mockData/users.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const UserService = {
  async getAll() {
    await delay(300);
    return users.map(user => ({
      ...user,
      id: user.Id.toString()
    }));
  },

  async getById(id) {
    await delay(250);
    const user = users.find(u => u.Id === parseInt(id));
    if (!user) {
      throw new Error("User not found");
    }
    return {
      ...user,
      id: user.Id.toString()
    };
  },

  async getByUsername(username) {
    await delay(300);
    const user = users.find(u => u.username === username);
    if (!user) {
      throw new Error("User not found");
    }
    return {
      ...user,
      id: user.Id.toString()
    };
  },

  async getCurrentUser() {
    await delay(200);
    // Mock current user - in real app would get from auth context
    const user = users.find(u => u.Id === 1);
    return {
      ...user,
      id: user.Id.toString()
    };
  },

  async update(id, userData) {
    await delay(400);
    const userIndex = users.findIndex(u => u.Id === parseInt(id));
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    
    const updatedUser = {
      ...users[userIndex],
      ...userData,
      Id: users[userIndex].Id
    };
    
    users[userIndex] = updatedUser;
    
    return {
      ...updatedUser,
      id: updatedUser.Id.toString()
    };
  },

  async search(query) {
    await delay(300);
    const filteredUsers = users.filter(user =>
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.displayName.toLowerCase().includes(query.toLowerCase())
    );
    
    return filteredUsers.map(user => ({
      ...user,
      id: user.Id.toString()
    }));
  }
};