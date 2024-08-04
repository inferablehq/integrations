import gql from "graphql-tag";

export const openPullRequests = gql`query OpenPullRequests($owner: String!, $name: String!, $first: Int = 10) {
  repository(owner: $owner, name: $name) {
    pullRequests(first: $first, states: OPEN) {
      nodes {
        number
        title
        url
        createdAt
        author {
          login
        }
        baseRefName
        headRefName
      }
      totalCount
    }
  }
}`
