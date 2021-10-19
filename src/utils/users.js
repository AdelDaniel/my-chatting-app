const users = [];
const cleanTheVariable = (variable) => variable.trim().toLowerCase();

// add user
const addUser = ({ id, userName, room }) => {
  //validate Data Existance
  if (!userName || !room) {
    return { error: "User Name or room one of them is missed " };
  }

  // clean the data
  userName = cleanTheVariable(userName);
  room = cleanTheVariable(room);

  // check for existing user in the same room
  const isUserExistInTheRoom = users.find((user) => {
    return user.room === room && user.userName === userName;
  });
  if (isUserExistInTheRoom) {
    return { error: "Oops, This User Name is already exist in the Room! " };
  }

  // Adding the new user // store user in users list
  const user = { id, userName, room };
  users.push(user);
  return { user };
};

//remove user
const removeUser = (id) => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    return users.splice(userIndex, 1)[0]; //used to remove item from the array // returned array of elemets removed
  }
  return { error: "Oops, This User Name is Not exist in the Room! " };
};

// get User
const getUser = (id) => users.find((user) => user.id === id);

// get Users In Room
const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
