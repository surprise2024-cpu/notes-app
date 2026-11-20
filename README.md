# Notify — Notes App

Notify is a simple and easy-to-use notes application built with React Native, Expo and TypeScript. It allows users to create, organize and manage their notes in one place.

## Features

- **User Authentication** — Register, log in and log out securely.
- **Password Recovery** — Reset a forgotten password using a recovery code.
- **Notes Management** — Create, view, edit and delete notes.
- **Categories** — Organize notes into Work, Study and Personal.
- **Search** — Find notes by title or content.
- **Sorting** — Sort notes by newest or oldest.
- **Profile Management** — Update your username and change your password.
- **Local Storage** — Notes and account information are stored on the device.
- **Responsive Interface** — Clean layout with popup forms and a navigation sidebar.

## Tech Stack

| Technology                | Purpose                        |
| ------------------------- | ------------------------------ |
| React Native              | Mobile application development |
| Expo                      | Development and Android builds |
| TypeScript                | Type-safe application code     |
| Expo Router               | Navigation                     |
| AsyncStorage              | Local data persistence         |
| Expo SecureStore          | Session storage on mobile      |
| Zod                       | Form validation                |
| React Native Quick Crypto | Password hashing               |
| Lucide React Native       | Icons                          |

## Download APK

Install Notify on your Android device using the APK from the Expo build page:

**[Google Drive](https://drive.google.com/file/d/1yRqAoeUnq_U9iy58Cdzzn6zX_ER5uVKQ/view?usp=sharing)**

Open the link, download the APK and install it on your Android device.

_Note: Android may request permission to install an application from outside the Google Play Store._

## Run Locally

### Prerequisites

- Node.js and npm
- An Android device or emulator
- Expo Go for supported development workflows, or a custom development build for native modules

### Installation

**1. Clone the repository**

```bash
git clone <https://github.com/surprise2024-cpu/notes-app.git>
cd notes-app
```

**2. Install dependencies**

```bash
npm install
```

**3. Start the development server**

```bash
npx expo start
```

**4. Run the application**

Use a compatible Android development build or emulator to run the application.

Because Notify uses native cryptography, the application cannot run directly in the standard Expo Go client.

## Build Android APK

To generate an installable Android APK using Expo Application Services (EAS):

```bash
npx eas-cli@latest build --platform android --profile preview
```

Once the build succeeds, download the APK from the link provided by Expo.

## Data Storage

Notify stores user accounts and notes locally using AsyncStorage. Passwords are stored as salted PBKDF2 hashes, while mobile session identifiers are saved using Expo SecureStore.

**Important:** Notify is a local-first application. Data is not synchronized between devices, and uninstalling the app may erase locally stored information.
