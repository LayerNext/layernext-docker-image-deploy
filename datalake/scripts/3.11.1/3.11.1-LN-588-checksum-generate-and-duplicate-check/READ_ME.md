# checksum generate folder setup instructions


1. Create virtual environment file

Commands
    1.  python3 -m venv venv
    2.  source venv/bin/activate

2. create logs folder and scripts folder(you can choose any name) As show below 

project_root/
│
├── logs/
│   └── [log_files]
│
├── scripts/
│   └── 3.11.1-LN-588-checksum-generate-and-duplicate-checking.py
│
├── venv/
│   └── [virtual_environment_files]
│
└── .env
│
└── requirements.txt

4. Install dependencies

    1. pip install -r requirements.txt


5. Refer the sample of ./dot_env_sample.txt structure to create .env file


# checksum generate running instructions

1. Go to scripts(your added directory name) directory

2. Create script file there (3.11.1-LN-588-checksum-generate-and-duplicate-checking.py)

3. Run python script
        - python3 3.11.1-LN-588-checksum-generate-and-duplicate-checking.py

# AFTER RUN

- This script takes 10 files {ObjectSatus:Active, image,video,other(1,2,6), "checksum": notexist } files at a time and generate checksum and marked duplicates until all

- This script take less time to generate checksum for images,and pdf for 1000 files. After you run if you got error please check below

        - check logs/media_process.log file. finally you can see this log means script run successfully.

                EXAMPLE:
                2024-10-03 16:37:05,448 - media_process - INFO - Batch 55 processed and updated successfully.
                2024-10-03 16:37:05,448 - media_process - INFO - Temporary files in ./tempFiles/temp_20241003_163705_dfee3278-205e-414d-81ed-b23e9363f699 have been removed successfully.
                2024-10-03 16:37:05,449 - media_process - INFO - Fetching metadata with filter: {'objectStatus': 2, 'checksum': {'$exists': False}, 'objectType': {'$in': [1, 2, 6]}}
                2024-10-03 16:37:05,452 - media_process - INFO - Successfully fetched metadata batch 56 with 0 items
                2024-10-03 16:37:05,452 - media_process - INFO - No more metadata to fetch.

- Verify checksum generate for all with Database





