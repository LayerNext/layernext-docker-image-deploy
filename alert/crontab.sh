PATH_ENV=$(realpath .env)
PATH_DIR=$(realpath ..)
VENV_PYTHON="$PATH_DIR/venv/bin/python3"

# Run alert every 5 minutes (adjust schedule as needed)
(crontab -l 2>/dev/null; echo "*/5 * * * * $VENV_PYTHON $PATH_DIR/alert/alert.py") | crontab -
