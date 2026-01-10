"""Version information for MAIN Community Bot."""
from pathlib import Path


def get_version() -> str:
    """Read version from VERSION file at project root."""
    # Navigate from app/version.py to project root
    version_file = Path(__file__).parent.parent / "VERSION"
    if version_file.exists():
        return version_file.read_text().strip()
    return "0.0.0"


__version__ = get_version()
BOT_NAME = "MAIN Community Bot"
