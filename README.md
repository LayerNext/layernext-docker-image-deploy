# LayerNext Community Version

The LayerNext Community Version is a free version of the LayerNext platform intended for individuals working on smaller, proof of concept projects. It can be self-hosted with a Docker container on your own server.

[License information](https://www.layernext.ai/community-license)


This includes a complete suite of tools such as:
- Data Lake
- Annotation Studio
- Dataset Manager
  - Unlimited Annotations
  - Unlimited Datasets
  - Integration with major cloud storage providers including AWS S3, Google, and Azure
  - Up to 10,000 files in the DataLake
  - Limited number of user accounts

> **Note:** Local storage support will be coming soon.

## Prerequisites
To store your computer vision data, we support the major cloud storage providers such as AWS S3, Google, and Azure.

## Server requirements
Ensure you have a server that meets the following specifications:

### Hardware
- **CPUs:** At least 2
- **Ram:** 4GB+
- **Disk:** 50GB+ of free space

### Software
- Ubuntu 64-bit (x86) - 18.04 and above
- Sudo enabled user who can login via SSH

### Networking
- Public and static IP address for the server (e.g., 54.83.168.141)
- HTTP and HTTPS ports open (TCP ports 80 and 443)
- SSH enabled (TCP port 22)

When creating a VM from a cloud service provider, you typically have the option to enable HTTP and HTTPS. However, you can adjust settings later with documentation by each provider:
- [EC2 on AWS Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/get-set-up-for-amazon-ec2.html)
- [VM on Google Cloud](https://cloud.google.com/firewall/docs/using-firewalls)
- [VM on Azure Cloud](https://learn.microsoft.com/en-us/azure/virtual-network/tutorial-filter-network-traffic)

## Installation Steps

For detailed installation steps, please visit the official LayerNext Community Version installation guide:

[LayerNext Community Version Installation Guide](https://www.layernext.ai/community)

Follow the instructions on the provided webpage to ensure successful installation of the LayerNext Community Version on your server.
