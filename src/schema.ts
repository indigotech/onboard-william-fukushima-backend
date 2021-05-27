import { gql } from "apollo-server";

export const typeDefs = gql`
  type UserType {
    id: Int!
    name: String!
    email: String!
    birthDate: String!
  }

  type HelloResponse {
    hello: String
  }

  type LoginResponse {
    user: UserType!
    token: String!
  }

  type CreateUserResponse {
    id: Int!
    name: String!
    email: String!
    salt: String!
    password: String!
    birthDate: String!
  }

  type PaginatedUsersType{
    users: [UserType]!
    limit: Int!
    offset: Int!
    count: Int!
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
  }

  type Query {
    hello: HelloResponse!
    user(id: Int!): UserType!
    users(offset: Int! = 0,limit: Int! = 10): PaginatedUsersType!
  }

  type Mutation {
    createUser(
      name: String!
      email: String!
      password: String!
      birthDate: String!
    ): CreateUserResponse!

    login(
      email: String!
      password: String!
      rememberMe: Boolean = false
    ): LoginResponse!
  }
`;