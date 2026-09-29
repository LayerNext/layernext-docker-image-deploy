PATH_ENV=$(realpath .env)
PATH_DIR=$(realpath ..)
VENV_PYTHON="$PATH_DIR/venv/bin/python3"

(crontab -l 2>/dev/null; echo "*/5 * * * * cd $PATH_DIR/alert && $VENV_PYTHON $PATH_DIR/alert/alert.py >> $PATH_DIR/alert/alert.log 2>&1") | crontab -
