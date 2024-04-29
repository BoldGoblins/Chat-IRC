# Internet Relay Chat (IRC) Client and Server - EPI-IRC

This project consists of an IRC server built with [Node.js](https://nodejs.org) and [Express.js](https://expressjs.com) and an IRC client developed with [React.js](https://react.dev). The server supports multiple simultaneous connections and implements channels with various functionalities.

---

## Server

The server is built using [Node.js](https://nodejs.org) and [Express.js](https://expressjs.com), allowing for efficient handling of HTTP requests and WebSocket connections.

### Features

- Accepts multiple simultaneous connections.
- Implements channels with the following functionalities:
  - Joining multiple channels simultaneously.
  - Creating and deleting channels.
  - Displaying a message when a user joins or leaves a channel.
  - Allowing users to speak in the channels they have joined.
- Uses [Socket.IO](https://socket.io) for real-time communication between the server and the client.
- Supports persistence of channels and messages with [MongoDB](mongodb.com) database.

### Installation and Usage

1. Clone the repository:
  ```bash
  git clone git@github.com:EpitechMscProPromo2026/T-JSF-600-STG_13.git
  ```
2. Install dependencies:
  ```bash
  cd server
  npm install
  ```
3. Update the MongoDB URL:
  - Open ``server/index.ts`` file.
  - Locate the **``MONGO_URL``** variable.
  - Add the connection string of your [MongoDB](mongodb.com) database here.
    - It should look like that:
```base
const MONGO_URL = mongodb+srv://<user>:<password>@[...].mongodb.net/?retryWrites=true&w=majority
```
4. Start the server:
  ```bash
  npm start
  ```
5. Access the server on [localhost:4000](http://localhost:4000/).

---

## Client

The client is developed with [React.js](https://react.dev), providing a user-friendly interface for interacting with the IRC server.

### Features

- Supports various commands for user actions, including:
  - Setting a nickname.
  - Listing available channels.
  - Creating and deleting channels.
  - Joining and quitting channels.
  - Listing users in a channel.
  - Sending private messages.
  - Sending messages to all users in a channel.

#### Commands

- Supports various commands for user actions directly in the chat, including:
  - /nick *nickname*: Define the nickname of the user on the server.
  - /list *[string]*: List the available channels from the server. If *string* is specified, only display those whose name contains the string.
  - /create *channel*: Create a channel with the specified name.
  - /delete *channel*: Delete the channel with the specified name.
  - /join *channel*: Join the specified channel.
  - /quit *channel*: Quit the specified channel.
  - /users: List the users currently in the channel.
  - /msg *nickname* message: Send a **private message** to the specified *nickname*.
  - message: Send a message to all the users on the channel.

### Installation and Usage

1. Install dependencies:
  ```bash
  cd client
  npm install
  ```
2. Start the server:
  ```bash
  npm start
  ```
3. Access the server on [localhost:3000](http://localhost:3000/).

## Communication Protocol

The client and server communicate with each other using WebSocket, facilitated by the [Socket.IO](https://socket.io) library.

## Additional Notes

Authentication system is implemented, but only on login to set username.
The persistence of channels and messages is crucial for maintaining data integrity and continuity across sessions.
You can also send links and images in the chat but only if the image is in link format.
Contributions and feedback are welcome. Feel free to submit issues or pull requests.

---

## Contact

If you have any questions or need assistance, feel free to reach out to the project maintainers:

- Lucas: [lucas.fixari@epitech.eu](mailto:lucas.fixari@epitech.eu)
- William: [william.woziwoda@epitech.eu](mailto:william.woziwoda@epitech.eu)
- Setayesh: [setayesh.ghamat@epitech.eu](mailto:setayesh.ghamat@epitech.eu)

## License

This project is licensed under the [MIT License](LICENSE).
