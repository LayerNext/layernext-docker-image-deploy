PATH_ENV=$(realpath .env)
PATH_DIR=$(realpath ..)
VENV_PYTHON="$PATH_DIR/venv/bin/python3"

(crontab -l 2>/dev/null; echo "0 * * * * $VENV_PYTHON $PATH_DIR/backup/dump.py $PATH_ENV $PATH_DIR") | crontab -