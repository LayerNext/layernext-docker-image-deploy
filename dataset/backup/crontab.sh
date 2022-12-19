
#change the path to dump.py

(crontab -l 2>/dev/null; echo "0 * * * * python3 /home/........./backup/dump.py") | crontab -