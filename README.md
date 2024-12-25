# QueryNest Server-Side

QueryNest is a server-side application designed to manage and handle queries and recommendations efficiently. It serves as the backend for the QueryNest project, providing RESTful APIs to manage user authentication, query data, and recommendations.

## Live URL
The live version of QueryNest can be accessed at:

- [QueryNest Live](https://querynest-8df96.web.app)

## Purpose
The primary purpose of this project is to facilitate seamless handling of user-generated queries and recommendations. It includes user authentication, data storage, retrieval, and management functionalities, ensuring a secure and efficient system for users.

## Key Features

### 1. **Authentication**
- JWT-based user authentication.
- Secure cookie storage for tokens.
- Login and logout functionality with token expiration management.

### 2. **Queries Management**
- Add new queries with proper authorization.
- Retrieve all queries with optional search and limit functionality.
- Fetch user-specific queries securely.
- Update and delete specific queries.

### 3. **Recommendations Management**
- Add recommendations linked to specific queries.
- Manage user's recommendations (view and delete).
- Fetch recommendations intended for a user.

### 4. **Popular Queries**
- Retrieve top queries based on recommendation counts.

## Endpoints
### Authentication
- `POST /jwt-singIn`: Sign in and receive a JWT.
- `POST /jwt-logout`: Logout by clearing the JWT cookie.

### Queries
- `POST /add-queries`: Add a new query (authorized).
- `GET /my-queries`: Retrieve user-specific queries (authorized).
- `GET /all-queries`: Retrieve all queries with optional search and limit.
- `GET /querie-details/:id`: Get details of a specific query (authorized).
- `PATCH /query-update/:id`: Update a specific query (authorized).
- `DELETE /my-querie/:id`: Delete a specific query (authorized).

### Recommendations
- `POST /add-recommendations`: Add a new recommendation.
- `GET /my-recommendation/:email`: Fetch user-specific recommendations (authorized).
- `DELETE /my-recommendation/:id`: Delete a specific recommendation.
- `GET /recommendation-for-me/:email`: Fetch recommendations intended for the user (authorized).

### Popular Queries
- `GET /popular-queries`: Retrieve top 5 queries based on recommendation count.

## NPM Packages Used

1. **dotenv**: For environment variable management.
   - Version: ^16.4.7
2. **express**: Framework for creating the server and handling routes.
   - Version: ^4.21.2
3. **cors**: Middleware for handling Cross-Origin Resource Sharing.
   - Version: ^2.8.5
4. **jsonwebtoken**: For secure user authentication using JWT.
   - Version: ^9.0.2
5. **cookie-parser**: Middleware for parsing cookies in incoming requests.
   - Version: ^1.4.7
6. **mongodb**: MongoDB driver for database operations.
   - Version: ^6.12.0
7. **vercel**: For deploying the project on Vercel.
   - Version: ^39.2.2