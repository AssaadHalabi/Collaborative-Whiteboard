<div align="center">
  <br />
    <a href="https://assaadportfolio.vercel.app" target="_blank">
      <img src="Frontend/public/assets/logos.svg" alt="Project Banner">
    </a>
  <br />

  <div>
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logo=typescript&logoColor=white&color=3178C6" alt="TypeScript" />
    <img src="https://img.shields.io/badge/-Next_JS-black?style=for-the-badge&logo=nextdotjs&logoColor=white&color=000000" alt="Next.js" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logo=tailwindcss&logoColor=white&color=06B6D4" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white&color=6DA55F" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express" />
    <img src="https://img.shields.io/badge/-Prisma-black?style=for-the-badge&logo=prisma&logoColor=white&color=2D3748" alt="Prisma" />
    <img src="https://img.shields.io/badge/-AWS-black?style=for-the-badge&logo=amazon-web-services&logoColor=white&color=FF9900" alt="AWS" />
    <img src="https://img.shields.io/badge/-Stripe-black?style=for-the-badge&logo=stripe&logoColor=fff&color=5851DD" alt="Stripe" />
  </div>

  <h3 align="center">Real-Time Collaborative Whiteboard</h3>

   <div align="center">
     Bring your team together with a powerful whiteboard tool.
    </div>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#🤖-introduction)
