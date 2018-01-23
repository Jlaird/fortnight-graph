const User = require('../models/user');
const UserRepo = require('../repositories/user');
const SessionRepo = require('../repositories/session');

module.exports = {
  /**
   *
   */
  Query: {
    ping: () => 'pong',
    currentUser: (root, args, { auth }) => (auth.isValid() ? auth.user : null),
    checkSession: async (root, { input }) => {
      const { token } = input;
      const { user, session } = await UserRepo.retrieveSession(token);
      return { user, session };
    },
  },
  Mutation: {
    createUser: (root, { input }) => {
      const { payload } = input;
      return UserRepo.create(payload);
    },
    loginUser: (root, { input }) => {
      const { email, password } = input;
      return UserRepo.login(email, password);
    },
    deleteSession: async (root, args, { auth }) => {
      if (auth.isValid()) {
        await SessionRepo.delete(auth.session);
      }
      return 'ok';
    },
  },
  User: {
    id: user => user.get('uid'),
  },
  Account: {
    users: (account) => {
      const userIds = account.get('userIds');
      if (!userIds.length) return [];
      return User.find({ _id: { $in: userIds } });
    },
  },
};