# GEMINI.md

## Project Overview

This project is a feature-rich Telegram bot built with Python and the `aiogram` library. It serves as an admin bot for a community, providing a wide range of functionalities including:

*   **User Management:** Tracking users, their roles, and activities.
*   **Content Moderation:** Tools for warning, banning, and deleting messages.
*   **News Aggregation:** A system for monitoring external channels, adapting content using AI, and publishing it after moderation.
*   **Event Management:** Creating and managing events, handling user registrations, and sending reminders.
*   **User Matching:** A "Tinder-like" system for users to connect with each other.
*   **Feedback Collection:** Gathering feedback from users after events.

The bot uses `SQLAlchemy` for database interaction with a SQLite backend, and it's designed to be deployed using Docker.

## Building and Running

### Local Development

1.  **Prerequisites:**
    *   Python 3.10+
    *   `virtualenv`

2.  **Setup:**
    *   Create a `.env` file based on `.env.example` and fill in the required values, especially `BOT_TOKEN` and `ADMIN_IDS`.
    *   Run the local setup script:
        ```bash
        bash scripts/run_local.sh
        ```
        This will create a virtual environment, install dependencies, and start the bot.

### Docker

1.  **Prerequisites:**
    *   Docker
    *   Docker Compose

2.  **Build and Run:**
    *   Ensure your `.env` file is correctly configured.
    *   Run the following command:
        ```bash
        docker compose up --build
        ```

## Deployment

The project includes several deployment options, with a focus on automation.

*   **Automated Deployment:** The recommended approach is to set up automated deployments via Git push. The `AUTO_DEPLOY_README.md` and `QUICK_DEPLOY_GUIDE.md` files provide detailed instructions for configuring this with Git Cron or webhooks.
*   **Manual Deployment:** For smaller changes, the `deploy_files.sh` script can be used to copy specific files to the server. After copying, you need to manually run migrations and restart the Docker container.

## Development Conventions

*   **Modular Structure:** The application is organized into modules for handlers, database models, and services.
*   **Dependency Management:** Python dependencies are managed with `pip` and a `requirements.txt` file.
*   **Configuration:** Application settings are loaded from environment variables and a `.env` file.
*   **Database Migrations:** The project appears to use a manual migration system, with scripts in the `migrations` directory.
*   **Linting and Formatting:** While not explicitly defined, the code seems to follow a consistent style. It's recommended to use a linter like `flake8` and a formatter like `black` to maintain code quality.
