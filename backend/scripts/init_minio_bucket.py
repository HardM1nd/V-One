import os
import time

import boto3
from botocore.exceptions import BotoCoreError, ClientError


bucket_name = os.environ["MINIO_BUCKET_NAME"]
client = boto3.client(
    "s3",
    endpoint_url=os.environ["AWS_S3_ENDPOINT_URL"],
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    region_name=os.environ.get("MINIO_REGION", "us-east-1"),
)
last_error = None

for _ in range(60):
    try:
        existing_buckets = client.list_buckets()["Buckets"]
        if not any(bucket["Name"] == bucket_name for bucket in existing_buckets):
            client.create_bucket(Bucket=bucket_name)
        print(f"MinIO bucket {bucket_name!r} is ready.")
        break
    except (BotoCoreError, ClientError) as error:
        last_error = error
        time.sleep(2)
else:
    raise RuntimeError(f"Could not initialize MinIO bucket {bucket_name!r}.") from last_error
