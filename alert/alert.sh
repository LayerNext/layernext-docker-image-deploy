
PATH_DIR=$(realpath .)

(crontab -l 2>/dev/null; echo "*/5 * * * * python3 $PATH_DIR/alert.py  >>  $PATH_DIR/output.log 2>&1") | crontab -