class LoadUserByEmailRepository {
  constructor(userModel) {
    this.userModel = userModel;
  }
  async load(email) {
    const user = this.userModel.findOne(
      {
        email,
      },
      {
        projection: {
          password: 1,
        },
      }
    );

    return user;
  }
}

module.exports = {
  LoadUserByEmailRepository,
};
