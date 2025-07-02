    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App.jsx'; // Ensure this path is correct for App.jsx
    import './index.css'; // Import your Tailwind CSS entry point

    // Import Apollo Client modules
    import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
    import { setContext } from '@apollo/client/link/context';

    // Configure the GraphQL API endpoint
    // This should point to your FastAPI backend's /graphql endpoint
    const httpLink = createHttpLink({
      uri: 'http://127.0.0.1:8000/graphql', // Your backend's GraphQL endpoint
    });

    // Optional: Add authentication headers if you were using them (not needed for this project)
    const authLink = setContext((_, { headers }) => {
      // get the authentication token from local storage if it exists
      // const token = localStorage.getItem('token');
      // return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          // authorization: token ? `Bearer ${token}` : '',
        }
      }
    });

    // Initialize Apollo Client
    const client = new ApolloClient({
      link: authLink.concat(httpLink), // Chain the links (authLink first, then httpLink)
      cache: new InMemoryCache(), // Cache for GraphQL query results
    });

    // Render the React application
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        {/* Wrap the App component with ApolloProvider to make the client available to all components */}
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      </React.StrictMode>,
    );
    