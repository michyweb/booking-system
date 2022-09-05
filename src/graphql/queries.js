/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPeople = /* GraphQL */ `
  query GetPeople($id: ID!) {
    getPeople(id: $id) {
      id
      name
      number
      drink
      dish
      book
      admin
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listPeople = /* GraphQL */ `
  query ListPeople(
    $filter: ModelPeopleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPeople(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        number
        drink
        dish
        book
        admin
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const listBooking = /* GraphQL */ `
  query ListBooking(
    $filter: ModelBookingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBooking(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        available_seats_per_table
        max_seats
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
