from pydantic_settings import BaseSettings, SettingsConfigDict
import os

# Build an absolute path to the .env file.
# This ensures it's found correctly, no matter where the script is run from.
env_path = os.path.join(os.path.dirname(__file__), '.env')

class Settings(BaseSettings):
    # This will automatically read the variable from the .env file
    gemini_api_key: str
    google_application_credentials: str

    # Tell pydantic to look for a .env file at the specified absolute path
    model_config = SettingsConfigDict(env_file=env_path)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert relative path to absolute path for Firebase credentials
        if not os.path.isabs(self.google_application_credentials):
            base_dir = os.path.dirname(os.path.dirname(__file__))  # Go up to project root
            self.google_application_credentials = os.path.join(base_dir, self.google_application_credentials)

# Create a single instance of the settings to be used throughout the app
settings = Settings()