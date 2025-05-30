import os
import json
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time
from collections import defaultdict
import sys
from datetime import datetime
import threading
from dotenv import load_dotenv

load_dotenv()

# Configuration
LOG_FILE = "monitor_output.log"
IGNORE_LOG_FILE = "ignore_events.log"
QUEUE_DELAY_SECONDS = 5
INACTIVITY_TIMEOUT = 30  # Time to wait before resuming processing after inactivity
DEBOUNCE_TIME = 10  # Time to wait before sending API call

# Initialize event queue and flags
event_queue = defaultdict(lambda: {"events": [], "last_event_time": None})
pause_event = threading.Event()
inactivity_timer = threading.Event()

TEMP_FILE_EXTENSIONS = (".tmp", ".swp", ".bak", "~$", ".temp")


def is_temp_file(path):
    """Check if the file is a temporary file based on its extension."""
    _, ext = os.path.splitext(path)
    return ext in TEMP_FILE_EXTENSIONS or os.path.basename(path).startswith("~$")


def get_path_to_remove(directory_to_watch):
    """
    Calculate the PATH_TO_REMOVE to be the parent directory of the last segment.

    Args:
    - directory_to_watch (str): The full directory path.

    Returns:
    - str: The calculated PATH_TO_REMOVE.
    """
    path_segments = directory_to_watch.rstrip("/").split("/")

    if len(path_segments) > 1:
        path_to_remove = "/".join(path_segments[:-1]) + "/"
    else:
        path_to_remove = "/"

    return path_to_remove


def notify_api(directory, api_base_url, event_type):
    """Notify API about file system event."""
    if event_type == "deleted":
        endpoint = "api/storageProvider/deleted"
    else:
        endpoint = "api/storageProvider/folderUpdate"

    path_to_remove = get_path_to_remove(directory_to_watch)
    new_path = directory.replace(path_to_remove, "")
    path = os.path.join(BEGINNING_PATH, new_path)

    api_url = f"{api_base_url}/{endpoint}"
    data = json.dumps({"filePath": path})

    response = requests.post(
        api_url, headers={"Content-Type": "application/json"}, data=data
    )
    # response =200

    with open(LOG_FILE, "a") as log_file:
        timestamp = datetime.now()
        log_file.write(
            f"{timestamp}...Event -> aggregated .... API_URL -> {api_url} .... Path -> {path} .... Response -> {response}\n"
        )


class FileEventHandler(FileSystemEventHandler):
    def on_created(self, event):
        self.handle_event(event, "created")

    def on_deleted(self, event):
        self.handle_event(event, "deleted")

    def on_modified(self, event):
        self.handle_event(event, "modified")

    def on_moved(self, event):
        self.handle_event(event, "moved")

    def handle_event(self, event, event_type):
        if event.is_directory:
            if event_type == "moved":
                self.log_event(event.dest_path, event_type)
            elif event_type == "created":
                self.log_event(event.src_path, event_type)
        elif not is_temp_file(event.src_path):
            if event_type == "moved":
                self.log_event(event.dest_path, event_type)
            elif event_type == "deleted":
                self.log_event(event.src_path, event_type)
            elif event_type == "created":
                self.log_event(os.path.dirname(event.src_path), event_type)

    def log_event(self, path, event_type):
        """Log the event and add it to the queue."""
        current_time = time.time()
        with open(LOG_FILE, "a") as log_file:
            timestamp = datetime.now()
            log_file.write(
                f"{timestamp}...Event -> {event_type} .... Path -> {path} ....\n"
            )

        # Update event queue
        if event_type == "deleted":
            event_queue[path]["events"].append(event_type)
            event_queue[path]["full_path"] = path
            event_queue[path]["last_event_time"] = current_time

        else:
            path_to_check = directory_to_watch
            path_to_check = path_to_check.rstrip("/")
            # Check if any parent directory is already in the event queue
            parent_path = path
            while parent_path != path_to_check:
                parent_path = os.path.dirname(parent_path)
                if event_queue[parent_path]["events"] != []:
                    # Parent directory is already in the queue; skip logging this event
                    return

            event_queue[path]["events"].append(event_type)
            event_queue[path]["last_event_time"] = current_time

        pause_event.set()  # Set the flag to true when an event occurs
        inactivity_timer.set()  # Reset inactivity timer


def process_queue(api_base_url):
    """Process events from the queue."""
    while True:
        pause_event.wait()  # Wait until flag is set
        current_time = time.time()
        for directory, details in event_queue.items():
            if (
                details["last_event_time"]
                and (current_time - details["last_event_time"]) >= DEBOUNCE_TIME
            ):
                notify_api(directory, api_base_url, event_queue[directory]["events"][0])
                # Clear events after processing
                event_queue[directory]["events"] = []
                event_queue[directory]["last_event_time"] = None
        inactivity_timer.set()  # Reset inactivity timer

        # Wait before processing the next batch of events
        time.sleep(QUEUE_DELAY_SECONDS)
        if not event_queue:
            pause_event.clear()  # Clear the flag if no events are present


def monitor_inactivity():
    """Monitor inactivity and reset the pause flag after a timeout."""
    while True:
        if not inactivity_timer.wait(INACTIVITY_TIMEOUT):
            if not event_queue:
                pause_event.clear()  # Clear the flag to pause processing
        else:
            inactivity_timer.clear()  # Reset inactivity timer if an event occurs


def main(directory_to_watch, api_base_url):
    global BEGINNING_PATH
    BEGINNING_PATH = "/usr/src/app/buckets"

    # Start the observer
    event_handler = FileEventHandler()
    observer = Observer()
    observer.schedule(event_handler, path=directory_to_watch, recursive=True)
    observer.start()

    queue_thread = threading.Thread(target=process_queue, args=(api_base_url,))
    inactivity_thread = threading.Thread(target=monitor_inactivity)

    queue_thread.start()
    inactivity_thread.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
    queue_thread.join()
    inactivity_thread.join()


if __name__ == "__main__":

    directory_to_watch = os.getenv("LOCAL_STORAGE_PATH")
    api_base_url = os.getenv("DATALAKE_URL")

    if not os.path.isdir(directory_to_watch):
        print(f"The directory {directory_to_watch} does not exist.")
        exit(1)

    main(directory_to_watch, api_base_url)
