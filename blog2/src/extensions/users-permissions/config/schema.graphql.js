module.exports = {
  resolver: {
    Query: {
      role: false,
      roles: false,
      rolesConnection: false,
      user: false,
      users: false,
      usersConnection: false,
      me: false
    },
    Mutation: {
      createRole: false,
      updateRole: false,
      deleteRole: false,
      createUser: false,
      updateUser: false,
      deleteUser: false,
      login: false,
      register: false,
      forgotPassword: false,
      resetPassword: false,
      emailConfirmation: false
    }
  }
};