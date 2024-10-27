import sys
from pathlib import Path

from loguru import logger

logger.remove()

# file handler
logger.add(
    sink=Path("logs", "backend_{time:YYYY-MM-DD}.log"),
    rotation="1 day",
    level="DEBUG",
)

# console handler
logger.add(sink=sys.stdout, level="DEBUG", colorize=True)

__all__ = ["logger"]