2. ⚙️ [Tech Stack](#⚙️-tech-stack)
3. 🔋 [Features](#🔋-features)
   -  [🎨 Frontend Features ](#🎨-frontend-features)
   -  [💽 Backend Features ](#💽-backend-features)
   -  [🤼 Collaborative Features ](#🤼-collaborative-features)
4. 🤸 [Quick Start](#🤸-quick-start)
5. 🕸️ [Snippets](#🕸️-snippets)
6. 🔗 [Links](#🔗-links)
7. 🚀 [More](#🚀-more)


## <a name="introduction">🤖 Introduction</a>

CollaBoard is a real-time collaborative whiteboard that enables teams to collaborate on conceptualizing and creatively expressing their ideas with features like live user collaboration with cursor chat, comments, reactions, and drawing designs (shapes, image upload) on the canvas using fabric.js. The premium tier offers unlimited rooms for an unlimited number of users to collaborate on a fully featured whiteboard. Our free tier allows up to 2 rooms.

This could be used as a series of products; a tech team could ideate on CollaBoard and conceptualize. And then prototype their software ideas quickly on JsColab, our zero-setup notebook-based JavaScript environment for fast prototyping, inspired by Google Colab, but for JavaScript and React.



<a href="https://github.com/AssaadHalabi/JsColab" target="_blank"><img width="120px" src="https://raw.githubusercontent.com/AssaadHalabi/JsColab/main/Frontend/public/jscolab.png" /></a>

## <a name="tech-stack">⚙️ Tech Stack</a>

- Next.js
- TypeScript
- Liveblocks
- Fabric.js
- Shadcn
- Tailwind CSS
- Node.js
- Express.js
- Prisma
- Stripe

## <a name="features">🔋 Features</a>
### 🎨 *Frontend Features*  
👉 **Pricing Page**: Details the subscription options available for users, including the benefits of each tier.

👉 **Lobby**: A hub for creating and joining rooms, making it easy to start or join a collaborative session.

👉 **Sign In / Sign Out**: Secure authentication to access personalized features and rooms.

👉 **Forgot Password / Reset Password**: Functionality to recover and reset passwords securely.

👉 **User Profile**: Allows users to view and change their avatar, see joined and owned rooms, and check and change subscription status.

👉 **Coming Soon Page**: A page for upcoming features and updates.

### 💽 *Backend Features* 
👉 **JWT Authentication**: Secure authentication using JSON Web Tokens with access and refresh tokens to manage user sessions.

👉 **User Management**: Endpoints for user-related actions such as log in, sign up, forgot password, refresh token, and check authentication status.

👉 **Room Management**: Endpoints to create, join, and manage rooms, including tracking active users.

👉 **Subscriptions**: Integration with Stripe for handling subscriptions, including checkout and webhook handling for real-time updates.

### 🤼 *Collaborative Features*

👉 **Multi Cursors, Cursor Chat, and Reactions**: Enables multiple users to collaborate simultaneously by showing individual cursors, facilitating real-time chat, and providing reactions for interactive communication.

👉 **Active Users**: Displays a list of currently active users in the collaborative environment, providing visibility into who is currently engaged.

👉 **Comment Bubbles**: Allows users to attach comments to specific elements on the canvas, fostering communication and feedback on design components.

👉 **Creating Different Shapes**: Provides tools for users to generate a variety of shapes on the canvas, allowing for diverse design elements.

👉 **Uploading Images**: Users can import images onto the canvas, expanding the range of visual content in the design.

👉 **Customization**: Users can adjust the properties of design elements, offering flexibility in customizing and fine-tuning visual components.

👉 **Freeform Drawing**: Users can draw freely on the canvas, promoting artistic expression and creative design, or sketching ideas.

👉 **Undo/Redo**: Users can reverse (undo) or restore (redo) previous actions, providing flexibility in design decision-making.

👉 **Keyboard Actions**: Users can utilize keyboard shortcuts for various actions, including copying, pasting, deleting, and triggering shortcuts for features like opening cursor chat and reactions.

👉 **History**: Users can review the chronological history of actions and changes made on the canvas, aiding in project management and version control.

👉 **Managing Canvas Elements**: Provides functions for managing design elements, including deletion, scaling, moving, clearing the canvas, and exporting the final design for external use as PDF.


## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- [Stripe CLI](https://docs.stripe.com/stripe-cli)

**Cloning the Repository**

```bash
git clone https://github.com/AssaadHalabi/Collaborative-Whiteboard.git
cd Collaborative-Whiteboard
```

**Installation and Setup**

- Go to <a href="https://render.com" title="Render">Render</a> and create a free PostgreSQL database, and copy the External Database URL
- Create a Stripe account and copy the secret key
- Set up [Stripe webhooks locally](https://docs.stripe.com/connect/webhooks#test-webhooks-locally) in a separate terminal and obtain the STRIPE_WEBHOOK_SECRET and set the forward route to localhost:4000/api/webhooks/stripe for checkout to be handled successfully.
- Create an AWS account, then create an S3 bucket in the account and generate your access key and secret access key
- Create an account and project on [Liveblocks](https://liveblocks.io), then obtain your credentials.
- Create the access and refresh token secrets for jsonwebtoken.
- Use your Gmail and generate an app password after enabling 2FA.

Install the Frontend and Backend project dependencies using npm, use two terminals one for the Backend and one for the Frontend directories, execute each block in a separate terminal:

```bash
# Backend terminal
cd Backend
npm install
```

```bash
# Frontend terminal
cd Frontend
npm install
```

**Set Up Environment Variables**

Create a new file named `.env.local` in the Frontend directory and add the following content:

```env
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=
NEXT_PUBLIC_LIVEBLOCKS_SECRET_KEY=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_STRIPE_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Create a new file named `.env` in the Backend directory and add the following content:

```env
DATABASE_URL=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
GMAIL_USER=
GMAIL_APP_PASSWORD=
FRONTEND_URL=
STRIPE_TEST_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
LIVEBLOCKS_PUBLIC_KEY=
LIVEBLOCKS_SECRET_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
AWS_REGION=
```

Replace the placeholder values with your actual credentials. You can obtain these credentials by following the steps specified before.


**Database Schema Generation**

Run the below command using the Backend terminal: 
```bash
# Backend terminal
npm run dbgen
```


**Running the Project**

```bash
# Backend terminal
npm start
```

```bash
# Frontend terminal
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

## <a name="snippets">🕸️ Snippets</a>

### Styles

<details>
<summary><code>tailwind.config.ts</code></summary>

```typescript
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          black: "#14181F",
          green: "#56FFA6",
          grey: {
            100: "#2B303B",
            200: "#202731",
            300: "#C4D3ED",
          },
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
```

</details>

<details>
<summary><code>app/globals.css</code></summary>


```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "@liveblocks/react-comments/styles.css";

* {
  font-family:
    work sans,
    sans-serif;
}

@layer utilities {
  .no-ring {
    @apply outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 !important;
  }

  .input-ring {
    @apply h-8 rounded-none border-none  bg-transparent outline-none ring-offset-0 focus:ring-1  focus:ring-primary-green focus:ring-offset-0 focus-visible:ring-offset-0 !important;
  }

  .right-menu-content {
    @apply flex w-80 flex-col gap-y-1 border-none bg-primary-black py-4 text-white !important;
  }

  .right-menu-item {
    @apply flex justify-between px-3 py-2 hover:bg-primary-grey-200 !important;
  }
}
```
</details>


### Security/Authentication

<details>
<summary><code>generateSecrets.ts</code></summary>

```javascript
const crypto = require('crypto');

const accessTokenSecret = crypto.randomBytes(64).toString('hex');
const refreshTokenSecret = crypto.randomBytes(64).toString('hex');

console.log('Access Token Secret:', accessTokenSecret);
console.log('Refresh Token Secret:', refreshTokenSecret);

// copy the values from the command line and paste them in Backend .env
```

</details>


## <a name="links">🔗 Links</a>

- [Assaad El Halabi](https://assaadportfolio.vercel.app/)
- [LinkedIn](https://www.linkedin.com/in/assaad-el-halabi-585b92197)

## <a name="more">🚀 More</a>

**Prototype a new Idea or learn React and JavasCript**

What's better than drawing your ideas with a team into reality with ***CollaBoard***? Playing around with new small prototype ideas on 

<br/>

<a href="https://github.com/AssaadHalabi/JsColab" target="_blank"><img src="https://raw.githubusercontent.com/AssaadHalabi/JsColab/main/Frontend/public/jscolab.png" alt="Project Banner" /></a>


<br />
<br />


