import gql from 'graphql-tag';

export const searchUsers = gql`
  query searchUsers($query: String!, $first: Int = 10) {
    search(query: $query, type: USER, first: $first) {
      nodes {
        ... on User {
          id
          name
          email
          login
        }
      }
    }
  }
`;

export const getCurrentUser = gql`
  query getCurrentUser {
    viewer {
      login
    }
  }
`;

export const searchRepositories = gql`
  query searchRepositories($query: String!, $first: Int = 10) {
    search(query: $query, type: REPOSITORY, first: $first) {
      nodes {
        ... on Repository {
          id
          name
          owner {
            login
          }
        }
      }
    }
  }
`

export const getPullRequestsForRepo = gql`
  query getPullRequestsForRepo($owner: String!, $name: String!, $states: [PullRequestState!], $first: Int = 10) {
    repository(owner: $owner, name: $name) {
      pullRequests(first: $first, states: $states) {
        nodes {
          id
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
  }
`;

export const getPullRequestsForUser = gql`
  query getPullRequestsForUser($user: String!, $states: [PullRequestState!], $first: Int = 10) {
    user(login: $user) {
      pullRequests(first: $first, states: $states) {
        nodes {
          id
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

export const getPullRequestComments = gql`
  query getPullRequestComments($owner: String!, $name: String!, $number: Int!, $first: Int = 20) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
        comments(first: $first) {
          nodes {
            id
            author {
              login
            }
            body
            createdAt
            updatedAt
          }
          totalCount
        }
      }
    }
  }
`;

export const mergePullRequest = gql`
  mutation mergePullRequest($input: MergePullRequestInput!) {
    mergePullRequest(input: $input) {
      pullRequest {
        mergeable
      }
    }
  }
`;

export const closePullRequest = gql`
  mutation closePullRequest($input: ClosePullRequestInput!) {
    closePullRequest(input: $input) {
      pullRequest {
        state
      }
    }
  }
`;


export const addComment = gql`
  mutation addComment($input : AddCommentInput!) {
    addComment(input: $input) {
      commentEdge {
        node {
          id
          author {
            login
          }
          body
          createdAt
        }
      }
    }
  }
`;

export const getIssuesForRepo = gql`
  query getIssuesForRepo($owner: String!, $name: String!, $first: Int = 10) {
    repository(owner: $owner, name: $name) {
      issues(first: $first) {
        nodes {
          id
          number
          title
          url
          createdAt
          author {
            login
          }
          state
        }
        totalCount
      }
    }
  }
`;

export const getIssuesForUser = gql`
  query getIssuesForUser($user: String!, $first: Int = 10) {
    user(login: $user) {
      issues(first: $first) {
        nodes {
          id
          number
          title
          url
          createdAt
          author {
            login
          }
          state
        }
        totalCount
      }
    }
  }
`;

export const getIssueComments = gql`
  query getIssueComments($owner: String!, $name: String!, $number: Int!, $first: Int = 20) {
    repository(owner: $owner, name: $name) {
      issue(number: $number) {
        comments(first: $first) {
          nodes {
            id
            author {
              login
            }
            body
            createdAt
            updatedAt
          }
          totalCount
        }
      }
    }
  }
`;

export const createIssue = gql`
  mutation createIssue($input: CreateIssueInput!) {
    createIssue(input: $input) {
      issue {
        id
      }
    }
  }
`;

export const closeIssue = gql`
  mutation closeIssue($input: CloseIssueInput!) {
    closeIssue(input: $input) {
      issue {
        state
      }
    }
  }
`;

export const operations =  [
  searchUsers,
  getCurrentUser,
  addComment,
  searchRepositories,
  getPullRequestsForRepo,
  getPullRequestsForUser,
  getPullRequestComments,
  mergePullRequest,
  closePullRequest,
  getIssuesForRepo,
  getIssuesForUser,
  createIssue,
  closeIssue,
  getIssueComments
];
