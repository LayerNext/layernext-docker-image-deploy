
PATH_ENV=$(realpath .env)
PATH_DIR=$(realpath ..)
#change the path to dump.py

(crontab -l 2>/dev/null; echo "0 * * * * python3 $PATH_DIR/backup/dump.py $PATH_ENV $PATH_DIR") | crontab -