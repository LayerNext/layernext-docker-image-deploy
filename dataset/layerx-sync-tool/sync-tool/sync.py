"""
Copyright (c) 2022 ZOOMi Technologies Inc.

all rights reserved.

This source code is licensed under the license found in the
LICENSE file in the root directory of this source tree.

maintainers : isuruj

Script to download images and text files to local machine and generate path file

Utilizes layernext python sdk
"""

import sys
import layernext

# IP+port or url of the server # (eg: https://qa.deepzea.com)
serverUrl = 'http://localhost:8080' # default

# get variables from cmd
cmd_args = sys.argv

if(len(cmd_args)!=6):
    print(f"Required 5 arguments but recived {len(cmd_args)-1}")
    print("arguments: <url> <version ID> <format type> <api key> <secret>")
    quit()

# get server url
serverUrl = cmd_args[1]

versionId = cmd_args[2]

exportType = cmd_args[3]

api_key = cmd_args[4]
secret = cmd_args[5]   


client = layernext.LayerNextClient(api_key, secret, serverUrl)

"""
@param version_id - dataset version id
@param export_type - dataset export format
"""
client.download_dataset(versionId, exportType)
quit()
