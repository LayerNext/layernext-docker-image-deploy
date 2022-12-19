
PATH_ENV = realpath .env
PATH_DIR = pwd
#change the path to dump.py

(crontab -l 2>/dev/null; echo "* * * * * python3 $PATH_DIR/dump.py $PATH_ENV") | crontab -