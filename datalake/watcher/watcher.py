import os
import json
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time
from collections import deque

# Configuration
API_BASE_URL = "https://datalake.qa-llm.layernext.ai"
BEGINNING_PATH = "/usr/src/app/buckets"
LOG_FILE = "monitor_output.log"
IGNORE_LOG_FILE = "ignore_events.log"
QUEUE_DELAY_SECONDS = 5

# Initialize event queue and seen events tracker
event_queue = deque()  
seen_events = set()  

def get_path_to_remove(directory_to_watch):
    """
    Calculate the PATH_TO_REMOVE to be the parent directory of the last segment.
    
    Args:
    - directory_to_watch (str): The full directory path.
    
    Returns:
    - str: The calculated PATH_TO_REMOVE.
    """
    # Split the path into segments
    path_segments = directory_to_watch.rstrip('/').split('/')
    
    # Remove the last segment
    if len(path_segments) > 1:
        path_to_remove = '/'.join(path_segments[:-1]) + '/'
    else:
        # If the path is just one segment, use an empty path
        path_to_remove = '/'
    
    return path_to_remove

# Function to notify API about file system event
def notify_api(directory, event):
    endpoint = "api/storageProvider/deleted" if event.startswith("deleted") else "api/storageProvider/folderUpdate"
    new_path = directory.replace(PATH_TO_REMOVE, "")
    path = os.path.join(BEGINNING_PATH, new_path)

    api_url = f"{API_BASE_URL}/{endpoint}"
    data = json.dumps({"filePath": path})

    response = requests.post(api_url, headers={"Content-Type": "application/json"}, data=data)
    with open(LOG_FILE, "a") as log_file:
        log_file.write(f"Event -> {event} .... API_URL -> {api_url} .... Path -> {path} .... Response -> {response}\n")

# Function to process events from the queue
def process_queue():
    global event_queue
    while event_queue:
        directory, event = event_queue.popleft()
        notify_api(directory, event)
        seen_events.discard((directory, event))

# Function to handle file system events
class FileEventHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            enqueue_event(os.path.dirname(event.src_path), "created")

    def on_deleted(self, event):
        if not event.is_directory:
            enqueue_event(os.path.dirname(event.src_path), "deleted")

    def on_modified(self, event):
        if not event.is_directory:
            enqueue_event(os.path.dirname(event.src_path), "modified")

    def on_moved(self, event):
        if not event.is_directory:
            enqueue_event(os.path.dirname(event.src_path), "moved")

# Function to enqueue an event
def enqueue_event(directory, event):
    key = (directory, event)
    if key not in seen_events:
        event_queue.append(key)
        seen_events.add(key)
        # Check if no new events occurred during the brief period and process the queue
        time.sleep(QUEUE_DELAY_SECONDS)
        process_queue()

def main(directory_to_watch):
    global PATH_TO_REMOVE
    PATH_TO_REMOVE = get_path_to_remove(directory_to_watch)

    event_handler = FileEventHandler()
    observer = Observer()
    observer.schedule(event_handler, path=directory_to_watch, recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1)
            # Process any remaining events in the queue
            if event_queue:
                process_queue()
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    if len(os.sys.argv) != 2:
        exit(1)
    
    directory_to_watch = os.sys.argv[1]
    if not os.path.isdir(directory_to_watch):
        print(f"The directory {directory_to_watch} does not exist.")
        exit(1)

    main(directory_to_watch)
